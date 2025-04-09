
import React from 'react';
import { cn } from "@/lib/utils";

interface VoiceVisualizerProps {
  isListening: boolean;
  className?: string;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening, className }) => {
  const bars = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className={cn("flex items-end justify-center gap-1 h-8", className)}>
      {bars.map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-jarvis-cyan rounded-full transition-all duration-75",
            isListening ? "animate-pulse" : "h-1"
          )}
          style={{
            height: isListening ? `${Math.random() * 32 + 4}px` : '4px',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
