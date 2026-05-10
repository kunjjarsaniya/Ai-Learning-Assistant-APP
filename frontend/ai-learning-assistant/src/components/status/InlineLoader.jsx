import React from 'react';
import { Loader2 } from 'lucide-react';

const InlineLoader = ({ text = "Loading..." }) => {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center text-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
};

export default InlineLoader;
