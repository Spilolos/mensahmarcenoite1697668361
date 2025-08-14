# EduGhana - Interactive Learning Platform

A comprehensive educational platform featuring interactive quizzes with instant feedback, user authentication, CRUD operations, progress tracking, and third-party API integration.

## 🚀 Features

### 🔐 User Authentication
- **User Registration** with email validation
- **Secure Login** with JWT tokens
- **Password Hashing** using bcrypt
- **Session Management** with automatic token refresh
- **Protected Routes** for authenticated users

### 🎯 Interactive Quizzes
- **5 questions per subject** with comprehensive coverage
- **Instant feedback** on correct/incorrect answers
- **Detailed explanations** for each question
- **Progress tracking** with visual progress bar
- **Retry functionality** for incorrect answers
- **Next button** to advance through questions
- **Final score display** with retry option
- **Automatic result saving** to user profile

### 📚 Subject Coverage
1. **Mathematics** - Numbers, Algebra, Geometry, Percentages, Simplification
2. **Science** - Biology, Physics, Chemistry, Chemical formulas, Newton's Laws
3. **English & Literature** - Grammar, Comprehension, Literature, Parts of speech, Verb tenses
4. **Ghanaian History** - Pre-colonial states, Colonial era, Independence, Historical facts

### 💾 CRUD Operations
- **Study Notes Management**
  - Create personal study notes
  - Read and organize notes by subject
  - Update existing notes
  - Delete notes with confirmation
- **Quiz Results Tracking**
  - Save quiz results automatically
  - View historical performance
  - Delete individual results
  - Filter by subject

### 🌤️ Third-Party API Integration
- **OpenWeatherMap API** integration
- **Weather-based study tips** for optimal learning environment
- **Real-time weather data** for any city
- **Personalized study recommendations** based on weather conditions

### 📊 Dashboard & Analytics
- **Personal Dashboard** with learning statistics
- **Progress Visualization** with charts and metrics
- **Recent Quiz Results** display
- **Study Notes Overview**
- **Success Rate Calculation**
- **Subject-wise Performance Tracking**

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Clean, modern interface** with Tailwind CSS
- **Smooth animations** and hover effects
- **Accessible navigation** between subjects
- **Professional color scheme** with green branding
- **Modal dialogs** for enhanced user experience

## 🏗️ Architecture

### Backend (Node.js + Express)
```
server.js              # Main server file
config.js              # Configuration management
package.json           # Dependencies and scripts
```

### Frontend (HTML + CSS + JavaScript)
```
public/
├── index.html         # Main landing page
├── dashboard.html     # User dashboard
├── math.html          # Mathematics subject
├── science.html       # Science subject
├── english.html       # English subject
├── history.html       # History subject
├── auth.js            # Authentication logic
├── dashboard.js       # Dashboard functionality
└── quiz.js            # Quiz system
```

### Database (SQLite)
- **Users table** - User accounts and authentication
- **Quiz Results table** - Quiz performance tracking
- **Study Notes table** - Personal study notes
- **User Progress table** - Learning progress tracking

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd edughana-platform
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Weather API Key (OpenWeatherMap)
# Get your free API key from: https://openweathermap.org/api
WEATHER_API_KEY=your-weather-api-key-here

# Database Configuration
DB_PATH=./database.sqlite
```

### 3. Get Weather API Key
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key
4. Add it to your `.env` file

### 4. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "student123",
  "email": "student@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "student123",
  "password": "password123"
}
```

### Quiz Results Endpoints

#### Save Quiz Result
```http
POST /api/quiz-results
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Mathematics",
  "score": 4,
  "total_questions": 5
}
```

#### Get Quiz Results
```http
GET /api/quiz-results?subject=Mathematics
Authorization: Bearer <token>
```

#### Delete Quiz Result
```http
DELETE /api/quiz-results/:id
Authorization: Bearer <token>
```

### Study Notes Endpoints

#### Create Note
```http
POST /api/study-notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Mathematics",
  "title": "Algebra Basics",
  "content": "Linear equations and solving for x..."
}
```

#### Get Notes
```http
GET /api/study-notes?subject=Mathematics
Authorization: Bearer <token>
```

#### Update Note
```http
PUT /api/study-notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Mathematics",
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Note
```http
DELETE /api/study-notes/:id
Authorization: Bearer <token>
```

### Third-Party API Integration

#### Weather Information
```http
GET /api/weather/:city
```

Example response:
```json
{
  "city": "Accra",
  "temperature": 28,
  "description": "partly cloudy",
  "humidity": 75,
  "studyTip": "It's warm! Stay hydrated and take regular breaks during your study session."
}
```

### Statistics Endpoints

#### User Statistics
```http
GET /api/stats
Authorization: Bearer <token>
```

#### User Profile
```http
GET /api/profile
Authorization: Bearer <token>
```

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** on all endpoints
- **SQL Injection Prevention** with parameterized queries

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

### Quiz Results Table
```sql
CREATE TABLE quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Study Notes Table
```sql
CREATE TABLE study_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### User Progress Table
```sql
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT NOT NULL,
  questions_completed INTEGER DEFAULT 0,
  last_question INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure proper `CORS_ORIGIN`
- Set up database backups
- Use HTTPS in production

## 🧪 Testing

### Manual Testing
1. **Authentication Flow**
   - Register a new user
   - Login with credentials
   - Verify token persistence
   - Test logout functionality

2. **Quiz Functionality**
   - Take quizzes in different subjects
   - Verify score calculation
   - Check result saving
   - Test retry functionality

3. **CRUD Operations**
   - Create study notes
   - Edit existing notes
   - Delete notes
   - Verify data persistence

4. **Weather API**
   - Enter different cities
   - Verify weather data
   - Check study tips

### API Testing
Use tools like Postman or curl to test all endpoints:
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'
```

## 🔧 Customization

### Adding New Subjects
1. Create new HTML file following existing pattern
2. Add quiz data with 5 questions
3. Update navigation links
4. Add subject card to index.html

### Modifying Questions
1. Edit the `window.quizData` object in subject files
2. Ensure each question has 4 options with one marked `correct: true`
3. Add helpful explanations

### Styling Changes
- Modify Tailwind CSS classes in HTML files
- Update color scheme in CSS variables
- Adjust responsive breakpoints

### Adding New API Endpoints
1. Add route in `server.js`
2. Implement authentication middleware
3. Add proper error handling
4. Update frontend to use new endpoint

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🌟 Educational Benefits

- **Immediate feedback** reinforces learning
- **Retry mechanism** encourages persistence
- **Progress tracking** motivates completion
- **Detailed explanations** enhance understanding
- **Personalized study notes** improve retention
- **Weather-based tips** optimize study environment
- **Multiple subjects** provide comprehensive coverage
- **Mobile-friendly** enables learning anywhere

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

© 2025 EduGhana. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Test the application thoroughly
- Ensure all dependencies are installed

---

**Ready to deploy!** The application is production-ready with proper security, authentication, and comprehensive features for an enhanced learning experience.
