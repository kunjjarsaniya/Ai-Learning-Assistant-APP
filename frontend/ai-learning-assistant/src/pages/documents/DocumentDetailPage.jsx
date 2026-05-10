import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import documentService from '../../services/documentService';
import { BASE_URL } from '../../utils/apiPaths';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';

const DocumentDetailPage = () => {

  const { id } = useParams();
  const location = useLocation();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Content');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('Failed to fetch document details.');
        // console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // Helper function to get the full PDF URL
  const getPdfUrl = () => {
    if (!document) return null;

    // Get token for auth (since iframe can't send headers)
    const token = localStorage.getItem('token');
    const tokenParam = token ? `?token=${token}` : '';

    // Handle BASE_URL potentially having /api suffix (strip it to avoid duplication if filePath has it)
    const baseUrl = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL;

    // If it's a new upload with GridFS, the filePath is already set to the API route
    if (document.filePath && document.filePath.startsWith('/api/')) {
      return `${baseUrl}${document.filePath}${tokenParam}`;
    }

    // Fallback for old logic
    if (document.filePath) {
      if (document.filePath.startsWith('http')) return document.filePath;
      // Clean up legacy paths
      const cleanPath = document.filePath.replace('/uploads/documents/', '').replace('/uploads/', '');
      // If it serves from static uploads (won't work on Vercel but keeping for safety)
      return `${baseUrl}/uploads/documents/${cleanPath}`;
    }

    // Fallback construction
    return `${baseUrl}/api/documents/${id}/file${tokenParam}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (!document || !document.filePath) {
      return (
        <div className='bg-card glass border border-stone-200 rounded-lg p-8'>
          <div className='text-center'>
            <p className='text-lg font-semibold text-muted-foreground mb-2'>PDF not available</p>
            <p className='text-sm text-muted-foreground'>
              Document status: {document?.status || 'unknown'}
            </p>
            {document?.processingError && (
              <p className='text-sm text-destructive mt-2'>Error: {document.processingError}</p>
            )}
          </div>
        </div>
      );
    }

    const pdfUrl = getPdfUrl();
    // console.log('[DocumentDetailPage] PDF URL:', pdfUrl);
    // console.log('[DocumentDetailPage] Document:', document);

    return (
      <div className='bg-card glass border border-stone-200 rounded-lg overflow-hidden shadow-warm'>
        <div className='flex items-center justify-between p-3 sm:p-4 bg-stone-50 border-b border-stone-200'>
          <span className='text-xs sm:text-sm font-medium text-stone-700'>Document Viewer</span>
          <a
            href={pdfUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:text-primary-hover font-medium transition-colors'
          >
            <ExternalLink size={16} />
            <span className='hidden sm:inline'>Open in new tab</span>
          </a>
        </div>
        <div className='bg-stone-100 p-1'>
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            frameBorder="0"
            style={{
              colorScheme: 'light',
            }}
            className='w-full h-[550px] bg-white rounded border border-stone-300'
          // onLoad={() => console.log('[DocumentDetailPage] PDF iframe loaded')}
          // onError={(e) => console.error('[DocumentDetailPage] PDF iframe error:', e)}
          />
        </div>
        {/* Debug info - remove in production */}
        <div className='p-2 bg-stone-50 border-t border-stone-200 text-xs text-muted-foreground'>
          <details>
            <summary className='cursor-pointer hover:text-foreground'>Debug Info</summary>
            <div className='mt-2 space-y-1'>
              <p><strong>Document ID:</strong> {id}</p>
              <p><strong>GridFS ID:</strong> {document.gridFsId?.toString() || 'N/A'}</p>
              <p><strong>File Path:</strong> {document.filePath}</p>
              <p><strong>Status:</strong> {document.status}</p>
              <p><strong>PDF URL:</strong> {pdfUrl}</p>
            </div>
          </details>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />
  };

  const renderAIActions = () => {
    return <AIActions />
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />
  };

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() },
  ];

  if (loading) {
    return <div className='flex items-center justify-center min-h-screen'><Spinner /></div>;
  }

  if (!document) {
    return <div className='text-center p-8 text-muted-foreground'>Document not found</div>;
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        <div className='mb-4 sm:mb-6'>
          <Link to='/documents' className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group'>
            <ArrowLeft size={16} className='group-hover:-translate-x-1 transition-transform' />
            Back to Documents
          </Link>
        </div>
        <PageHeader title={document.title} />
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

export default DocumentDetailPage