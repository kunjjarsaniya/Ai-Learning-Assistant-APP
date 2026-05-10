import React from 'react'
import { FileText, Plus } from 'lucide-react'
import Button from './Button'

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
    return (
        <div className='flex flex-col items-center justify-center py-16 px-6 text-center bg-card glass border-2 border-dashed border-border rounded-3xl'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 border border-border mb-6 shadow-warm'>
                <FileText className='w-8 h-8 text-muted-foreground' strokeWidth={1.5} />
            </div>
            <h3 className='text-xl font-bold text-foreground tracking-tight mb-2'>{title}</h3>
            <p className='text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed font-sans'>{description}</p>
            {buttonText && onActionClick && (
                <Button onClick={onActionClick} variant="primary">
                    <Plus className='w-5 h-5' strokeWidth={2} />
                    {buttonText}
                </Button>
            )}
        </div>
    )
}

export default EmptyState