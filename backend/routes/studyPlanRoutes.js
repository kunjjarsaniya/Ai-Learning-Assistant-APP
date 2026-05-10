import express from 'express';
import {
    generatePlan,
    getStudyPlans,
    getStudyPlanById,
    deleteStudyPlan,
    updateTopicStatus
} from '../controllers/studyPlanController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
    .get(getStudyPlans)
    .post(generatePlan);

router.route('/:id')
    .get(getStudyPlanById)
    .delete(deleteStudyPlan);

router.route('/:id/topics/:topicId')
    .put(updateTopicStatus);

export default router;
