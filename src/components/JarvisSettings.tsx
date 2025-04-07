
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface JarvisSettingsProps {
  apiEndpoint: string;
  onSaveSettings: (endpoint: string) => void;
}

const JarvisSettings: React.FC<JarvisSettingsProps> = ({ apiEndpoint, onSaveSettings }) => {
  const [endpoint, setEndpoint] = useState(apiEndpoint);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSaveSettings(endpoint);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-jarvis-cyan">
          <Settings size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 text-white border border-jarvis-blue/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">JARVIS Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="api-endpoint" className="text-gray-300">API Endpoint URL</Label>
            <Input
              id="api-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://your-api-endpoint.com/api"
              className="bg-slate-800 border-jarvis-blue/30 text-white"
            />
            <p className="text-xs text-gray-400">This is the endpoint where your voice commands will be sent.</p>
          </div>
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-to-r from-jarvis-blue to-jarvis-cyan hover:from-jarvis-blue/90 hover:to-jarvis-cyan/90 text-white"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JarvisSettings;
