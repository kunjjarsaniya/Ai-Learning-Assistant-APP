import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

const verifyGoogleCredential = async (credential) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Google auth not configured');
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let ticket;
    try {
        ticket = await client.verifyIdToken({ idToken: credential });
    } catch (error) {
        throw new Error('Invalid Google credential: ' + error.message);
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error('Google account has no email');
    }
    if (!payload.email_verified) {
        throw new Error('Google email not verified');
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        username: payload.name || null,
        profileImage: payload.picture || null,
        emailVerified: payload.email_verified,
    };
};

export const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                error: 'Google credential is required',
                statusCode: 400,
            });
        }

        const googleUser = await verifyGoogleCredential(credential);

        let user = await User.findOne({ email: googleUser.email });

        if (user) {
            user.profileImage = user.profileImage || googleUser.profileImage;
            await user.save({ validateBeforeSave: false });
        } else {
            const baseUsername = googleUser.username
                ? googleUser.username.replace(/\s+/g, '').toLowerCase()
                : googleUser.email.split('@')[0];

            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                username,
                email: googleUser.email,
                password: `google_${googleUser.googleId}_${Date.now()}`,
                profileImage: googleUser.profileImage,
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
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
            message: 'Logged in successfully',
        });
    } catch (error) {
        console.error('Google auth error:', {
            message: error.message,
            name: error.name,
            code: error.code,
        });

        if (error.message === 'Google auth not configured') {
            return res.status(501).json({
                success: false,
                error: 'Google authentication is not configured',
                statusCode: 501,
            });
        }
        if (error.message.startsWith('Invalid Google credential')) {
            return res.status(401).json({
                success: false,
                error: error.message,
                statusCode: 401,
            });
        }
        if (error.message === 'Google account has no email' || error.message === 'Google email not verified') {
            return res.status(400).json({
                success: false,
                error: error.message,
                statusCode: 400,
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                statusCode: 400,
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                error: Object.values(error.errors).map(val => val.message).join(', '),
                statusCode: 400,
            });
        }

        res.status(500).json({
            success: false,
            error: 'SERVER_ERROR: ' + error.message,
            statusCode: 500,
        });
    }
};
