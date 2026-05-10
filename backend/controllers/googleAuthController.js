import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

const verifyGoogleAccessToken = async (accessToken) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Google authentication is not configured');
    }

    const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Invalid Google access token: ' + errorText);
    }

    const data = await response.json();

    if (!data.email) {
        throw new Error('Google account has no email');
    }

    if (!data.email_verified) {
        throw new Error('Google email is not verified');
    }

    return {
        googleId: data.sub,
        email: data.email,
        username: data.name,
        profileImage: data.picture,
        emailVerified: data.email_verified,
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

        const googleUser = await verifyGoogleAccessToken(credential);

        if (!googleUser.emailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Google email is not verified',
                statusCode: 400,
            });
        }

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
        if (error.message.startsWith('Invalid Google access token')) {
            return res.status(401).json({
                success: false,
                error: 'Google authentication failed. Please try again.',
                statusCode: 401,
            });
        }
        next(error);
    }
};
