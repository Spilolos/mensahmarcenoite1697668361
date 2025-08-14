# Quick Setup Guide - EduGhana Learning Platform

## 🚀 Quick Start (Windows)

### Option 1: Using the Batch File (Recommended)
1. **Double-click** `start.bat` in the project folder
2. The script will automatically:
   - Check if Node.js is installed
   - Install dependencies
   - Start the server
3. Open your browser and go to: `http://localhost:3000`

### Option 2: Manual Setup
1. **Install Node.js** from [https://nodejs.org/](https://nodejs.org/)
2. **Open Command Prompt** in the project folder
3. **Install dependencies**: `npm install`
4. **Start the server**: `npm start`
5. **Open browser**: `http://localhost:3000`

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file in the root directory:
```env
PORT=3000
JWT_SECRET=your-secret-key-here
WEATHER_API_KEY=your-weather-api-key
```

### Weather API Key (Optional)
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get API key
4. Add to `.env` file

## 📱 Using the Application

### First Time Setup
1. **Register** a new account
2. **Login** with your credentials
3. **Explore** the dashboard
4. **Take quizzes** in different subjects
5. **Create study notes**
6. **Check weather** for study tips

### Features Available
- ✅ **User Authentication** (Register/Login)
- ✅ **Interactive Quizzes** (5 questions per subject)
- ✅ **Study Notes** (Create, Edit, Delete)
- ✅ **Progress Tracking** (Statistics & Analytics)
- ✅ **Weather Integration** (Study environment tips)
- ✅ **Responsive Design** (Works on all devices)

## 🎯 Subjects Available
- **Mathematics** - Numbers, Algebra, Geometry
- **Science** - Biology, Physics, Chemistry
- **English** - Grammar, Comprehension, Literature
- **History** - Ghanaian History

## 🛠️ Troubleshooting

### Node.js Not Found
- Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
- Restart your computer after installation

### Port Already in Use
- Change the port in `.env` file: `PORT=3001`
- Or kill the process using port 3000

### Database Issues
- The application creates its own SQLite database
- No additional setup required

### Weather API Not Working
- Get a free API key from OpenWeatherMap
- Add it to your `.env` file
- Or use the application without weather features

## 📞 Support
- Check the main `README.md` for detailed documentation
- All features are fully functional out of the box
- No external services required for basic functionality

---

**Ready to learn!** 🎓
