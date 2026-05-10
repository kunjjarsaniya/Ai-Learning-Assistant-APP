import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs';
import { Readable } from 'stream';
import mongoose from 'mongoose';

// Initialize GridFS Bucket
let gridfsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'documents'
    });
});


// @desc    Upload PDF document 
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }

        const { title } = req.body;

        if (!title) {
            // Delete uploaded file if no title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        // Create explicit GridFS write stream
        const filename = `${Date.now()}-${req.file.originalname}`;

        // console.log('[UPLOAD] Starting GridFS upload:', {
        //     filename,
        //     fileSize: req.file.size,
        //     mimetype: req.file.mimetype,
        //     bufferLength: req.file.buffer?.length
        // });

        if (!req.file.buffer || req.file.buffer.length === 0) {
            // console.error('[UPLOAD] ERROR: File buffer is empty!');
            return res.status(400).json({
                success: false,
                error: 'File buffer is empty',
                statusCode: 400
            });
        }

        const uploadStream = gridfsBucket.openUploadStream(filename, {
            contentType: req.file.mimetype
        });

        // Convert buffer to stream and pipe to GridFS
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);

        try {
            await new Promise((resolve, reject) => {
                bufferStream.pipe(uploadStream)
                    .on('error', (err) => {
                        // console.error('[UPLOAD] GridFS upload error:', err);
                        reject(err);
                    })
                    .on('finish', () => {
                        // console.log('[UPLOAD] GridFS upload finished:', uploadStream.id);
                        resolve();
                    });
            });

            // console.log('[UPLOAD] GridFS file ID:', uploadStream.id);
        } catch (uploadError) {
            // console.error('[UPLOAD] GridFS upload failed:', uploadError);
            return res.status(500).json({
                success: false,
                error: 'File upload to GridFS failed: ' + uploadError.message,
                statusCode: 500
            });
        }

        // Create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: `/api/documents/${uploadStream.id}/file`, // Virtual path pointing to new stream route
            gridFsId: uploadStream.id,
            fileSize: req.file.size,
            status: 'processing'
        });

        // Process PDF synchronously to ensure Vercel doesn't freeze execution
        try {
            await processPDF(document._id, req.file.buffer);
            // Re-fetch document to get updated status/data if needed, or just return the initial one
            // Ideally we return the updated document with 'ready' status
            const updatedDoc = await Document.findById(document._id);

            res.status(201).json({
                success: true,
                data: updatedDoc,
                message: 'Document uploaded and processed successfully'
            });
        } catch (pdfError) {
            // console.error('[UPLOAD] PDF parsing failed (non-critical):', pdfError.message);

            // Mark document as ready anyway - file is stored in GridFS
            await Document.findByIdAndUpdate(document._id, {
                status: 'ready',
                processingError: 'Text extraction unavailable on serverless'
            });

            const docReady = await Document.findById(document._id);

            res.status(201).json({
                success: true,
                data: docReady,
                warning: 'Upload successful. File viewing works, AI features may be limited.'
            });
        }

    } catch (error) {
        // No file cleanup needed for memory storage
        // if (req.file) {
        //     await fs.unlink(req.file.path).catch(() => { });
        // }
        next(error);
    }
};


// Helper function to process PDF
const processPDF = async (documentId, source) => {
    try {
        // console.log(`[processPDF] Starting processing for document ${documentId}`);
        // console.log(`[processPDF] Source buffer length: ${source?.length || 0} bytes`);

        const { text } = await extractTextFromPDF(source);

        // console.log(`[processPDF] Extracted text length: ${text?.length || 0} characters`);

        // Creating chunks
        const chunks = chunkText(text, 500, 50);

        // console.log(`[processPDF] Created ${chunks?.length || 0} chunks`);

        // Update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        // console.log(`[processPDF] Document ${documentId} processed successfully`);
    } catch (error) {
        // console.error(`[processPDF] Error processing document ${documentId}:`, {
        //     message: error.message,
        //     stack: error.stack,
        //     name: error.name
        // });

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed',
            processingError: error.message
        })
    }
}


// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const document = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: 'flashcardSets',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: {
                        $size: '$flashcardSets'
                    },
                    quizCount: {
                        $size: '$quizzes'
                    }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { updatedAt: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: document.length,
            data: document
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Get single documents with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            })
        }

        // Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });

        // Updates last accessed
        document.lastAccessed = Date.now();
        await document.save();

        // Combine document data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Delete file from GridFS
        if (document.gridFsId) {
            // await gridfsBucket.delete(document.gridFsId).catch(err => console.error("Error deleting from GridFS", err));
        } else {
            // Fallback for legacy files (still on disk?) - irrelevant for Vercel but good for cleanup
            await fs.promises.unlink(document.filePath).catch(() => { });
        }

        // Delete document
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Serve document file from GridFS
// @route   GET /api/documents/:id/file
// @access  Private (authQueryToken middleware)
export const serveDocumentFile = async (req, res, next) => {
    try {
        const paramId = req.params.id;
        // console.log(`[serveDocumentFile] Requested ID: ${paramId}`);

        let gridFsFileId;

        // First, try to find document by document ID
        try {
            const document = await Document.findById(paramId);
            if (document && document.gridFsId) {
                // console.log(`[serveDocumentFile] Found document, GridFS ID: ${document.gridFsId}`);
                gridFsFileId = document.gridFsId;
            }
        } catch (err) {
            // console.log(`[serveDocumentFile] Not a valid document ID, trying as GridFS ID directly`);
        }

        // If not found as document ID, try treating the param as GridFS ID directly
        if (!gridFsFileId) {
            try {
                gridFsFileId = new mongoose.Types.ObjectId(paramId);
                // console.log(`[serveDocumentFile] Using param as GridFS ID: ${gridFsFileId}`);
            } catch (err) {
                // console.error(`[serveDocumentFile] Invalid ID format: ${paramId}`);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid document or file ID'
                });
            }
        }

        // Check if file exists in GridFS before streaming
        const files = await gridfsBucket.find({ _id: gridFsFileId }).toArray();

        if (!files || files.length === 0) {
            // console.error(`[serveDocumentFile] File not found in GridFS: ${gridFsFileId}`);
            return res.status(404).json({
                success: false,
                error: 'File not found in storage'
            });
        }

        // console.log(`[serveDocumentFile] Streaming file: ${files[0].filename}`);

        // Create download stream
        const downloadStream = gridfsBucket.openDownloadStream(gridFsFileId);

        // Handle stream errors
        downloadStream.on('error', (err) => {
            // console.error('[serveDocumentFile] Stream error:', err);
            if (!res.headersSent) {
                return res.status(404).json({
                    success: false,
                    error: 'Error streaming file'
                });
            }
        });

        // Set appropriate headers
        res.set({
            'Content-Type': files[0].contentType || 'application/pdf',
            'Content-Length': files[0].length,
            'Cache-Control': 'public, max-age=31536000'
        });

        // Pipe the file to response
        downloadStream.pipe(res);

    } catch (error) {
        // console.error('[serveDocumentFile] Error:', error);
        next(error);
    }
};