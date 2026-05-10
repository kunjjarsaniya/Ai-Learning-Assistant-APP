import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Calendar, BookOpen, ArrowRight, Trash2 } from 'lucide-react';
import moment from 'moment';

const FlashcardSetCard = ({ flashcardSet, onDelete }) => {
    const navigate = useNavigate();

    // Handle document reference which could be an object (populated) or string (ID)
    // Check both 'document' and 'documentId' fields
    const documentInfo = flashcardSet?.document || flashcardSet?.documentId;
    const documentId = typeof documentInfo === 'object' ? documentInfo?._id : documentInfo;
    const documentTitle = typeof documentInfo === 'object' ? documentInfo?.title : 'Untitled Document';

    const handleStudy = (e) => {
        e.stopPropagation();
        // Navigate to flashcard study with the set ID
        const setId = flashcardSet._id;
        if (documentId && setId) {
            navigate(`/documents/${documentId}/flashcards`, { state: { flashcardSetId: setId, flashcards: flashcardSet.cards } });
        } else {
            // console.warn("No document ID or set ID found for flashcard set", flashcardSet);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(flashcardSet);
        }
    };

    return (
        <div
            onClick={handleStudy}
            className="group relative flex flex-col justify-between bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-5 sm:p-6 hover:shadow-glow-primary transition-all duration-300 cursor-pointer overflow-hidden min-h-[240px]"
        >
            {/* Delete Button */}
            <button
                onClick={handleDelete}
                className='absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10'
            >
                <Trash2 className='w-4 h-4' strokeWidth={2} />
            </button>

            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <Brain size={24} strokeWidth={2} />
                    </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">
                    {documentTitle}
                </h3>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-6 font-sans">
                    <div className="flex items-center gap-1.5">
                        <BookOpen size={16} />
                        <span>{flashcardSet.cards?.length || 0} cards</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={16} />
                        <span>{moment(flashcardSet.createdAt).format("MMM D")}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-primary group-hover:text-primary/80 transition-colors">
                    Study Set
                </span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                    <ArrowRight size={16} strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
};

export default FlashcardSetCard;
