import express from 'express';
import { 
    getDashboard,
    getDetailedInsights
} from '../controllers/progressController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/insights', getDetailedInsights);

export default router;
