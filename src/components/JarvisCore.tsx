
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Mic, MicOff, Send, Settings, AlertCircle } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';
import { toast } from "sonner";

interface JarvisCoreProps {
  apiEndpoint: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const JarvisCore: React.FC<JarvisCoreProps> = ({ apiEndpoint }) => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm JARVIS. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setProcessing(true);
    setInputText('');
    
    try {
      // Log the endpoint we're sending to for debugging
      console.log(`Sending message to: ${apiEndpoint}`);
      
      // First try with regular CORS mode to detect issues
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage.content }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const responseText = data.response || "I've processed your request.";
          
          // Add bot message
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: responseText,
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
          
          // Speak the response
          if (synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(responseText);
            synthRef.current.speak(utterance);
          }
          
          setCorsError(false);
          return; // Success! Exit the function
        }
      } catch (error) {
        // If there's an error, it might be CORS related, continue with no-cors
        console.log("Regular fetch failed, trying with no-cors mode:", error);
      }
      
      // If we're here, the regular fetch failed - try with no-cors as fallback
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });
      
      // With no-cors, we can't access the response content
      const responseText = "I received your message, but I can't provide a detailed response due to cross-origin restrictions. Please ensure the API server has CORS enabled.";
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setCorsError(true);
      
      // Speak the response
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        synthRef.current.speak(utterance);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error connecting to the API. This may be due to CORS restrictions when connecting to localhost from a hosted application.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setCorsError(true);
      toast.error('Failed to get a response. Connection issue detected.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Format time for messages
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-md border border-jarvis-blue/30 text-white shadow-lg flex flex-col h-[600px]">
      <CardHeader className="flex justify-center items-center pb-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-jarvis-blue to-jarvis-cyan flex items-center justify-center mb-2 relative">
          <div className={`absolute w-full h-full rounded-full ${isListening ? 'animate-ripple bg-jarvis-blue/30' : ''}`}></div>
          <div className="text-xl font-bold">J</div>
        </div>
        <h2 className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-jarvis-blue to-jarvis-cyan text-transparent bg-clip-text">JARVIS</h2>
        {corsError && (
          <div className="flex items-center gap-2 mt-1 text-amber-400 text-xs">
            <AlertCircle size={14} />
            <span>CORS issue detected. API responses limited.</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto py-4 px-3 space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser 
                  ? 'bg-jarvis-blue/80 rounded-tr-none' 
                  : 'bg-slate-800/90 rounded-tl-none'
              }`}
            >
              <p className="text-sm text-gray-100">{message.content}</p>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isListening && (
          <div className="flex justify-center">
            <VoiceVisualizer isListening={isListening} className="my-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-jarvis-blue/30 p-3">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
          <Button 
            type="button" 
            onClick={toggleListening}
            variant="outline"
            size="icon"
            className={`rounded-full w-10 h-10 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white border-red-400' : 'border-jarvis-blue/50 text-jarvis-cyan'}`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
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
            className="rounded-full w-10 h-10 border-jarvis-blue/50 text-jarvis-cyan"
          >
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default JarvisCore;
