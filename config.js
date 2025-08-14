// Configuration file for EduGhana platform
module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    
    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    JWT_EXPIRES_IN: '24h',
    
    // Weather API Configuration
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || 'demo-key',
    WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    
    // Database Configuration
    DB_PATH: process.env.DB_PATH || './database.sqlite',
    
    // Security Configuration
    BCRYPT_ROUNDS: 10,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development'
};
