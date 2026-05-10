import Document from '../models/Document.js';
import { findRelevantChunks } from '../utils/textChunker.js';
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";

// @desc    Generate flashcards from documents
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(404).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // Generate flashcards using Gemini
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );

        // Save to database
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Generate quiz from documents
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(404).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // Generate quiz using Gemini
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // Save to database
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Generate document summary
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        // console.log('[generateSummary] Request received:', { documentId, userId: req.user._id });

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        // console.log('[generateSummary] Document found:', {
        //     id: document?._id,
        //     title: document?.title,
        //     status: document?.status,
        //     hasExtractedText: !!document?.extractedText,
        //     extractedTextLength: document?.extractedText?.length || 0
        // });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        if (!document.extractedText || document.extractedText.trim() === '') {
            // console.error('[generateSummary] No extracted text available');
            return res.status(400).json({
                success: false,
                error: 'Document has no extracted text. Please re-upload the document.',
                statusCode: 400
            });
        }

        // Generate summary using Gemini
        // console.log('[generateSummary] Calling Gemini API...');
        const summary = await geminiService.generateSummary(document.extractedText);
        // console.log('[generateSummary] Summary generated successfully');

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary,
            },
            message: 'Summary generated successfully'
        })

        // Save to database
        // document.summary = summary;
        // await document.save();
    } catch (error) {
        // console.error('[generateSummary] Error:', error);
        // console.error('[generateSummary] Error stack:', error.stack);
        next(error);
    }
};


// @desc    Chat with document
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // Find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        // Get or create chat History 
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id,
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                message: []
            });
        }

        // Ensure message array exists (singular 'message' to match the model)
        if (!chatHistory.message) {
            chatHistory.message = [];
        }

        // Generate chat response using Gemini
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        // Create new messages
        const newMessages = [
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: [],
            },
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices,
            }
        ];

        // Add new messages to the message array (singular 'message')
        chatHistory.message.push(...newMessages);
        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Response generated successfully'
        })
    } catch (error) {
        next(error);
    }
};


// @desc    Explain concept from document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and concept',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // Find relevant chunks for the concept
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        // Generate explanation using Gemini
        const explanation = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex),
            },
            message: 'Explanation generated successfully'
        })
    } catch (error) {
        next(error);
    }
};


// @desc    Get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
// @access  Private
export const getChatHistory = async (req, res, next) => {
    try {

        const { documentId } = req.params;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        // Get or create chat History 
        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId,
        }).select('message');  // Only retrieve the message array

        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No chat history found for this document'
            });
        }

        // Return the chat history
        res.status(200).json({
            success: true,
            data: chatHistory.message,
            message: 'Chat history retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};