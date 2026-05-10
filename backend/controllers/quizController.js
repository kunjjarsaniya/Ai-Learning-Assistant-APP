import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';

// @desc    Get all quizzes for a document
// @route   GET /api/quizzes/:documentId
// @access  Private
export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/quiz/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
    try {
        // console.log('Submit Quiz Body:', JSON.stringify(req.body, null, 2));
        // console.log('Submit Quiz ID:', req.params.id);

        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            // console.error('Submit Quiz Error: Answers is not an array');
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of answers',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            // console.error('Submit Quiz Error: Quiz not found');
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (quiz.completedAt) {
            // console.error('Submit Quiz Error: Quiz already completed');
            return res.status(400).json({
                success: false,
                error: 'Quiz already completed',
                statusCode: 400
            });
        }

        // Process answers
        let correctCount = 0;  // Initialize correctCount
        const userAnswers = [];

        answers.forEach(answer => {
            const { questionIndex, selectedAnswer } = answer;

            if (questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];

                let isCorrect = false;
                // Check if correctAnswer is an index (number or numeric string)
                // Note: stored as string in DB, might be "2" or "02"
                const correctIndex = parseInt(question.correctAnswer);

                if (!isNaN(correctIndex) && correctIndex >= 0 && correctIndex < question.options.length) {
                    // Check if it's strictly a numeric string (e.g. "2") vs the text "2"
                    // Since standard implementation stores index, we prioritize checking index.
                    // Compare selected answer text with the option text at the correct index
                    isCorrect = selectedAnswer === question.options[correctIndex];
                } else {
                    // Fallback: direct comparison (legacy behavior or if text was stored)
                    isCorrect = selectedAnswer === question.correctAnswer;
                }

                if (isCorrect) correctCount++;

                // Ensure selectedAnswer is a string for Schema validation if it's missing
                const safeSelectedAnswer = selectedAnswer || '';

                userAnswers.push({
                    questionIndex,
                    selectedAnswer: safeSelectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        // Calculate score
        const score = Math.round((correctCount / quiz.questions.length) * 100);

        // Update quiz
        quiz.userAnswer = userAnswers; // Fixed typo: userAnswers -> userAnswer
        quiz.score = score;
        quiz.completedAt = new Date();
        quiz.totalQuestions = quiz.questions.length; // Ensure totalQuestions is set

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.questions.length,
                percentage: score,
                userAnswers
            },
            message: 'Quiz submitted successfully'
        });
    } catch (error) {
        // console.error('Submit Quiz Exception:', error);
        next(error);
    }
};


// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res, next) => {
    try {
        // Validate quiz ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid quiz ID format',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found or access denied',
                statusCode: 404
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz not completed yet',
                statusCode: 400,
                data: {
                    quizId: quiz._id,
                    status: 'incomplete',
                    startedAt: quiz.createdAt
                }
            });
        }

        // Ensure questions is an array before mapping
        if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No questions found in this quiz',
                statusCode: 400
            });
        }

        // Build detailed results with additional metadata
        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = Array.isArray(quiz.userAnswer) ?
                quiz.userAnswer.find(a => a.questionIndex === index) :
                null;

            return {
                questionIndex: index,
                question: question.question || 'No question text',
                options: Array.isArray(question.options) ? question.options : [],
                correctAnswer: question.correctAnswer || '',
                selectedAnswer: userAnswer?.selectedAnswer || 'Not answered',
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation || '',
                difficulty: question.difficulty || 'medium',
                timeSpent: userAnswer?.answeredAt ?
                    (new Date(userAnswer.answeredAt) - quiz.createdAt) / 1000 + 's' :
                    'N/A'
            };
        });

        // Calculate statistics
        const correctCount = detailedResults.filter(q => q.isCorrect).length;
        const accuracy = Math.round((correctCount / detailedResults.length) * 100) || 0;
        const averageTimeSpent = detailedResults.reduce((acc, curr) => {
            const time = parseFloat(curr.timeSpent) || 0;
            return acc + time;
        }, 0) / detailedResults.length;

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title || 'Untitled Quiz',
                    document: quiz.documentId || { _id: null, title: 'No document' },
                    score: quiz.score || 0,
                    totalQuestions: quiz.totalQuestions || detailedResults.length,
                    correctAnswers: correctCount,
                    incorrectAnswers: detailedResults.length - correctCount,
                    accuracy,
                    averageTimeSpent: averageTimeSpent.toFixed(2) + 's',
                    startedAt: quiz.createdAt,
                    completedAt: quiz.completedAt,
                    timeTaken: quiz.completedAt ?
                        ((quiz.completedAt - quiz.createdAt) / 1000).toFixed(2) + 's' :
                        'N/A'
                },
                results: detailedResults,
                summary: {
                    totalQuestions: detailedResults.length,
                    correctAnswers: correctCount,
                    incorrectAnswers: detailedResults.length - correctCount,
                    accuracy,
                    questionsByDifficulty: detailedResults.reduce((acc, curr) => {
                        const diff = curr.difficulty || 'unknown';
                        acc[diff] = (acc[diff] || 0) + 1;
                        return acc;
                    }, {})
                }
            }
        });
    } catch (error) {
        // console.error('Error in getQuizResults:', error);
        next({
            message: 'Failed to retrieve quiz results',
            error: error.message,
            statusCode: 500
        });
    }
};


// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            data: quiz,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};