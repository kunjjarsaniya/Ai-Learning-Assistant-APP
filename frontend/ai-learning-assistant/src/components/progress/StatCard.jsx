import React from 'react';

const StatCard = ({ icon: Icon, label, value, suffix = '', description, color = 'primary', className = '' }) => {
    const colorMap = {
        primary: { bg: 'bg-primary/10', text: 'text-primary', glow: 'hover:shadow-glow-primary' },
        success: { bg: 'bg-success/10', text: 'text-success', glow: 'hover:shadow-[0_8px_24px_-4px_rgba(16,185,129,0.35)]' },
        info: { bg: 'bg-info/10', text: 'text-info', glow: 'hover:shadow-[0_8px_24px_-4px_rgba(59,130,246,0.35)]' },
        accent: { bg: 'bg-accent/10', text: 'text-accent', glow: 'hover:shadow-[0_8px_24px_-4px_rgba(0,229,255,0.35)]' },
        destructive: { bg: 'bg-destructive/10', text: 'text-destructive', glow: 'hover:shadow-[0_8px_24px_-4px_rgba(239,68,68,0.35)]' },
    };

    const colors = colorMap[color] || colorMap.primary;

    return (
        <div className={`group relative p-6 sm:p-8 rounded-2xl border-2 border-border bg-card transition-all duration-300 ${colors.glow} overflow-hidden hover:-translate-y-1 ${className}`}>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center justify-between mb-5">
                <span className="font-sans text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    {label}
                </span>
                <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
            </div>
            <div className="text-4xl sm:text-5xl font-numbers font-bold tracking-tight text-foreground mb-1">
                {value}<span className="text-lg text-muted-foreground ml-1">{suffix}</span>
            </div>
            {description && (
                <p className="text-xs text-muted-foreground font-sans mt-2">{description}</p>
            )}
        </div>
    );
};

export default StatCard;
