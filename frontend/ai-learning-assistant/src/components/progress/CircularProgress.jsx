import React from 'react';

const CircularProgress = ({ value = 0, size = 160, strokeWidth = 12, label = 'Score' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const center = size / 2;

    // Color based on score
    const getColor = (val) => {
        if (val >= 80) return '#10B981'; // Green
        if (val >= 50) return '#E69A59'; // Amber (Primary)
        return '#EF4444'; // Red
    };

    const color = getColor(value);

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 1.5s ease-in-out, stroke 0.5s ease',
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-numbers text-foreground">{value}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{label}</span>
            </div>
        </div>
    );
};

export default CircularProgress;
