import React, { useEffect, useState } from 'react';
import { Plus, Upload, Trash2, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import DocumentCard from '../../components/documents/DocumentCard';

const DocumentListPage = () => {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for upload model
  const [isUploadModelOpen, setIsUploadModelOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents.');
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error('Please provide a title and select a file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success('Document uploaded successfully.');
      setIsUploadModelOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed");
      // console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted successfully.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      fetchDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center min-h-[400px]'>
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center max-w-md'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-card border border-stone-200 mb-6'>
              <FileText
                className='w-10 h-10 text-muted-foreground'
                strokeWidth={1.5}
              />
            </div>
            <h3 className='text-xl font-bold text-foreground mb-2 tracking-tight'>
              No Documents Found
            </h3>
            <p className='text-muted-foreground mb-6 text-sm font-sans'>
              Get started by uploading your first PDF document to begin learning.
            </p>
            <Button
              onClick={() => setIsUploadModelOpen(true)}
              variant="primary"
            >
              <Plus className='mr-2' size={18} />
              Upload Document
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6'>
        {documents?.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2'>
              My Documents
            </h1>
            <p className='text-muted-foreground text-sm font-sans'>
              Manage and organize your learning materials.
            </p>
          </div>
          {documents.length > 0 && (
            <Button onClick={() => setIsUploadModelOpen(true)} variant="primary" className="w-full sm:w-auto">
              <Plus className='mr-2' size={18} />
              Upload Document
            </Button>
          )}
        </div>
        {renderContent()}
      </div>

      {isUploadModelOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm animation-fade-in'>
          <div className='relative w-full max-w-lg glass-strong border border-stone-200 rounded-xl shadow-warm-lg p-6 sm:p-8'>
            {/* Close button */}
            <button
              onClick={() => setIsUploadModelOpen(false)}
              className='absolute top-4 sm:top-6 right-4 sm:right-6 p-1 text-stone-400 hover:text-foreground transition-colors rounded-full hover:bg-stone-100'
            >
              <X className='w-5 h-5' strokeWidth={2} />
            </button>

            {/* Model Header */}
            <div className='mb-6 sm:mb-8'>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground tracking-tight'>
                Upload New Document
              </h2>
              <p className='text-sm text-muted-foreground mt-1 font-sans'>
                Add a PDF document to your library
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleUpload} className='space-y-4 sm:space-y-6'>
              {/* Title Input */}
              <div className='space-y-2'>
                <label className='block text-xs font-bold text-stone-600 uppercase tracking-wider font-sans'>
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className='w-full h-11 sm:h-12 px-4 border border-stone-300 rounded-md bg-background text-foreground placeholder-stone-400 text-sm font-medium transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'
                  placeholder='e.g., React Interview Prep'
                />
              </div>

              {/* File Upload */}
              <div className='space-y-2'>
                <label className='block text-xs font-bold text-stone-600 uppercase tracking-wider font-sans'>
                  PDF File
                </label>
                <div className='relative border border-dashed border-stone-300 rounded-lg bg-stone-50 hover:bg-stone-100 hover:border-primary transition-all duration-200 group'>
                  <input
                    id="file-upload"
                    type="file"
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    onChange={handleFileChange}
                    required
                    accept=".pdf"
                  />
                  <div className='flex flex-col items-center justify-center py-8 sm:py-10 px-6'>
                    <div className='w-12 h-12 rounded-full bg-card border border-stone-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                      <Upload
                        className='w-6 h-6 text-primary'
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className='text-sm font-medium text-foreground mb-1 font-sans text-center'>
                      {uploadFile ? (
                        <span className='font-bold underline decoration-stone-300 underline-offset-4'>
                          {uploadFile.name}
                        </span>
                      ) : (
                        <>
                          <span className='font-bold underline decoration-stone-300 underline-offset-4'>Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className='text-xs text-muted-foreground font-sans'>PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setIsUploadModelOpen(false)}
                  disabled={uploading}
                  className='flex-1 h-11 px-4 border border-stone-300 rounded-md bg-background text-stone-700 text-sm font-semibold hover:bg-stone-50 hover:border-stone-400 transition-all order-2 sm:order-1'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={uploading}
                  className='flex-1 h-11 px-4 gradient-primary hover:shadow-glow-primary text-white text-sm font-semibold rounded-md transition-all shadow-warm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2'
                >
                  {uploading ? (
                    <span className='flex items-center justify-center gap-2'>
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-50 bg-stone-900/20 backdrop-blur-sm p-4 flex items-center justify-center animation-fade-in'>
          <div className='relative w-full max-w-md glass-strong border border-stone-200 rounded-xl p-6 sm:p-8 shadow-warm-lg'>
            {/* Close button */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className='absolute top-4 sm:top-6 right-4 sm:right-6 p-1 text-stone-400 hover:text-foreground transition-colors rounded-full hover:bg-stone-100'
            >
              <X className='w-5 h-5' strokeWidth={2} />
            </button>

            {/* Model Header */}
            <div className='mb-6'>
              <div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4'>
                <Trash2 className='w-6 h-6 text-destructive' strokeWidth={1.5} />
              </div>
              <h2 className='text-xl font-bold text-foreground tracking-tight'>
                Confirm Deletion
              </h2>
            </div>

            {/* Content */}
            <p className='text-sm text-stone-600 mb-8 leading-relaxed'>
              Are you sure you want to delete this document: {" "}
              <span className='font-bold text-foreground'>
                {selectedDoc?.title}
              </span>
              ? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                type='button'
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className='flex-1 h-11 px-4 border border-stone-300 rounded-md bg-background text-stone-700 text-sm font-semibold hover:bg-stone-50 hover:border-stone-400 transition-all order-2 sm:order-1'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className='flex-1 h-11 px-4 bg-destructive hover:bg-destructive/90 text-white text-sm font-semibold rounded-md transition-all shadow-warm active:scale-95 disabled:opacity-70 order-1 sm:order-2'
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentListPage