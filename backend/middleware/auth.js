import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const protect = async (req, res, next) => {
    let token

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        // Check query param (for file streams/iframes)
        token = req.query.token;
    }

    if (token) {
        try {

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found',
                    statuCode: 401
                });
            }

            next();
        } catch (error) {
            // console.error('Auth middleware error:', error.message);

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token has expired',
                    statuCode: 401
                });
            }

            return res.status(401).json({
                success: false,
                error: 'Not authorized, token failed',
                statuCode: 401
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token',
            statuCode: 401
        });
    }
};

export default protect;