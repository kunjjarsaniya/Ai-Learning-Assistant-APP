import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js'
import { googleAuth } from '../controllers/googleAuthController.js';

import protect from '../middleware/auth.js'
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../utils/validationSchemas.js';

const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working' });
});

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;