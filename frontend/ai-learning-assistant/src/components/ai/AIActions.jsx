import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import MarkdownRenderer from '../common/MarkdownRenderer';
import Model from '../common/Model';

const AIActions = () => {

    const { id: documentId } = useParams();
    const [loadingAction, setLoadingAction] = useState(null);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [modelContent, setIsModelContent] = useState('');
    const [modelTitle, setModelTitle] = useState(''); const [concept, setConcept] = useState('');

    const handleGenerateSummary = async () => {
        setLoadingAction('summary');

        try {
            const { summary } = await aiService.generateSummary(documentId);
            setModelTitle("Generated Summary");
            setIsModelContent(summary);
            setIsModelOpen(true);
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleExplainConcept = async (e) => {
        e.preventDefault();

        if (!concept.trim()) {
            toast.error('Please enter a concept to explain.');
            return;
        }

        setLoadingAction('explain');

        try {
            const { explanation } = await aiService.explainConcept(
                documentId,
                concept
            );
            setModelTitle(`Explanation of "${concept}"`);
            setIsModelContent(explanation);
            setIsModelOpen(true);
            setConcept('');
        } catch (error) {
            toast.error('Failed to explain concept');
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <>
            <div className='glass-strong border border-stone-200 rounded-2xl shadow-warm-lg overflow-hidden'>
                {/* Header */}
                <div className='px-4 sm:px-6 py-4 sm:py-5 border-b border-stone-200 bg-gradient-to-br from-stone-50/50 to-background/50'>
                    <div className='flex items-center gap-3'>
                        <div className='w-11 h-11 rounded-xl gradient-primary shadow-glow-primary flex items-center justify-center'>
                            <Sparkles className='w-6 h-6 text-white' strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className='text-lg sm:text-xl font-bold text-foreground'>
                                AI Assistant
                            </h3>
                            <p className='text-xs sm:text-sm text-muted-foreground font-sans'>Powered by advanced AI</p>
                        </div>
                    </div>
                </div>

                <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
                    {/* Generate Summary */}
                    <div className='group p-4 sm:p-5 bg-gradient-to-r from-stone-50/50 to-background rounded-xl border border-stone-200 hover:border-primary hover:shadow-warm transition-all duration-200'>
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-3'>
                                    <div className='w-10 h-10 rounded-xl bg-info/10'>
                                        <BookOpen className='w-full h-full p-2 text-info' strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className='text-base sm:text-lg font-bold text-foreground'>
                                            Generate Summary
                                        </h4>
                                        <p className='text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans'>
                                            Get a comprehensive overview
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerateSummary}
                                disabled={loadingAction === 'summary'}
                                className='w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 h-11 sm:h-12 gradient-primary hover:shadow-glow-primary text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-warm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
                            >
                                {loadingAction === "summary" ? (
                                    <span className='flex items-center gap-2'>
                                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                        Loading...
                                    </span>
                                ) : (
                                    "Summarize"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Explain Concept */}
                    <div className='group p-4 sm:p-5 bg-gradient-to-r from-stone-50/50 to-background rounded-xl border border-stone-200 hover:border-primary hover:shadow-warm transition-all duration-200'>
                        <form onSubmit={handleExplainConcept}>
                            <div className='flex items-center gap-3 mb-4'>
                                <div className='w-10 h-10 rounded-xl bg-accent/10'>
                                    <Lightbulb className='w-full h-full p-2 text-accent' strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 className='text-base sm:text-lg font-bold text-foreground'>
                                        Explain Concept
                                    </h4>
                                    <p className='text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans'>
                                        Get detailed explanations
                                    </p>
                                </div>
                            </div>
                            <div className='flex flex-col sm:flex-row gap-3'>
                                <input
                                    type="text"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    placeholder="Enter concept..."
                                    className='flex-1 h-11 sm:h-12 px-3 sm:px-4 border-2 border-stone-200 rounded-xl bg-stone-50/50 text-sm sm:text-base text-foreground placeholder-stone-400 transition-all duration-200 focus:outline-none focus:border-primary focus:bg-background focus:shadow-glow-primary'
                                    disabled={loadingAction === 'explain'}
                                />

                                <button
                                    type='submit'
                                    disabled={loadingAction === 'explain' || !concept.trim()}
                                    className='w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 h-11 sm:h-12 gradient-primary hover:shadow-glow-primary text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-warm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
                                >
                                    {loadingAction === "explain" ? (
                                        <span className='flex items-center gap-2'>
                                            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                            Loading...
                                        </span>
                                    ) : (
                                        "Explain"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Result Model */}
            <Model
                isOpen={isModelOpen}
                onClose={() => setIsModelOpen(false)}
                title={modelTitle}
            >
                <div className='max-h-[60vh] overflow-y-auto prose prose-sm max-w-none prose-slate'>
                    <MarkdownRenderer content={modelContent} />
                </div>
            </Model>
        </>
    )
}

export default AIActions