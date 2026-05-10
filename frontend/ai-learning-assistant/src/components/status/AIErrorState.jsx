import React from 'react';
import { Bot, RotateCcw } from 'lucide-react';

const AIErrorState = ({ 
  title = "AI Processing Failed", 
  description = "The AI encountered an unexpected error while generating your content. Please try again.",
  onRetry 
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-destructive/5 border border-destructive/20 rounded-2xl relative overflow-hidden">
      <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-glow-primary">
        <Bot className="w-8 h-8 text-destructive animate-pulse" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-bold text-destructive mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 relative z-10">
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="relative z-10 inline-flex items-center gap-2 px-5 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium text-sm rounded-lg shadow-sm transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default AIErrorState;
