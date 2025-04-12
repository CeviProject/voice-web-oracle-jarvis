
/**
 * Utility functions for conversation management in the JARVIS application
 */

import { toast } from "sonner";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

/**
 * Save the current conversation to local storage
 */
export const saveConversation = (messages: Message[]): void => {
  try {
    // Don't save if it's just the initial greeting
    if (messages.length <= 1) return;
    
    // Convert Date objects to ISO strings for storage
    const messagesToSave = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));
    
    localStorage.setItem('jarvis_conversation', JSON.stringify(messagesToSave));
    toast.success('Conversation saved');
  } catch (error) {
    console.error('Error saving conversation:', error);
    toast.error('Failed to save conversation');
  }
};

/**
 * Load conversation from local storage
 */
export const loadConversation = (): Message[] => {
  try {
    const savedConversation = localStorage.getItem('jarvis_conversation');
    
    if (!savedConversation) {
      return [];
    }
    
    // Convert ISO strings back to Date objects
    const parsedMessages = JSON.parse(savedConversation);
    return parsedMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Error loading conversation:', error);
    toast.error('Failed to load conversation');
    return [];
  }
};

/**
 * Clear the saved conversation from local storage
 */
export const clearSavedConversation = (): void => {
  try {
    localStorage.removeItem('jarvis_conversation');
    toast.success('Saved conversation cleared');
  } catch (error) {
    console.error('Error clearing conversation:', error);
    toast.error('Failed to clear saved conversation');
  }
};

/**
 * Copy message content to clipboard
 */
export const copyMessageToClipboard = (content: string): void => {
  try {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    toast.error('Failed to copy message');
  }
};

