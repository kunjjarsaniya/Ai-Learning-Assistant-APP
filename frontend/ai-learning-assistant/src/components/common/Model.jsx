import React from 'react';
import { X } from 'lucide-react';

const Model = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'>
        <div
            className='fixed inset-0 bg-foreground/10 backdrop-blur-sm transition-opacity'
            onClick={onClose}
        ></div>

        <div className='relative w-full max-w-md bg-card border-2 border-border rounded-2xl shadow-warm-lg p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200'>
            <button
                onClick={onClose}
                className='absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200'
            >
                <X className='w-5 h-5' strokeWidth={2} />
            </button>

            <div className='mb-6 pr-8'>
                <h3 className='text-xl font-medium text-foreground tracking-tight'>
                    {title}
                </h3>
            </div>

            <div>
                {children}
            </div>
        </div>
    </div>
}

export default Model