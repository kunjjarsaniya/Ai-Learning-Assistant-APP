import express from 'express';
import {
    generateMindMap,
    getMindMaps,
    getMindMapById,
    deleteMindMap
} from '../controllers/mindMapController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
    .get(getMindMaps)
    .post(generateMindMap);

router.route('/:id')
    .get(getMindMapById)
    .delete(deleteMindMap);

export default router;
