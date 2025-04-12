
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Trash2, RotateCcw, FileDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConversationControlsProps {
  onSave: () => void;
  onClear: () => void;
  onLoad: () => void;
  onExport?: () => void;
}

const ConversationControls: React.FC<ConversationControlsProps> = ({ 
  onSave,
  onClear, 
  onLoad,
  onExport
}) => {
  return (
    <div className="flex gap-2 mt-2 bg-black/20 backdrop-blur-sm rounded-full p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSave}
              className="h-8 w-8 text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20 rounded-full transition-all duration-300"
            >
              <Save size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-jarvis-dark border-jarvis-blue/30 text-white">
            <p>Save conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLoad}
              className="h-8 w-8 text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20 rounded-full transition-all duration-300"
            >
              <RotateCcw size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-jarvis-dark border-jarvis-blue/30 text-white">
            <p>Load saved conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onExport && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onExport}
                className="h-8 w-8 text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20 rounded-full transition-all duration-300"
              >
                <FileDown size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-jarvis-dark border-jarvis-blue/30 text-white">
              <p>Export as text file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClear}
              className="h-8 w-8 text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20 rounded-full transition-all duration-300"
            >
              <Trash2 size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-jarvis-dark border-jarvis-blue/30 text-white">
            <p>Clear conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ConversationControls;
