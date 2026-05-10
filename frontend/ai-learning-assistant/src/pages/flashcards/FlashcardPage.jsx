import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import flashcardService from "../../services/flashcardService";
import Flashcard from "../../components/flashcards/Flashcard";
import Spinner from "../../components/common/Spinner";
import { ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

const FlashcardPage = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        // Check if we came from generation (location state)
        if (location.state?.flashcards) {
          setFlashcards(location.state.flashcards);
          setLoading(false);
          return;
        }

        if (!documentId) {
          setLoading(false);
          return;
        }

        const data = await flashcardService.getFlashcardsForDocument(documentId);

        let targetCards = [];
        if (Array.isArray(data)) {
          // If API returns array of sets, flatten
          targetCards = data.flatMap(set => set.cards);
        } else if (data && data.cards) {
          // Single set object
          targetCards = data.cards;
        } else if (data && Array.isArray(data.cards)) {
          targetCards = data.cards;
        }

        setFlashcards(targetCards || []);
      } catch (err) {
        // console.error("Error fetching flashcards:", err);
        toast.error("Failed to load flashcards.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [documentId, location.state]);

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const handleToggleStar = async (cardId) => {
    // Optimistic update for UI
    setFlashcards(prev => prev.map(c =>
      c._id === cardId ? { ...c, isStarred: !c.isStarred } : c
    ));
    try {
      // Call backend if needed
      // await flashcardService.toggleStar(cardId);
    } catch (err) {
      toast.error("Failed to update star");
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!documentId) return;
    setGenerating(true);
    try {
      // Assuming generateFlashcards triggers generation and returns data or just status
      // You might need to adjust based on your actual service
      await flashcardService.generateFlashcards(documentId);
      toast.success("Flashcards generated! Reloading...");

      // Refetch
      const data = await flashcardService.getFlashcardsForDocument(documentId);
      if (Array.isArray(data)) {
        setFlashcards(data.flatMap(set => set.cards));
      } else if (data && data.cards) {
        setFlashcards(data.cards);
      }
    } catch (err) {
      // console.error(err);
      toast.error("Failed to generate.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <Spinner />
    </div>
  );

  // NO FLASHCARDS STATE
  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 p-4 bg-zinc-50 rounded-full border border-zinc-100">
          <RefreshCw className={`w-8 h-8 text-black ${generating ? 'animate-spin' : ''}`} />
        </div>
        <h2 className="text-2xl font-sans font-bold text-black mb-2">No Flashcards Yet</h2>
        <p className="text-zinc-500 mb-8 max-w-md font-serif">
          Generate AI flashcards from your document to start studying optimally.
        </p>
        <button
          onClick={handleGenerateFlashcards}
          disabled={generating}
          className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Flashcards"}
        </button>
        <button onClick={() => navigate(-1)} className="mt-6 text-sm text-zinc-400 hover:text-black transition-colors">
          Go Back
        </button>
      </div>
    )
  }

  // SUMMARY VIEW
  if (showSummary) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
          <CheckCircle size={32} />
        </div>
        <h1 className="text-3xl font-sans font-bold text-black mb-2">Session Complete!</h1>
        <p className="text-zinc-500 mb-8 font-serif">You've reviewed all {flashcards.length} cards in this set.</p>

        <div className="flex gap-4">
          <button
            onClick={() => { setShowSummary(false); setCurrentCardIndex(0); }}
            className="px-6 py-2.5 border border-zinc-200 rounded-md font-medium text-black hover:bg-zinc-50 transition-colors"
          >
            Review Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-black text-white rounded-md font-medium hover:bg-zinc-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentCardIndex];
  // Progress Logic: (current / total) * 100
  const progressPercentage = ((currentCardIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans flex flex-col pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-full transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Studying</span>
          <span className="text-sm font-semibold text-black">
            {currentCardIndex + 1} <span className="text-zinc-400">/</span> {flashcards.length}
          </span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="max-w-xl mx-auto w-full px-6 mb-12">
        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-start px-6">
        <div className="w-full max-w-2xl perspective-1000 mb-12">
          {/* 
                   KEY PROP IS CRITICAL: 
                   It forces React to destroy and recreate the Flashcard component 
                   whenever the card ID changes. This resets the "flipped" state inside 
                   Flashcard.jsx so the next card always starts front-facing.
                */}
          <Flashcard
            key={currentCard._id || currentCardIndex}
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-8">
          <button
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className="group p-4 rounded-full border border-zinc-200 text-zinc-500 hover:text-black hover:border-black disabled:opacity-30 disabled:hover:border-zinc-200 transition-all"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Tap card to flip</span>
          </div>

          <button
            onClick={handleNextCard}
            className="group p-4 rounded-full bg-black text-white hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl transform active:scale-95"
          >
            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;