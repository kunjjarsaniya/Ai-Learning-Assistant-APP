import User from '../models/User.js';

/**
 * Middleware to track user activity and update streak
 * Should be placed AFTER authMiddleware so req.user is available
 */
export const trackActivity = async (req, res, next) => {
    try {
        // Skip if no user (shouldn't happen if protected, but safe guard)
        if (!req.user || !req.user._id) {
            return next();
        }

        const user = await User.findById(req.user._id);

        if (user) {
            // Update streak logic is encapsulated in the model
            user.updateStreak();
            await user.save({ validateBeforeSave: false });
        }

        next();
    } catch (error) {
        // console.error('Error tracking activity:', error);
        // Don't block the request if tracking fails
        next();
    }
};
