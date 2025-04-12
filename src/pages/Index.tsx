
import React, { useState, useEffect } from 'react';
import JarvisCore from '@/components/JarvisCore';
import JarvisSettings from '@/components/JarvisSettings';
import { toast } from "sonner";

const Index = () => {
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:5678/webhook-test/firstCall');

  // Load saved endpoint from localStorage if available
  useEffect(() => {
    const savedEndpoint = localStorage.getItem('jarvis_api_endpoint');
    if (savedEndpoint) {
      setApiEndpoint(savedEndpoint);
    }
  }, []);

  const handleSaveSettings = (endpoint: string) => {
    setApiEndpoint(endpoint);
    localStorage.setItem('jarvis_api_endpoint', endpoint);
    toast.success('Settings saved successfully');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-jarvis-dark to-black p-4 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDcwZjMxMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]"></div>
      <div className="absolute inset-0 bg-gradient-radial from-jarvis-blue/10 via-transparent to-transparent"></div>
      <JarvisSettings apiEndpoint={apiEndpoint} onSaveSettings={handleSaveSettings} />
      <JarvisCore apiEndpoint={apiEndpoint} />
    </div>
  );
};

export default Index;
