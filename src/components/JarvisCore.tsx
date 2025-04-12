
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Mic, MicOff, Send, Settings, AlertCircle, Copy, Save, Trash2, RotateCcw, FileDown, Loader2, Command, Moon, SunMedium } from 'lucide-react';
import VoiceVisualizer from './VoiceVisualizer';
import { toast } from "sonner";
import { 
  Message, 
  saveConversation, 
  loadConversation,
  clearSavedConversation,
  copyMessageToClipboard 
} from '@/utils/conversationUtils';
import ConversationControls from './ConversationControls';

interface JarvisCoreProps {
  apiEndpoint: string;
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
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load saved conversation when component mounts
  useEffect(() => {
    const savedMessages = loadConversation();
    if (savedMessages.length > 0) {
      setMessages(prev => {
        // Keep the greeting message if no saved messages exist
        if (savedMessages.length === 0) return prev;
        return savedMessages;
      });
    }
  }, []);

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

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter to send message
      if (e.ctrlKey && e.key === 'Enter') {
        sendMessage();
      }
      
      // Ctrl+M to toggle mic
      if (e.ctrlKey && e.key === 'm') {
        toggleListening();
      }
      
      // Ctrl+S to save conversation
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveConversation();
      }
      
      // Alt+C to clear conversation
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        handleClearConversation();
      }
      
      // Alt+/ to focus input
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputText, isListening]);

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

  const parseResponse = (data: any): string => {
    // Case 1: Array with objects containing 'output' property
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      return data[0].output.trim();
    }
    
    // Case 2: Object with response or message property
    if (typeof data === 'object') {
      if (data.response) return data.response;
      if (data.message) return data.message;
      if (data.output) return data.output;
      if (data.data && data.data.content) return data.data.content;
    }
    
    // Case 3: Direct string
    if (typeof data === 'string') {
      return data;
    }
    
    // Fallback: stringify the response
    return JSON.stringify(data);
  };

  const handleSaveConversation = () => {
    saveConversation(messages);
    toast.success('Conversation saved to local storage');
  };

  const handleClearConversation = () => {
    // Reset to initial greeting
    setMessages([{
      id: '1',
      content: "Hello! I'm JARVIS. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }]);
    clearSavedConversation();
    toast.success('Conversation cleared');
  };

  const handleCopyMessage = (content: string) => {
    copyMessageToClipboard(content);
  };

  const handleLoadSavedConversation = () => {
    const savedMessages = loadConversation();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
      toast.success('Conversation loaded');
    } else {
      toast.info('No saved conversation found');
    }
  };

  const exportConversation = () => {
    // Create text content
    let text = "JARVIS Conversation Export\n";
    text += "=============================\n\n";
    
    messages.forEach(msg => {
      const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const speaker = msg.isUser ? "User" : "JARVIS";
      text += `[${time}] ${speaker}: ${msg.content}\n\n`;
    });
    
    // Create file and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Conversation exported to text file');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Log the endpoint we're sending to for debugging
      console.log(`Sending message to: ${apiEndpoint}`);
      
      // First try with regular CORS mode
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage.content,
            source: "jarvis-web-ui"
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Parse the response to extract the actual message content
          const responseText = parseResponse(data);
          
          // Add bot message after a small delay to simulate thinking
          setTimeout(() => {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: responseText,
              isUser: false,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
            
            // Speak the response
            if (synthRef.current) {
              const utterance = new SpeechSynthesisUtterance(responseText);
              synthRef.current.speak(utterance);
            }
            
            setCorsError(false);
          }, 800);
          
          return; // Success! Exit the function
        } else {
          console.error('Error response:', response.status);
          throw new Error(`Server returned ${response.status}`);
        }
      } catch (error) {
        // If there's an error, it might be CORS related, continue with no-cors
        console.log("Regular fetch failed, trying with no-cors mode:", error);
      }
      
      // If we're here, the regular fetch failed - try with no-cors as fallback
      await fetch(apiEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          source: "jarvis-web-ui"
        }),
      });
      
      // With no-cors, we can't access the response content
      const responseText = "I received your message, but I can't provide a detailed response due to cross-origin restrictions. Please ensure the API server has CORS enabled with: Access-Control-Allow-Origin: *";
      
      // Add bot message after a delay
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseText,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        setCorsError(true);
        
        // Speak the response
        if (synthRef.current) {
          const utterance = new SpeechSynthesisUtterance(responseText);
          synthRef.current.speak(utterance);
        }
      }, 800);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      setTimeout(() => {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error connecting to the API. This may be due to CORS restrictions or server issues. Make sure your API server is running and has CORS enabled.',
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        setCorsError(true);
        toast.error('Failed to get a response. Connection issue detected.');
      }, 800);
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
    <Card className={`w-full max-w-md mx-auto backdrop-blur-md border border-jarvis-blue/30 text-white shadow-lg flex flex-col h-[600px] transition-all duration-300 ${darkMode ? 'bg-black/80' : 'bg-white/10'}`}>
      <CardHeader className="flex justify-center items-center pb-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-jarvis-blue to-jarvis-cyan flex items-center justify-center mb-2 relative pulse-glow">
          <div className={`absolute w-full h-full rounded-full ${isListening ? 'animate-ripple bg-jarvis-blue/30' : ''}`}></div>
          <div className="text-xl font-bold">J</div>
        </div>
        <h2 className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-jarvis-blue to-jarvis-cyan text-transparent bg-clip-text">JARVIS</h2>
        
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-8 w-8 rounded-full text-jarvis-cyan hover:text-white hover:bg-jarvis-blue/20"
          >
            {darkMode ? <SunMedium size={16} /> : <Moon size={16} />}
          </Button>
          
          {corsError && (
            <div className="flex items-center gap-2 text-amber-400 text-xs">
              <AlertCircle size={14} />
              <span>CORS issue detected</span>
            </div>
          )}
          
          <div className="flex items-center text-xs text-jarvis-cyan/70">
            <Command size={12} className="mr-1" /> + / to focus
          </div>
        </div>
        
        <ConversationControls 
          onSave={handleSaveConversation}
          onClear={handleClearConversation}
          onLoad={handleLoadSavedConversation}
          onExport={exportConversation}
        />
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto py-4 px-3 space-y-3">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg group relative ${
                message.isUser 
                  ? 'bg-gradient-to-r from-jarvis-blue/90 to-jarvis-blue/70 rounded-tr-none backdrop-blur-sm' 
                  : 'bg-gradient-to-r from-slate-800/90 to-slate-700/80 rounded-tl-none backdrop-blur-sm'
              } transition-all hover:shadow-md hover:shadow-jarvis-blue/10`}
            >
              <p className="text-sm text-gray-100">{message.content}</p>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formatTime(message.timestamp)}
              </p>
              <button 
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1"
                onClick={() => handleCopyMessage(message.content)}
                aria-label="Copy message"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-slate-800/90 rounded-tl-none">
              <div className="typing-indicator">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}
        
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
            className={`rounded-full w-10 h-10 transition-all duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600 text-white border-red-400' : 'border-jarvis-blue/50 text-jarvis-cyan'}`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
          
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message... (Alt + / to focus)"
            className="bg-slate-800/40 border-jarvis-blue/30 text-white focus:border-jarvis-cyan focus:ring-1 focus:ring-jarvis-cyan/30 transition-all"
          />
          
          <Button
            type="submit"
            variant="outline"
            size="icon"
            disabled={!inputText.trim() || processing}
            className="rounded-full w-10 h-10 border-jarvis-blue/50 text-jarvis-cyan hover:bg-jarvis-blue/20 transition-all duration-300"
          >
            {processing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default JarvisCore;
