
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Trash2, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConversationControlsProps {
  onSave: () => void;
  onClear: () => void;
  onLoad: () => void;
}

const ConversationControls: React.FC<ConversationControlsProps> = ({ 
  onSave,
  onClear, 
  onLoad
}) => {
  return (
    <div className="flex gap-2 mt-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSave}
              className="h-8 w-8 text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20"
            >
              <Save size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
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
              className="h-8 w-8 text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20"
            >
              <RotateCcw size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Load saved conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClear}
              className="h-8 w-8 text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20"
            >
              <Trash2 size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ConversationControls;
