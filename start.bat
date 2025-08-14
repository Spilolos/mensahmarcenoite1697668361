@echo off
echo EduGhana Learning Platform
echo ========================
echo.
echo Starting the application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo.
    echo Please install npm or reinstall Node.js.
    echo.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start the application
echo Starting EduGhana server...
echo.
echo The application will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
npm start

pause
