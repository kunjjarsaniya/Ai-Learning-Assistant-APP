import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "No Data Found", 
  description = "There is nothing to display here yet.",
  action 
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center glass-strong border border-border rounded-2xl relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center shadow-sm mb-4 relative z-10">
        <Icon className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 relative z-10">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="relative z-10 inline-flex items-center gap-2 px-5 h-10 gradient-primary text-white font-medium text-sm rounded-lg shadow-warm hover:shadow-glow-primary transition-all active:scale-95"
        >
          {action.icon && <action.icon className="w-4 h-4" strokeWidth={2} />}
          {action.text}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
