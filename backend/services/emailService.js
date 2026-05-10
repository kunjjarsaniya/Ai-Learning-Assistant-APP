/**
 * Email Service
 * Handles sending emails for authentication flows
 * Currently using console logging - integrate with email provider (SendGrid, AWS SES, etc.) in production
 */

/**
 * Send a password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - JWT reset token
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        // TODO: Integrate with actual email service (SendGrid, AWS SES, Nodemailer, etc.)
        // For now, just log the reset link
        
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        
        console.log('========================================');
        console.log('📧 PASSWORD RESET EMAIL');
        console.log('========================================');
        console.log(`To: ${email}`);
        console.log(`Reset Link: ${resetLink}`);
        console.log(`Token: ${resetToken}`);
        console.log('========================================');
        
        // In production, replace with actual email sending:
        /*
        await emailProvider.send({
            to: email,
            subject: 'Password Reset Request - AI Learning Assistant',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
        */
        
        return Promise.resolve();
    } catch (error) {
        console.error('[EMAIL SERVICE] Error sending password reset email:', error);
        throw error;
    }
};

/**
 * Send a welcome email to new users
 * @param {string} email - Recipient email address
 * @param {string} username - Username
 * @returns {Promise<void>}
 */
export const sendWelcomeEmail = async (email, username) => {
    try {
        console.log('========================================');
        console.log('📧 WELCOME EMAIL');
        console.log('========================================');
        console.log(`To: ${email}`);
        console.log(`Username: ${username}`);
        console.log('========================================');
        
        return Promise.resolve();
    } catch (error) {
        console.error('[EMAIL SERVICE] Error sending welcome email:', error);
        throw error;
    }
};
