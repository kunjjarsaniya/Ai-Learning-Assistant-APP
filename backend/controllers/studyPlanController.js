import StudyPlan from '../models/StudyPlan.js';
import Document from '../models/Document.js';
import * as geminiService from '../utils/geminiService.js';

// @desc    Generate study plan from document
// @route   POST /api/study-plans/generate
// @access  Private
export const generatePlan = async (req, res, next) => {
    try {
        const { documentId, examDate, dailyHours } = req.body;

        if (!documentId || !examDate || !dailyHours) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId, examDate, and dailyHours',
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

        // Calculate days until exam
        const exam = new Date(examDate);
        const today = new Date();
        const diffTime = Math.abs(exam - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const daysToStudy = Math.max(1, diffDays); // Ensure at least 1 day

        // Generate study plan using Gemini
        const schedule = await geminiService.generateStudyPlan(
            document.extractedText,
            daysToStudy,
            parseInt(dailyHours)
        );

        // Map schedule array to include dates
        const scheduleDays = schedule.map(day => {
            const date = new Date();
            date.setDate(date.getDate() + (day.dayNumber - 1));
            return {
                dayNumber: day.dayNumber,
                date: date,
                topics: day.topics
            };
        });

        // Save to database
        const studyPlan = await StudyPlan.create({
            user: req.user._id,
            document: document._id,
            title: `${document.title} - Study Plan`,
            examDate: exam,
            dailyHours: parseInt(dailyHours),
            scheduleDays: scheduleDays
        });

        res.status(201).json({
            success: true,
            data: studyPlan,
            message: 'Study plan generated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all study plans for a user
// @route   GET /api/study-plans
// @access  Private
export const getStudyPlans = async (req, res, next) => {
    try {
        const plans = await StudyPlan.find({ user: req.user._id }).populate('document', 'title');
        
        res.status(200).json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single study plan
// @route   GET /api/study-plans/:id
// @access  Private
export const getStudyPlanById = async (req, res, next) => {
    try {
        const plan = await StudyPlan.findOne({ 
            _id: req.params.id, 
            user: req.user._id 
        }).populate('document', 'title');

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Study plan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a study plan
// @route   DELETE /api/study-plans/:id
// @access  Private
export const deleteStudyPlan = async (req, res, next) => {
    try {
        const plan = await StudyPlan.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Study plan not found'
            });
        }

        await plan.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Study plan deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a topic's completion status
// @route   PUT /api/study-plans/:id/topics/:topicId
// @access  Private
export const updateTopicStatus = async (req, res, next) => {
    try {
        const { isCompleted } = req.body;
        const plan = await StudyPlan.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Study plan not found'
            });
        }

        let topicFound = false;
        
        // Find and update the topic
        for (const day of plan.scheduleDays) {
            const topic = day.topics.id(req.params.topicId);
            if (topic) {
                topic.isCompleted = isCompleted;
                topicFound = true;
                break;
            }
        }

        if (!topicFound) {
            return res.status(404).json({
                success: false,
                error: 'Topic not found'
            });
        }

        await plan.save();

        res.status(200).json({
            success: true,
            data: plan,
            message: 'Topic status updated'
        });
    } catch (error) {
        next(error);
    }
};
