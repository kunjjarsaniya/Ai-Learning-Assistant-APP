import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, BookOpen, Clock, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import moment from 'moment';
import studyPlanService from '../../services/studyPlanService';
import Spinner from '../../components/common/Spinner';
import GeneratePlanModal from '../../components/study-planner/GeneratePlanModal';
import StudyTimeline from '../../components/study-planner/StudyTimeline';
import Model from '../../components/common/Model';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const StudyPlannerPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    // Deletion State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await studyPlanService.getStudyPlans();
            setPlans(res.data || []);
        } catch (error) {
            toast.error(error.message || 'Failed to load study plans');
        } finally {
            setLoading(false);
        }
    };

    const handlePlanCreated = () => {
        fetchPlans();
        setIsGenerateModalOpen(false);
    };

    const handleTopicUpdate = async (planId, topicId, isCompleted) => {
        try {
            await studyPlanService.updateTopicStatus(planId, topicId, isCompleted);
            // Update local state without refetching everything
            if (selectedPlan && selectedPlan._id === planId) {
                const updatedPlan = { ...selectedPlan };
                updatedPlan.scheduleDays.forEach(day => {
                    day.topics.forEach(topic => {
                        if (topic._id === topicId) {
                            topic.isCompleted = isCompleted;
                        }
                    });
                });
                setSelectedPlan(updatedPlan);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update topic');
        }
    };

    const openDeleteModal = (plan, e) => {
        e.stopPropagation();
        setPlanToDelete(plan);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!planToDelete) return;
        setDeleting(true);
        try {
            await studyPlanService.deleteStudyPlan(planToDelete._id);
            setPlans(plans.filter(p => p._id !== planToDelete._id));
            if (selectedPlan?._id === planToDelete._id) setSelectedPlan(null);
            toast.success('Study plan deleted');
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error('Failed to delete study plan');
        } finally {
            setDeleting(false);
            setPlanToDelete(null);
        }
    };

    const renderPlanList = () => {
        if (loading) {
            return (
                <div className='flex items-center justify-center py-20'>
                    <Spinner />
                </div>
            );
        }

        if (plans.length === 0) {
            return (
                <div className='flex flex-col items-center justify-center py-16 px-6 bg-card border-2 border-border rounded-2xl'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-10 shadow-glow-primary'>
                        <CalendarIcon className='w-8 h-8 text-primary' strokeWidth={2} />
                    </div>
                    <h3 className='text-lg sm:text-xl font-semibold text-foreground mb-2'>
                        No Study Plans Yet
                    </h3>
                    <p className='text-xs sm:text-sm text-muted-foreground mb-8 text-center max-w-sm font-sans'>
                        Generate an AI-powered day-by-day study schedule from your uploaded documents.
                    </p>
                    <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className='group inline-flex items-center justify-center gap-2 px-5 sm:px-6 h-11 sm:h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95'
                    >
                        <Plus className='w-4 h-4' strokeWidth={2.5} />
                        Create Study Plan
                    </button>
                </div>
            );
        }

        return (
            <div className='space-y-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2'>
                    <div className='text-base sm:text-lg font-semibold text-foreground'>
                        <h3>Your Study Plans</h3>
                        <p className='text-xs sm:text-sm text-muted-foreground mt-1 font-sans'>
                            {plans.length} active {plans.length === 1 ? "plan" : "plans"}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className='w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-4 sm:px-5 h-10 sm:h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95'
                    >
                        <Plus className='w-4 h-4' strokeWidth={2.5} />
                        New Study Plan
                    </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                    {plans.map(plan => (
                        <div
                            key={plan._id}
                            onClick={() => setSelectedPlan(plan)}
                            className='group relative bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-glow-primary min-h-[200px] flex flex-col justify-between'
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                                        <CalendarIcon size={24} strokeWidth={2} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => openDeleteModal(plan, e)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="bg-secondary px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider text-muted-foreground self-center">
                                            {plan.scheduleDays.length} Days
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 leading-tight">
                                    {plan.title}
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 font-sans">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        <span>{plan.dailyHours} hrs/day</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon size={14} />
                                        <span>Exam: {moment(plan.examDate).format("MMM D, YYYY")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                <span className="text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
                                    View Plan
                                </span>
                                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
                {/* Header Section */}
                <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12'>
                    <div className='max-w-2xl'>
                        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight' style={{ fontFamily: 'var(--font-display)' }}>
                            Study Planner
                        </h1>
                        <p className='text-base sm:text-lg text-muted-foreground font-sans leading-relaxed'>
                            Generate day-by-day schedules tailored to your exam dates and available study time.
                        </p>
                    </div>
                </div>

                {selectedPlan ? (
                    <StudyTimeline plan={selectedPlan} onBack={() => setSelectedPlan(null)} onTopicUpdate={handleTopicUpdate} />
                ) : (
                    renderPlanList()
                )}
            </div>

            {isGenerateModalOpen && (
                <GeneratePlanModal
                    isOpen={isGenerateModalOpen}
                    onClose={() => setIsGenerateModalOpen(false)}
                    onPlanCreated={handlePlanCreated}
                />
            )}

            {/* Deletion Confirmation Model */}
            <Model
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Study Plan"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-foreground">Delete Study Plan?</h4>
                            <p className="text-xs text-muted-foreground font-sans">This will permanently delete the study plan for <span className="font-bold text-foreground">"{planToDelete?.title}"</span>. Progress will be lost.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1"
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmDelete}
                            className="flex-1 bg-destructive hover:bg-destructive/90 text-white shadow-glow-destructive"
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Plan'}
                        </Button>
                    </div>
                </div>
            </Model>
        </>
    );
};

export default StudyPlannerPage;
