import React, { useState, useEffect } from 'react';
import Model from '../common/Model';
import { Calendar, Clock, FileText, Sparkles } from 'lucide-react';
import studyPlanService from '../../services/studyPlanService';
import documentService from '../../services/documentService';
import toast from 'react-hot-toast';
import Select from '../common/Select';

const GeneratePlanModal = ({ isOpen, onClose, onPlanCreated }) => {
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState('');
    const [examDate, setExamDate] = useState('');
    const [dailyHours, setDailyHours] = useState('2');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDocuments();
        }
    }, [isOpen]);

    const fetchDocuments = async () => {
        try {
            const res = await documentService.getDocuments();
            setDocuments(res || []);
        } catch (error) {
            toast.error('Failed to load documents');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDoc || !examDate || !dailyHours) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await studyPlanService.generatePlan(selectedDoc, examDate, dailyHours);
            toast.success('Study plan generated successfully!');
            onPlanCreated();
        } catch (error) {
            toast.error(error.message || 'Failed to generate plan');
        } finally {
            setLoading(false);
        }
    };

    // Min date is tomorrow
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    return (
        <Model isOpen={isOpen} onClose={onClose} title="Create Study Plan">
            <form onSubmit={handleSubmit} className="space-y-6">
                    <Select 
                        label="Select Document"
                        placeholder="Choose a document to study..."
                        options={documents.filter(doc => doc.status === 'ready').map(doc => ({
                            value: doc._id,
                            label: doc.title
                        }))}
                        value={selectedDoc}
                        onChange={setSelectedDoc}
                    />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Calendar size={16} /> Exam Date
                        </label>
                        <input
                            type="date"
                            min={minDateStr}
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Clock size={16} /> Hours per Day
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={dailyHours}
                            onChange={(e) => setDailyHours(e.target.value)}
                            className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-warm disabled:opacity-50 active:scale-95"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generate Plan
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Model>
    );
};

export default GeneratePlanModal;
