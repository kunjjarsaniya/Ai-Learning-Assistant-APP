import React, { useState, useEffect } from 'react';
import { 
    BarChart3, TrendingUp, BookOpen, BrainCircuit, Calendar, 
    FileText, Network, Clock, Target, Award, AlertTriangle,
    ChevronUp, ChevronDown, Sparkles
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import progressService from '../../services/progressService';
import Spinner from '../../components/common/Spinner';
import CircularProgress from '../../components/progress/CircularProgress';
import StatCard from '../../components/progress/StatCard';
import toast from 'react-hot-toast';

const ProgressPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await progressService.getDetailedInsights();
            setData(res.data);
        } catch (error) {
            toast.error('Failed to load progress insights');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-8 animate-pulse">
                    <div className="h-12 bg-card rounded-2xl w-1/3 border border-border" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-40 bg-card rounded-2xl border border-border" />
                        ))}
                    </div>
                    <div className="h-80 bg-card rounded-2xl border border-border" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">No data available.</p>
            </div>
        );
    }

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border-2 border-border rounded-xl px-4 py-3 shadow-xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-lg font-bold text-foreground font-numbers">{payload[0].value}{typeof payload[0].value === 'number' ? '%' : ''}</p>
                </div>
            );
        }
        return null;
    };

    const ActivityTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border-2 border-border rounded-xl px-4 py-3 shadow-xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-lg font-bold text-foreground font-numbers">{payload[0].value} activities</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        Progress Insights
                    </h1>
                    <p className="text-muted-foreground max-w-2xl font-sans">
                        Track your learning journey across all modules. Understand your strengths and improve your weaknesses.
                    </p>
                </div>
            </div>

            {/* Hero Section: Learning Score + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Learning Score Card */}
                <div className="lg:col-span-4 bg-card border-2 border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles size={16} className="text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Overall Score</span>
                    </div>
                    <CircularProgress value={data.learningScore} size={180} strokeWidth={14} label="Score" />
                    <p className="text-sm text-muted-foreground font-sans mt-6 max-w-[200px]">
                        Based on your quiz performance, study plan progress, and flashcard reviews.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatCard
                        icon={BrainCircuit}
                        label="Quiz Average"
                        value={data.quizAverage}
                        suffix="%"
                        description={`${data.totalQuizzes} quizzes taken`}
                        color="info"
                    />
                    <StatCard
                        icon={Target}
                        label="Study Plan"
                        value={data.studyPlanCompletion}
                        suffix="%"
                        description={`${data.completedTopics} of ${data.totalTopics} topics completed`}
                        color="success"
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Flashcard Review"
                        value={data.flashcardReviewRate}
                        suffix="%"
                        description={`${data.totalFlashcards} cards across your library`}
                        color="primary"
                    />
                    <StatCard
                        icon={Clock}
                        label="Study Time"
                        value={data.estimatedStudyHours}
                        suffix="hrs"
                        description="Estimated from completed study topics"
                        color="accent"
                    />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Quiz Performance Chart */}
                <div className="lg:col-span-8 bg-card border-2 border-border rounded-3xl p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <TrendingUp size={20} className="text-info" /> Quiz Performance
                            </h3>
                            <p className="text-sm text-muted-foreground font-sans mt-1">Score trends over time</p>
                        </div>
                    </div>
                    {data.quizPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.quizPerformance}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E69A59" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#E69A59" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    fontSize={11}
                                    fontWeight={600}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                    axisLine={{ stroke: 'var(--border)' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    fontSize={11}
                                    fontWeight={600}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#E69A59"
                                    strokeWidth={3}
                                    fill="url(#colorScore)"
                                    dot={{ fill: '#E69A59', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 7, stroke: '#E69A59', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <BrainCircuit className="w-12 h-12 text-muted-foreground/20 mb-4" />
                            <p className="text-muted-foreground font-sans">Complete some quizzes to see your performance trends.</p>
                        </div>
                    )}
                </div>

                {/* Weekly Activity Bar Chart */}
                <div className="lg:col-span-4 bg-card border-2 border-border rounded-3xl p-6 sm:p-8">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <Calendar size={20} className="text-primary" /> Weekly Activity
                        </h3>
                        <p className="text-sm text-muted-foreground font-sans mt-1">Last 7 days</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis
                                dataKey="day"
                                fontSize={11}
                                fontWeight={700}
                                tick={{ fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                fontSize={11}
                                tick={{ fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<ActivityTooltip />} />
                            <Bar
                                dataKey="activities"
                                fill="#E69A59"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Strengths & Weaknesses + Document Engagement */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Strengths */}
                <div className="lg:col-span-4 bg-card border-2 border-border rounded-3xl p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                        <Award size={20} className="text-success" /> Strengths
                    </h3>
                    {data.strengths.length > 0 ? (
                        <div className="space-y-4">
                            {data.strengths.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground line-clamp-1">{s.title}</p>
                                            <p className="text-[11px] text-muted-foreground">{s.quizzesTaken} quizzes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-success font-bold text-sm font-numbers">
                                        <ChevronUp size={16} />
                                        {s.averageScore}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground font-sans text-center py-8">Take quizzes to discover your strengths.</p>
                    )}
                </div>

                {/* Weaknesses */}
                <div className="lg:col-span-4 bg-card border-2 border-border rounded-3xl p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                        <AlertTriangle size={20} className="text-destructive" /> Needs Work
                    </h3>
                    {data.weaknesses.length > 0 ? (
                        <div className="space-y-4">
                            {data.weaknesses.map((w, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground line-clamp-1">{w.title}</p>
                                            <p className="text-[11px] text-muted-foreground">{w.quizzesTaken} quizzes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-destructive font-bold text-sm font-numbers">
                                        <ChevronDown size={16} />
                                        {w.averageScore}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground font-sans text-center py-8">Take more quizzes to identify areas for improvement.</p>
                    )}
                </div>

                {/* Document Engagement */}
                <div className="lg:col-span-4 bg-card border-2 border-border rounded-3xl p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                        <FileText size={20} className="text-primary" /> Document Engagement
                    </h3>
                    {data.documentEngagement.length > 0 ? (
                        <div className="space-y-3">
                            {data.documentEngagement.slice(0, 5).map((doc, i) => (
                                <div key={doc._id} className="p-4 border border-border rounded-2xl hover:border-primary/40 transition-colors">
                                    <p className="text-sm font-bold text-foreground line-clamp-1 mb-3">{doc.title}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {doc.quizCount > 0 && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-info/10 rounded-lg text-[10px] font-bold text-info">
                                                <BrainCircuit size={12} /> {doc.quizCount}
                                            </span>
                                        )}
                                        {doc.flashcardCount > 0 && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg text-[10px] font-bold text-primary">
                                                <BookOpen size={12} /> {doc.flashcardCount}
                                            </span>
                                        )}
                                        {doc.mindMapCount > 0 && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-lg text-[10px] font-bold text-accent">
                                                <Network size={12} /> {doc.mindMapCount}
                                            </span>
                                        )}
                                        {doc.studyPlanCount > 0 && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-lg text-[10px] font-bold text-success">
                                                <Calendar size={12} /> {doc.studyPlanCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground font-sans text-center py-8">Upload documents and interact with them to see engagement data.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;
