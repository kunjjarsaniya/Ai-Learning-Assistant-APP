import dotenv from 'dotenv';

// Only load .env in development (Vercel injects env vars in production)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import flashcardRoutes from './routes/flashcardRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import studyPlanRoutes from './routes/studyPlanRoutes.js'
import mindMapRoutes from './routes/mindMapRoutes.js'

// ES6 module _dirname alternative
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Initialize express app
const app = express();

// Connect to MongoDB (standard Node.js, not serverless)
connectDB();

// Middleware to handle CORS
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(_dirname, 'uploads')));

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Learning Assistant API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Debug endpoint to check configuration
app.get('/health', (req, res) => {
    const mongoStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.status(200).json({
        success: true,
        mongodb: statusMap[mongoStatus] || 'unknown',
        env: {
            hasMongoUri: !!process.env.MONGO_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            hasFrontendUrl: !!process.env.FRONTEND_URL,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/flashcards', flashcardRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/study-plans', studyPlanRoutes)
app.use('/api/mind-maps', mindMapRoutes)



app.use(errorHandler);



// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        statusCode: 404
    });
})

// Start server (only in local development)
// const PORT = process.env.PORT || 8000;

// Start server (Render deployment)
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    // console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});