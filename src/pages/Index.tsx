
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

  // Add animated particles effect
  useEffect(() => {
    const canvas = document.getElementById('stars-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    
    // Create stars
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.1
      });
    }
    
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Move star
        star.y += star.speed;
        
        // Reset position if off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSaveSettings = (endpoint: string) => {
    setApiEndpoint(endpoint);
    localStorage.setItem('jarvis_api_endpoint', endpoint);
    toast.success('Settings saved successfully');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-jarvis-dark to-black p-4 relative overflow-hidden">
      <canvas id="stars-canvas" className="absolute inset-0 z-0"></canvas>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDcwZjMxMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] z-0 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-radial from-jarvis-blue/10 via-transparent to-transparent z-0"></div>
      
      {/* Add floating circles for aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-jarvis-blue/5 blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-60 h-60 rounded-full bg-jarvis-cyan/5 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="z-10">
        <JarvisSettings apiEndpoint={apiEndpoint} onSaveSettings={handleSaveSettings} />
        <JarvisCore apiEndpoint={apiEndpoint} />
      </div>
    </div>
  );
};

export default Index;
