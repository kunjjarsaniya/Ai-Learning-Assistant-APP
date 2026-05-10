import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Generate JWT token 
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    })
};


// @desc    Register new user 
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Checkif user exists
        const userExists = await User.findOne({ $or: [{ email }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error:
                    userExists.email === email
                        ? "Email already registered"
                        : "Username already taken",
                statusCode: 400,
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token,
            },
            message: "User registered successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Login user 
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide email and password",
                statusCode: 400,
            });
        }

        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
                statusCode: 401,
            });
        }

        // Check password 
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials",
                statusCode: 401,
            });
        }


        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                },
                token,
            },
            message: "Login successful"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            message: "User profile retrieved successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (email) updates.email = email;
        if (profileImage) updates.profileImage = profileImage;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
            message: "Profile updated successfully"
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Please provide current and new password",
                statusCode: 400,
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                statusCode: 404,
            });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Current password is incorrect",
                statusCode: 401,
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Please provide an email address",
                statusCode: 400,
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            // For security, return success even if user doesn't exist
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive a password reset link",
            });
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { id: user._id, purpose: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, resetToken);
            console.log(`Password reset email sent to: ${email}`);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email",
            // Remove this in production - only for development/testing
            ...(process.env.NODE_ENV !== 'production' && { resetToken }),
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide token and new password",
                statusCode: 400,
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: "Invalid or expired reset token",
                statusCode: 400,
            });
        }

        // Check if token is for password reset
        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({
                success: false,
                error: "Invalid reset token",
                statusCode: 400,
            });
        }

        // Find user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
                statusCode: 404,
            });
        }

        // Update password
        user.password = password;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully. Please login with your new password",
        });

    } catch (error) {
        next(error);
    }
};
