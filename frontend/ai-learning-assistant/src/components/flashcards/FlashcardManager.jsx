import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

import flashcardService from '../../services/flashcardService';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Model from '../common/Model';
import Flashcard from './Flashcard';

import { useNotification } from '../../context/NotificationContext';

const FlashcardManager = ({ documentId }) => {

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);
    const { addNotification } = useNotification();

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error('Failed to fetch flashcard sets.');
            // console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            addNotification(
                'Flashcards Generated',
                'Your new flashcard set is ready for review.',
                'success'
            );
            toast.success('Flashcards generated successfully.');
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || 'Failed to generate flashcards.');
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) =>
                    (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        if (!currentCard) return;

        try {
            await flashcardService.reviewFlashcard(currentCard._id, index);
            toast.success("Flashcard reviwed:");
        } catch (error) {
            toast.error("Failed to review flashcard.")
        }
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            const updatedSet = flashcardSets.map((set) => {
                if (set._id === selectedSet._id) {
                    const updatedCards = set.cards.map((card) =>
                        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                    );
                    return { ...set, cards: updatedCards };
                }
                return set;
            });
            setFlashcardSets(updatedSet);
            setSelectedSet(updatedSet.find((set) => set._id === selectedSet._id));
            toast.success("Flashcard starred status updated!");
        } catch (error) {
            toast.error("Failed to update star status.");
        }
    };

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModelOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            addNotification(
                'Flashcard Set Deleted',
                `Flashcard set created on ${moment(setToDelete.createdAt).format("MMM D")} has been deleted.`,
                'info'
            );
            toast.success('Flashcard set deleted successfully');
            setIsDeleteModelOpen(false);
            setSetToDelete(null);
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || 'Failed to delete flashcard set');
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet.cards[currentCardIndex];

        return (
            <div className="space-y-8">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedSet(null)}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                    <ArrowLeft
                        className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                        strokeWidth={2}
                    />
                    Back to Sets
                </button>

                {/* Flashcard */}
                <div className="flex flex-col items-center space-y-8">
                    <div className='w-full max-w-2xl'>
                        <Flashcard
                            flashcard={currentCard}
                            onToggleStar={handleToggleStar}
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={handlePrevCard}
                            disabled={selectedSet.cards.length <= 1}
                            className="group flex items-center gap-2 px-4 sm:px-5 h-10 sm:h-11 bg-card border-2 border-border hover:border-primary/50 hover:bg-card text-foreground font-medium text-xs sm:text-sm rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
                        >
                            <ChevronLeft
                                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                                strokeWidth={2.5}
                            />
                            Previous
                        </button>

                        <div className='px-3 sm:px-4 py-1.5 sm:py-2 bg-background rounded-lg border-2 border-border'>
                            <span className='text-xs sm:text-sm font-semibold text-foreground'>
                                {currentCardIndex + 1}{" "}
                                <span className='text-muted-foreground font-normal'>/</span>{" "}
                                {selectedSet.cards.length}
                            </span>
                        </div>

                        <button
                            onClick={handleNextCard}
                            disabled={selectedSet.cards.length <= 1}
                            className="group flex items-center gap-2 px-4 sm:px-5 h-10 sm:h-11 bg-card border-2 border-border hover:border-primary/50 hover:bg-card text-foreground font-medium text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
                        >
                            Next
                            <ChevronRight
                                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
                                strokeWidth={2.5}
                            />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className='flex items-center justify-center py-20'>
                    <Spinner />
                </div>
            )
        }

        if (flashcardSets.length === 0) {
            return (
                <div className='flex flex-col items-center justify-center py-16 px-6'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-10 shadow-glow-primary'>
                        <Brain className='w-8 h-8 text-primary' strokeWidth={2} />
                    </div>
                    <h3 className='text-lg sm:text-xl font-semibold text-foreground mb-2'>
                        No Flashcards Yet
                    </h3>
                    <p className='text-xs sm:text-sm text-muted-foreground mb-8 text-center max-w-sm font-sans'>
                        Generate flashcards from your document to start learning and reinforce your knowledge.
                    </p>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className='group inline-flex items-center justify-center gap-2 px-5 sm:px-6 h-11 sm:h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100'
                    >
                        {generating ? (
                            <>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className='w-4 h-4' strokeWidth={2} />
                                Generate Flashcards
                            </>
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className='space-y-6'>
                {/* Header with Generate Button */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2'>
                    <div className='text-base sm:text-lg font-semibold text-foreground'>
                        <h3 className=''>
                            Your Flashcard Sets
                        </h3>
                        <p className='text-xs sm:text-sm text-muted-foreground mt-1 font-sans'>
                            {flashcardSets.length}{" "}
                            {flashcardSets.length === 1 ? "set" : "sets"} available
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className='w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-4 sm:px-5 h-10 sm:h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100'
                    >
                        {generating ? (
                            <>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Plus className='w-4 h-4' strokeWidth={2.5} />
                                Generate New Set
                            </>
                        )}
                    </button>
                </div>

                {/* Flashcard Sets Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                    {flashcardSets.map((set) => (
                        <div
                            key={set._id}
                            onClick={() => handleSelectSet(set)}
                            className='group relative bg-card border-2 border-border hover:border-primary rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-glow-primary'
                        >
                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDeleteRequest(e, set)}
                                className='absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'
                            >
                                <Trash2 className='w-4 h-4' strokeWidth={2} />
                            </button>

                            {/* Set Content */}
                            <div className='space-y-3 sm:space-y-4'>
                                <div className='inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10'>
                                    <Brain className='w-5 h-5 sm:w-6 sm:h-6 text-primary' strokeWidth={2} />
                                </div>

                                <div>
                                    <h4 className='text-base sm:text-lg font-semibold text-foreground mb-1'>
                                        Flashcard Set
                                    </h4>
                                    <p className='text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider font-sans'>
                                        Created {moment(set.createdAt).format("MMM D, YYYY")}
                                    </p>
                                </div>

                                <div className='flex items-center gap-2 pt-2 border-t border-border'>
                                    <div className='px-2.5 sm:px-3 py-1 sm:py-1.5 bg-background border border-border rounded-lg'>
                                        <span className='text-xs sm:text-sm font-semibold text-foreground'>
                                            {set.cards.length}{" "}
                                            {set.cards.length === 1 ? "card" : "cards"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    return (
        <>
            <div className='bg-card border-2 border-border rounded-2xl shadow-warm-lg p-4 sm:p-6 lg:p-8 min-h-[500px]'>
                {selectedSet ? renderFlashcardViewer() : renderSetList()}
            </div>

            {/* Delete Confirmation Model */}
            <Model
                isOpen={isDeleteModelOpen}
                onClose={() => setIsDeleteModelOpen(false)}
                title="Delete Flashcard Set?"
            >
                <div className='space-y-6'>
                    <p className='text-xs sm:text-sm text-muted-foreground font-sans'>
                        Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.
                    </p>
                    <div className='flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-2'>
                        <button
                            type='button'
                            onClick={() => setIsDeleteModelOpen(false)}
                            disabled={deleting}
                            className='flex-1 sm:flex-none px-4 sm:px-5 h-10 sm:h-11 bg-card border-2 border-border hover:bg-background text-foreground font-medium text-xs sm:text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className='flex-1 sm:flex-none px-4 sm:px-5 h-10 sm:h-11 bg-destructive hover:bg-destructive/90 text-white font-medium text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {deleting ? (
                                <span className='flex items-center gap-2'>
                                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                    Deleting...
                                </span>
                            ) : (
                                "Delete Set"
                            )}
                        </button>
                    </div>
                </div>
            </Model>
        </>
    )
}

export default FlashcardManager;
// Force reload