import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate using token from header OR query parameter
// This is specifically for routes that need to work with iframes (which can't set custom headers)
const authQueryToken = async (req, res, next) => {
    let token;

    // Check for token in Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Fallback to query parameter (for iframe compatibility)
    else if (req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route - no token provided',
            statusCode: 401
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
                statusCode: 401
            });
        }

        next();
    } catch (error) {
        // console.error('Auth error:', error.message);
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route - invalid token',
            statusCode: 401
        });
    }
};

export default authQueryToken;
