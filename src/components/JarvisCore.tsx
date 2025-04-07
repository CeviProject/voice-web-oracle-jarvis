
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Mic, MicOff, Send, Settings } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';
import { toast } from "sonner";

interface JarvisCoreProps {
  apiEndpoint: string;
}

const JarvisCore: React.FC<JarvisCoreProps> = ({ apiEndpoint }) => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInputText(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };
    } else {
      toast.error('Speech recognition is not supported in this browser.');
    }
    
    synthRef.current = window.speechSynthesis;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    setProcessing(true);
    setOutputText('');
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const responseText = data.response || 'No response received.';
      
      setOutputText(responseText);
      
      // Speak the response
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        synthRef.current.speak(utterance);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get a response. Please try again.');
      setOutputText('Sorry, I encountered an error processing your request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-md border border-jarvis-blue/30 text-white shadow-lg">
      <CardHeader className="flex justify-center items-center pb-0">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-jarvis-blue to-jarvis-cyan flex items-center justify-center mb-2 relative">
          <div className={`absolute w-full h-full rounded-full ${isListening ? 'animate-ripple bg-jarvis-blue/30' : ''}`}></div>
          <div className="text-3xl font-bold">J</div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-jarvis-blue to-jarvis-cyan text-transparent bg-clip-text">JARVIS</h2>
      </CardHeader>
      
      <CardContent className="mt-4">
        <div className="flex flex-col gap-4">
          {outputText && (
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-gray-100">{outputText}</p>
            </div>
          )}
          
          <VoiceVisualizer isListening={isListening} className="my-4" />
          
          <div className="bg-slate-900/70 p-3 rounded-lg min-h-[60px] flex items-center">
            <p className="text-gray-300">{inputText || "Say something..."}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Button 
            type="button" 
            onClick={toggleListening}
            variant="outline"
            size="icon"
            className={`rounded-full w-12 h-12 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white border-red-400' : 'border-jarvis-blue/50 text-jarvis-cyan'}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
          
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="bg-slate-800/40 border-jarvis-blue/30 text-white"
          />
          
          <Button
            type="submit"
            variant="outline"
            size="icon"
            disabled={!inputText.trim() || processing}
            className="rounded-full w-12 h-12 border-jarvis-blue/50 text-jarvis-cyan"
          >
            <Send size={20} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default JarvisCore;
