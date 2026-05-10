import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';
import { useNotification } from '../../context/NotificationContext';

const FlashcardsListPage = () => {

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();

        // console.log("fetchFlashcardSets__", response.data);

        setFlashcardSets(response.data);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets');
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcardSets();
  }, []);

  const handleDeleteRequest = (set) => {
    setDeleteConfirm(set);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(deleteConfirm._id);
      setFlashcardSets(prev => prev.filter(s => s._id !== deleteConfirm._id));

      const setParams = deleteConfirm.document?.title || deleteConfirm.documentId?.title || 'Unknown Document';
      addNotification(
        'Flashcard Set Deleted',
        `The flashcards for "${setParams}" have been permanently deleted.`,
        'info'
      );
      toast.success('Flashcard set deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete flashcard set');
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No flashcard sets found"
          description="You haven't generated any flashcard yet. Go to a document to create your first set."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };


  return (
    <div>
      <PageHeader title="All Flashcard Sets" />
      {renderContent()}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='glass-strong border-2 border-stone-200 rounded-2xl shadow-warm-lg p-6 max-w-md w-full'>
            <h3 className='text-lg sm:text-xl font-bold text-foreground mb-2'>Delete Flashcard Set?</h3>
            <p className='text-sm sm:text-base text-muted-foreground mb-2'>
              Are you sure you want to delete the flashcard set for:
            </p>
            <p className='text-sm sm:text-base font-bold text-foreground mb-6'>
              "{deleteConfirm.document?.title || deleteConfirm.documentId?.title || 'Untitled Document'}"
            </p>
            <p className='text-xs sm:text-sm text-muted-foreground mb-6'>
              This action cannot be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className='flex-1 h-11 px-4 bg-stone-100 hover:bg-stone-200 text-foreground font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className='flex-1 h-11 px-4 bg-destructive hover:bg-destructive/90 text-white font-semibold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-warm disabled:opacity-50'
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FlashcardsListPage