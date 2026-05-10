import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    profileImage: {
        type: String,
        default: null
    },
    lastActivityDate: {
        type: Date,
        default: null
    },
    currentStreak: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


// Hash password before saving 
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Update streak based on activity
userSchema.methods.updateStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.lastActivityDate) {
        // First time activity
        this.lastActivityDate = today;
        this.currentStreak = 1;
        return;
    }

    const lastActivity = new Date(this.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const diffTime = today - lastActivity;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day, no change
        return;
    } else if (diffDays === 1) {
        // Consecutive day, increment streak
        this.currentStreak += 1;
        this.lastActivityDate = today;
    } else {
        // Missed days, reset streak
        this.currentStreak = 1;
        this.lastActivityDate = today;
    }
};


const User = mongoose.model('User', userSchema)

export default User;