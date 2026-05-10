import express from 'express';
import {
    getFlashcards,
    getAllFlashcardSets as getAllFlashcards,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet
} from '../controllers/flashcardController.js';
import protect from '../middleware/auth.js';

import { trackActivity } from '../middleware/activityTracker.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllFlashcards);
router.post('/:cardId/review', trackActivity, reviewFlashcard);
router.put('/:cardId/star', toggleStarFlashcard);
router.get('/:documentId', getFlashcards);
router.delete('/:id', deleteFlashcardSet);

export default router;  