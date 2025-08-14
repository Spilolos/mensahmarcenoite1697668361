const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const app = express();
const PORT = config.PORT;
const JWT_SECRET = config.JWT_SECRET;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS
});
app.use(limiter);

// Database setup
const db = new sqlite3.Database(config.DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )`);

    // Quiz results table
    db.run(`CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // User progress table
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject TEXT NOT NULL,
      questions_completed INTEGER DEFAULT 0,
      last_question INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Study notes table (CRUD operations)
    db.run(`CREATE TABLE IF NOT EXISTS study_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

      // Insert new user
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
        [username, email, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating user' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
        res.status(201).json({ 
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Quiz results CRUD operations
app.post('/api/quiz-results', authenticateToken, (req, res) => {
  const { subject, score, total_questions } = req.body;
  const userId = req.user.id;

  if (!subject || score === undefined || !total_questions) {
    return res.status(400).json({ error: 'Subject, score, and total questions are required' });
  }

  db.run('INSERT INTO quiz_results (user_id, subject, score, total_questions) VALUES (?, ?, ?, ?)',
    [userId, subject, score, total_questions], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error saving quiz result' });
    }
    res.status(201).json({ 
      message: 'Quiz result saved',
      id: this.lastID 
    });
  });
});

app.get('/api/quiz-results', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { subject } = req.query;

  let query = 'SELECT * FROM quiz_results WHERE user_id = ?';
  let params = [userId];

  if (subject) {
    query += ' AND subject = ?';
    params.push(subject);
  }

  query += ' ORDER BY completed_at DESC';

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/quiz-results/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get('SELECT * FROM quiz_results WHERE id = ? AND user_id = ?', [id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Quiz result not found' });
    }
    res.json(result);
  });
});

app.delete('/api/quiz-results/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run('DELETE FROM quiz_results WHERE id = ? AND user_id = ?', [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Quiz result not found' });
    }
    res.json({ message: 'Quiz result deleted' });
  });
});

// Study notes CRUD operations
app.post('/api/study-notes', authenticateToken, (req, res) => {
  const { subject, title, content } = req.body;
  const userId = req.user.id;

  if (!subject || !title || !content) {
    return res.status(400).json({ error: 'Subject, title, and content are required' });
  }

  db.run('INSERT INTO study_notes (user_id, subject, title, content) VALUES (?, ?, ?, ?)',
    [userId, subject, title, content], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating study note' });
    }
    res.status(201).json({ 
      message: 'Study note created',
      id: this.lastID 
    });
  });
});

app.get('/api/study-notes', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { subject } = req.query;

  let query = 'SELECT * FROM study_notes WHERE user_id = ?';
  let params = [userId];

  if (subject) {
    query += ' AND subject = ?';
    params.push(subject);
  }

  query += ' ORDER BY updated_at DESC';

  db.all(query, params, (err, notes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(notes);
  });
});

app.get('/api/study-notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get('SELECT * FROM study_notes WHERE id = ? AND user_id = ?', [id, userId], (err, note) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!note) {
      return res.status(404).json({ error: 'Study note not found' });
    }
    res.json(note);
  });
});

app.put('/api/study-notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { subject, title, content } = req.body;
  const userId = req.user.id;

  if (!subject || !title || !content) {
    return res.status(400).json({ error: 'Subject, title, and content are required' });
  }

  db.run('UPDATE study_notes SET subject = ?, title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [subject, title, content, id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Study note not found' });
    }
    res.json({ message: 'Study note updated' });
  });
});

app.delete('/api/study-notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run('DELETE FROM study_notes WHERE id = ? AND user_id = ?', [id, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Study note not found' });
    }
    res.json({ message: 'Study note deleted' });
  });
});

// Third-party API integration - OpenWeatherMap for educational context
app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const apiKey = config.WEATHER_API_KEY;
    
    // Using OpenWeatherMap API for educational purposes (weather affects study environment)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const weatherData = {
      city: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      studyTip: getStudyTip(response.data.main.temp, response.data.weather[0].main)
    };

    res.json(weatherData);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Weather service unavailable' });
    }
  }
});

function getStudyTip(temperature, weather) {
  if (temperature < 15) {
    return "It's cool outside! Perfect weather for focused studying. Consider a warm drink.";
  } else if (temperature > 25) {
    return "It's warm! Stay hydrated and take regular breaks during your study session.";
  } else {
    return "Comfortable temperature for studying. Great conditions for learning!";
  }
}

// User progress tracking
app.post('/api/progress', authenticateToken, (req, res) => {
  const { subject, questions_completed, last_question } = req.body;
  const userId = req.user.id;

  db.run(`INSERT OR REPLACE INTO user_progress (user_id, subject, questions_completed, last_question, updated_at) 
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [userId, subject, questions_completed, last_question], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error updating progress' });
    }
    res.json({ message: 'Progress updated' });
  });
});

app.get('/api/progress', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { subject } = req.query;

  let query = 'SELECT * FROM user_progress WHERE user_id = ?';
  let params = [userId];

  if (subject) {
    query += ' AND subject = ?';
    params.push(subject);
  }

  db.all(query, params, (err, progress) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(progress);
  });
});

// User profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT id, username, email, created_at, last_login FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Statistics
app.get('/api/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(`
    SELECT 
      COUNT(DISTINCT subject) as subjects_studied,
      SUM(score) as total_score,
      SUM(total_questions) as total_questions,
      COUNT(*) as quizzes_taken
    FROM quiz_results 
    WHERE user_id = ?
  `, [userId], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(stats);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`EduGhana server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});
