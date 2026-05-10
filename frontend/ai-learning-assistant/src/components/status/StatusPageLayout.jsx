import React from 'react';
import { ArrowLeft } from 'lucide-react';

const StatusPageLayout = ({ 
  icon: Icon, 
  errorCode, 
  title, 
  description, 
  primaryAction, 
  secondaryAction 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="glass-strong border border-border rounded-3xl shadow-warm-lg p-8 sm:p-12 text-center relative overflow-hidden">
          
          {/* Subtle glowing orb inside the card behind the icon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

          {/* Error Code (if provided, e.g. 404, 500) */}
          {errorCode && (
            <div className="mb-6 relative z-10">
              <h1 className="text-7xl sm:text-9xl font-bold text-foreground bg-clip-text gradient-primary rounded-full drop-shadow-sm">
                {errorCode}
              </h1>
            </div>
          )}

          {/* Icon */}
          {!errorCode && Icon && (
            <div className="mb-6 flex justify-center relative z-10">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-glow-primary">
                <Icon className="w-10 h-10 text-primary" strokeWidth={2} />
              </div>
            </div>
          )}

          {/* Title & Description */}
          <div className="mb-8 space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center relative z-10">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="group inline-flex items-center justify-center gap-2 px-6 h-12 bg-card hover:bg-primary/5 text-foreground font-semibold text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95 border border-border"
              >
                {secondaryAction.icon && (
                  <secondaryAction.icon
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                )}
                {secondaryAction.text}
              </button>
            )}

            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="group inline-flex items-center justify-center gap-2 px-6 h-12 gradient-primary hover:shadow-glow-primary text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-warm active:scale-95"
              >
                {primaryAction.icon && <primaryAction.icon className="w-4 h-4" strokeWidth={2.5} />}
                {primaryAction.text}
              </button>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-pulse delay-75"></div>
      </div>
    </div>
  );
};

export default StatusPageLayout;
