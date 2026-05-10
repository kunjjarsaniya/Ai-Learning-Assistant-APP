import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from 'lucide-react'
import moment from 'moment'

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return 'N/A';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {

    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/documents/${document._id}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(document);
    };

    return <div
        className='group relative bg-card/50 glass border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-glow-primary transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1'
        onClick={handleNavigate}
    >
        {/* Header Section */}
        <div>
            <div className='flex items-start justify-between gap-3 mb-4'>
                <div className='shrink-0 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform duration-300'>
                    <FileText className='w-6 h-6 text-white' strokeWidth={2} />
                </div>
                <button
                    onClick={handleDelete}
                    className='opacity-0 group-hover:opacity-100 duration-300 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200'
                >
                    <Trash2 className='w-4 h-4' strokeWidth={2} />
                </button>
            </div>

            {/* Title */}
            <h3 className='text-base font-semibold text-foreground truncate mb-2 font-sans' title={document.title}>
                {document.title}
            </h3>

            {/* Document Info */}
            <div className='flex items-center gap-3 text-xs text-muted-foreground mb-3'>
                {document.fileSize !== undefined && (
                    <>
                        <span className='font-medium'>{formatFileSize(document.fileSize)}</span>
                    </>
                )}
            </div>

            {/* Status Section */}
            <div className='flex flex-wrap items-center gap-2'>
                {document.flashcardCount !== undefined && (
                    <div className='flex items-center gap-1 px-2 py-1 bg-info/10 rounded-lg'>
                        <BookOpen className='w-3.5 h-3.5 text-info' strokeWidth={2} />
                        <span className='text-[10px] font-semibold text-info'>{document.flashcardCount} Flashcards</span>
                    </div>
                )}
                {document.quizCount !== undefined && (
                    <div className='flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg'>
                        <BrainCircuit className='w-3.5 h-3.5 text-primary' strokeWidth={2} />
                        <span className='text-[10px] font-semibold text-primary'>{document.quizCount} Quizzes</span>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Section */}
        <div className='mt-5 pt-4 border-t border-border'>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Clock className='w-3.5 h-3.5' strokeWidth={2} />
                <span>Uploaded {moment(document.createdAt).fromNow()}</span>
            </div>
        </div>

        {/* Hover Overlay */}
        <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-sage/0 group-hover:from-primary/5 group-hover:to-sage/5 transition-all duration-300 pointer-events-none' />
    </div>
};

export default DocumentCard