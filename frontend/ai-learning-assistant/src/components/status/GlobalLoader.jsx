import React from 'react';
import { motion } from 'framer-motion';

const GlobalLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-t-2 border-primary/30 animate-[spin_3s_linear_infinite]"></div>
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-r-2 border-primary/60 animate-[spin_2s_linear_infinite_reverse]"></div>
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border-b-2 border-primary animate-[spin_1.5s_linear_infinite]"></div>
          
          {/* Center Logo/Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
             <img src="/logo-512x512.png" alt="RankUP Logo" className="w-10 h-10 sm:w-14 sm:h-14 object-contain animate-pulse shadow-glow-primary rounded-xl" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2 text-center">
          <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent gradient-primary animate-pulse">
            Initializing RankUP
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground tracking-widest uppercase">
            Loading AI Cores...
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalLoader;
