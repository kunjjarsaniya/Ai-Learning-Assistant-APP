import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import StudyPlan from "../models/StudyPlan.js";
import MindMap from "../models/MindMap.js";

// @desc    Get user learning statistics
// @route   Get /api/progress/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get counts
        const totalDocuments = await Document.countDocuments({ userId: userId });
        const totalFlashcardSets = await Flashcard.countDocuments({ userId: userId });
        const totalQuizzes = await Quiz.countDocuments({ userId: userId });
        const completedQuizzes = await Quiz.countDocuments({ userId: userId, completedAt: { $ne: null } });

        // Get flashcard statistics
        const flashcardSets = await Flashcard.find({ userId: userId });
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(c => c.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(c => c.isStarred).length;
        });

        // Get quiz statistics
        const quizzes = await Quiz.find({ userId: userId, completedAt: { $ne: null } });
        const averageScore = quizzes.length > 0
            ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
            : 0;

        // Recent Activity
        const recentDocuments = await Document.find({ userId: userId })
            .sort({ lastAccessed: -1 })
            .limit(5)
            .select('title fileName lastAccessed status');

        const recentQuizzes = await Quiz.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('documentId', 'title')
            .select('title score totalQuestions completedAt');

        // Study streak
        const studyStreak = req.user.currentStreak || 0;

        res.status(200).json({
            success: true,
            overview: {
                totalDocuments,
                totalFlashcards: totalFlashcards,
                totalFlashcardSets,
                totalQuizzes,
                completedQuizzes,
                averageScore,
                streak: studyStreak
            },
            recentActivity: {
                documents: recentDocuments.map(doc => ({
                    _id: doc._id,
                    title: doc.title,
                    lastAccessed: doc.lastAccessed || doc.updatedAt
                })),
                quizzes: recentQuizzes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data'
        });
    }
};

// @desc    Get detailed progress insights
// @route   GET /api/progress/insights
// @access  Private
export const getDetailedInsights = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // ─── 1. Fetch all data in parallel ───
        const [documents, flashcardSets, quizzes, studyPlans, mindMaps] = await Promise.all([
            Document.find({ userId }).select('title createdAt status'),
            Flashcard.find({ userId }),
            Quiz.find({ userId }).populate('documentId', 'title').sort({ completedAt: 1 }),
            StudyPlan.find({ user: userId }).populate('document', 'title'),
            MindMap.find({ user: userId }).select('document createdAt'),
        ]);

        // ─── 2. Quiz Performance Over Time ───
        const completedQuizzes = quizzes.filter(q => q.completedAt);
        const quizPerformance = completedQuizzes.map(q => ({
            date: q.completedAt,
            score: q.totalQuestions > 0 ? Math.round((q.score / q.totalQuestions) * 100) : 0,
            title: q.title,
        }));

        const quizAverage = completedQuizzes.length > 0
            ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0), 0) / completedQuizzes.length)
            : 0;

        // ─── 3. Study Plan Progress ───
        let totalTopics = 0;
        let completedTopics = 0;
        let estimatedStudyMinutes = 0;

        studyPlans.forEach(plan => {
            plan.scheduleDays.forEach(day => {
                day.topics.forEach(topic => {
                    totalTopics++;
                    if (topic.isCompleted) {
                        completedTopics++;
                        estimatedStudyMinutes += topic.estimatedMinutes || 0;
                    }
                });
            });
        });

        const studyPlanCompletion = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        // ─── 4. Flashcard Review Rate ───
        let totalCards = 0;
        let reviewedCards = 0;

        flashcardSets.forEach(set => {
            totalCards += set.cards.length;
            reviewedCards += set.cards.filter(c => c.reviewCount > 0).length;
        });

        const flashcardReviewRate = totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;

        // ─── 5. Overall Learning Score ───
        // Weighted: 50% quiz avg + 30% study plan + 20% flashcard review
        const learningScore = Math.round(
            (quizAverage * 0.5) +
            (studyPlanCompletion * 0.3) +
            (flashcardReviewRate * 0.2)
        );

        // ─── 6. Weekly Activity (last 7 days) ───
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyActivity = dayNames.map(() => 0);

        // Count quiz completions
        completedQuizzes.forEach(q => {
            if (q.completedAt >= sevenDaysAgo) {
                weeklyActivity[new Date(q.completedAt).getDay()]++;
            }
        });

        // Count flashcard reviews
        flashcardSets.forEach(set => {
            set.cards.forEach(card => {
                if (card.lastReviewd && new Date(card.lastReviewd) >= sevenDaysAgo) {
                    weeklyActivity[new Date(card.lastReviewd).getDay()]++;
                }
            });
        });

        const weeklyData = dayNames.map((name, i) => ({
            day: name,
            activities: weeklyActivity[i],
        }));

        // ─── 7. Document Engagement ───
        const docEngagement = documents.filter(d => d.status === 'ready').map(doc => {
            const docQuizzes = quizzes.filter(q => q.documentId?._id?.toString() === doc._id.toString());
            const docFlashcards = flashcardSets.filter(f => f.documentId?.toString() === doc._id.toString());
            const docMindMaps = mindMaps.filter(m => m.document?.toString() === doc._id.toString());
            const docPlans = studyPlans.filter(p => p.document?._id?.toString() === doc._id.toString());

            return {
                _id: doc._id,
                title: doc.title,
                quizCount: docQuizzes.length,
                flashcardCount: docFlashcards.reduce((s, f) => s + f.cards.length, 0),
                mindMapCount: docMindMaps.length,
                studyPlanCount: docPlans.length,
                totalEngagement: docQuizzes.length + docFlashcards.length + docMindMaps.length + docPlans.length,
            };
        }).sort((a, b) => b.totalEngagement - a.totalEngagement);

        // ─── 8. Strengths & Weaknesses ───
        const docScores = {};
        completedQuizzes.forEach(q => {
            const docTitle = q.documentId?.title || 'Unknown';
            const docId = q.documentId?._id?.toString() || 'unknown';
            if (!docScores[docId]) {
                docScores[docId] = { title: docTitle, scores: [], total: 0, correct: 0 };
            }
            const pct = q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0;
            docScores[docId].scores.push(pct);
            docScores[docId].total += q.totalQuestions;
            docScores[docId].correct += q.score;
        });

        const rankedDocs = Object.values(docScores)
            .map(d => ({
                title: d.title,
                averageScore: Math.round(d.scores.reduce((s, v) => s + v, 0) / d.scores.length),
                quizzesTaken: d.scores.length,
            }))
            .sort((a, b) => b.averageScore - a.averageScore);

        const strengths = rankedDocs.slice(0, 3);
        const weaknesses = rankedDocs.length > 1 ? rankedDocs.slice(-3).reverse() : [];

        // ─── 9. Summary Counts ───
        const estimatedHours = Math.round(estimatedStudyMinutes / 60);

        res.status(200).json({
            success: true,
            data: {
                learningScore,
                quizAverage,
                studyPlanCompletion,
                flashcardReviewRate,
                estimatedStudyHours: estimatedHours,
                totalDocuments: documents.length,
                totalQuizzes: quizzes.length,
                totalFlashcards: totalCards,
                totalStudyPlans: studyPlans.length,
                totalMindMaps: mindMaps.length,
                completedTopics,
                totalTopics,
                quizPerformance,
                weeklyActivity: weeklyData,
                documentEngagement: docEngagement,
                strengths,
                weaknesses,
            }
        });
    } catch (error) {
        console.error('Error in getDetailedInsights:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching insights'
        });
    }
};