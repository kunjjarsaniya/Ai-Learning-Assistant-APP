import React from 'react'

const PageHeader = ({ title, subtitle, children }) => {
    return (
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8'>
            <div>
                <h1 className='text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2'>
                    {title}
                </h1>
                {subtitle && (
                    <p className='text-sm text-muted-foreground font-sans'>
                        {subtitle}
                    </p>
                )}
            </div>
            {children && (
                <div className='flex-shrink-0'>
                    {children}
                </div>
            )}
        </div>
    )
}

export default PageHeader