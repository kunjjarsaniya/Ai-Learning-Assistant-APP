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
        throw new Error('Google authentication is not configured');
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Try verifying as an ID token (JWT from GoogleLogin / One Tap credential flow)
    try {
        const ticket = await client.verifyIdToken({ idToken: credential });
        const payload = ticket.getPayload();
        if (!payload.email) {
            throw new Error('Google account has no email');
        }
        if (!payload.email_verified) {
            throw new Error('Google email is not verified');
        }
        return {
            googleId: payload.sub,
            email: payload.email,
            username: payload.name || null,
            profileImage: payload.picture || null,
            emailVerified: payload.email_verified,
        };
    } catch (idError) {
        // If it's our own custom error (email/verification), re-throw it
        if (idError.message === 'Google account has no email' || idError.message === 'Google email is not verified') {
            throw idError;
        }
    }

    // Fallback: try as an access token (from useGoogleLogin implicit flow)
    let tokenInfo;
    try {
        tokenInfo = await client.getTokenInfo(credential);
    } catch (tokenError) {
        throw new Error('Invalid Google credential');
    }

    if (!tokenInfo.email) {
        throw new Error('Google account has no email');
    }
    if (!tokenInfo.email_verified) {
        throw new Error('Google email is not verified');
    }

    let name = null;
    let picture = null;
    try {
        client.setCredentials({ access_token: credential });
        const response = await client.request({
            url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });
        name = response.data.name || null;
        picture = response.data.picture || null;
    } catch (userInfoError) {
        // Non-critical, proceed with defaults
    }

    return {
        googleId: tokenInfo.sub || credential,
        email: tokenInfo.email,
        username: name,
        profileImage: picture,
        emailVerified: tokenInfo.email_verified || false,
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
            message: user.email ? 'Logged in successfully' : 'Account created successfully',
        });
    } catch (error) {
        if (error.message === 'Google authentication is not configured') {
            return res.status(501).json({
                success: false,
                error: error.message,
                statusCode: 501,
            });
        }
        if (error.message === 'Invalid Google credential') {
            return res.status(401).json({
                success: false,
                error: 'Google authentication failed. Please try again.',
                statusCode: 401,
            });
        }
        if (error.message === 'Google account has no email' || error.message === 'Google email is not verified') {
            return res.status(400).json({
                success: false,
                error: error.message,
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
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed. Please try again.',
            statusCode: 500,
        });
    }
};
