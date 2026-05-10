import { useState } from 'react';
import { Star, RotateCcw } from 'lucide-react';

const Flashcard = ({ flashcard, onToggleStar }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // Guard against undefined flashcard
    if (!flashcard) {
        return <div className='text-center text-muted-foreground'>No flashcard data</div>;
    }

    return <div className='relative w-full h-72' style={{ perspective: '1000px' }}>
        <div
            className={`relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer `}
            style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
            onClick={handleFlip}
        >
            {/* Front of the card (Question) */}
            <div
                className='absolute inset-0 w-full h-full bg-card backdrop-blur-xl border-2 border-border rounded-2xl shadow-xl shadow-border/50 p-8 flex flex-col justify-between'
                style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                }}
            >
                {/* Star Button */}
                <div className='flex items-start justify-between'>
                    <div className='bg-secondary text-[10px] text-muted-foreground rounded px-4 py-1 uppercase font-semibold tracking-wider'>
                        {flashcard?.difficulty || 'Medium'}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar?.(flashcard._id)
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 
                            ${flashcard?.isStarred
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'}`}
                    >
                        <Star
                            className='w-4 h-4'
                            strokeWidth={2}
                            fill={flashcard?.isStarred ? 'currentColor' : 'none'}
                        />
                    </button>
                </div>

                {/* Question Content */}
                <div className='flex-1 flex items-center justify-center px-4 py-6'>
                    <p className='text-lg font-serif font-medium text-foreground text-center leading-relaxed'>
                        {flashcard.question}
                    </p>
                </div>

                {/* Flip Indicator */}
                <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium'>
                    <RotateCcw className='w-3.5 h-3.5' strokeWidth={2} />
                    <span>Click to reveal answer</span>
                </div>
            </div>


            {/* Back of the card (Answer) */}
            <div
                className='absolute inset-0 w-full h-full bg-primary border-2 border-primary rounded-2xl shadow-xl shadow-primary/30 p-8 flex flex-col justify-between'
                style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                }}
            >
                {/* Star Button */}
                <div className='flex justify-end'>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar?.(flashcard._id)
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 
                            ${flashcard?.isStarred
                                ? 'bg-background text-foreground border border-border'
                                : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground border border-primary-foreground/20'}`}
                    >
                        <Star
                            className='w-4 h-4'
                            strokeWidth={2}
                            fill={flashcard?.isStarred ? 'currentColor' : 'none'}
                        />
                    </button>
                </div>

                {/* Answer Content */}
                <div className='flex-1 flex items-center justify-center px-4 py-6'>
                    <p className='text-base text-primary-foreground text-center leading-relaxed font-serif'>
                        {flashcard.answer}
                    </p>
                </div>

                {/* Flip Indicator */}
                <div className='flex items-center justify-center gap-2 text-xs text-primary-foreground/70 font-medium'>
                    <RotateCcw className='w-3.5 h-3.5' strokeWidth={2} />
                    <span>Click to see question</span>
                </div>
            </div>
        </div>
    </div>
}

export default Flashcard