
import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isListening: boolean;
  className?: string;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, className }) => {
  const bars = Array.from({ length: 10 }, (_, i) => i);
  
  return (
    <div className={cn("flex items-end justify-center gap-1 h-16", className)}>
      {bars.map((i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 bg-jarvis-cyan rounded-full transition-all duration-75",
            isListening ? "animate-pulse" : "h-2"
          )}
          style={{
            height: isListening ? `${Math.random() * 64 + 8}px` : '8px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
