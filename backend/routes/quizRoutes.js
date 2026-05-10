import express from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

import { trackActivity } from '../middleware/activityTracker.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/quiz/:id', getQuizById);
router.get('/:documentId', getQuizzes);
router.post('/:id/submit', trackActivity, submitQuiz);
router.get('/:id/results', getQuizResults);
router.delete('/:id', deleteQuiz);

export default router;