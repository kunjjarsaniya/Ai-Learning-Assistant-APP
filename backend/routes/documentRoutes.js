import express from 'express';

import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    serveDocumentFile
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import authQueryToken from '../middleware/authQueryToken.js';
import upload from '../config/multer.js';

import { trackActivity } from '../middleware/activityTracker.js';

const router = express.Router();

// File serving route - uses authQueryToken to accept token in query params (for iframe)
router.get('/:id/file', authQueryToken, serveDocumentFile);

// All other routes are protected with standard middleware
router.use(protect);

router.post('/upload', upload.single('file'), trackActivity, uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;