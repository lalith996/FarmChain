'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { chatbotAPI } from '@/lib/chatbot-api';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! 👋 Welcome to FarmChain. I\'m your AI assistant powered by Google Gemini. How can I help you today?',
      timestamp: new Date(),
      quickReplies: [
        'How does FarmChain work?',
        'How do I list products?',
        'Tell me about blockchain verification'
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState('session-' + Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        sender: msg.sender,
        text: msg.text,
      }));

      const response = await chatbotAPI.sendMessage(textToSend, sessionId, conversationHistory);

      const botMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.data.message,
        timestamp: new Date(response.data.data.timestamp),
        quickReplies: response.data.data.quickReplies || [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Chat cleared! How can I help you?',
        timestamp: new Date(),
        quickReplies: [
          'How does FarmChain work?',
          'How do I list products?',
          'Tell me about blockchain verification'
        ],
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">FarmChain AI</h3>
            <p className="text-xs text-green-100">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Clear chat"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Quick Replies */}
            {message.sender === 'bot' && message.quickReplies && message.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 ml-2">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-2 text-xs bg-white border-2 border-green-200 text-green-700 rounded-full hover:bg-green-50 hover:border-green-300 transition-all duration-200 shadow-sm"
                    disabled={isLoading}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about FarmChain..."
            className="flex-1 resize-none rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-green-500 transition-colors max-h-32 text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by Google Gemini AI • Press Enter to send
        </p>
      </div>
    </div>
  );
}
