import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender, Command } from './types';
import ChatMessage from './components/ChatMessage';
import InputBar from './components/InputBar';
import CommandMenu from './components/CommandMenu';
import CommandParameterInput from './components/CommandParameterInput';
import { getAiResponseStream } from './services/geminiService';
import { getIPAddress } from './services/ipService';
import { commands } from './commands';

const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      {
        id: 1,
        sender: Sender.Bot,
        text: "Selamat datang di Robot AI! Ketik pesan atau klik ikon menu di kiri atas untuk melihat daftar perintah."
      }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [parameterPrompt, setParameterPrompt] = useState<{ command: Command } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = useCallback((sender: Sender, text?: string, component?: React.ReactNode) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender, text, component }]);
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processCommand = useCallback(async (text: string) => {
    setIsLoading(true);

    const [commandValue, ...args] = text.trim().split(' ');
    const prompt = args.join(' ');

    const handleAiInteraction = async (aiPrompt: string) => {
      const botMessageId = Date.now() + Math.random();
      // Add a placeholder message with a special character
      setMessages(prev => [...prev, { id: botMessageId, sender: Sender.Bot, text: '▌' }]);
      
      try {
        const stream = await getAiResponseStream(aiPrompt);
        let firstChunk = true;
        for await (const chunk of stream) {
          setMessages(prev => prev.map(msg => {
            if (msg.id === botMessageId) {
              let newText = msg.text || '';
              if (firstChunk) {
                newText = ''; // Clear placeholder on first chunk
                firstChunk = false;
              }
              return { ...msg, text: newText + (chunk.text || '') };
            }
            return msg;
          }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        const fullError = `Maaf, terjadi kesalahan: ${errorMessage}.`;
        setMessages(prev => prev.map(msg => {
          if (msg.id === botMessageId) {
            return { ...msg, text: fullError };
          }
          return msg;
        }));
      } finally {
        setIsLoading(false);
      }
    };

    switch (commandValue.toLowerCase()) {
      case '/ping':
        setTimeout(() => {
          addMessage(Sender.Bot, 'Pong!');
          setIsLoading(false);
        }, 500);
        break;
      case '/ip':
        const ip = await getIPAddress();
        addMessage(Sender.Bot, `Alamat IP publik Anda adalah: ${ip}`);
        setIsLoading(false);
        break;
      case '/ai':
        handleAiInteraction(prompt);
        break;
      default:
        if (!commandValue.startsWith('/')) {
          handleAiInteraction(text);
        } else {
          addMessage(Sender.Bot, `Perintah '${commandValue}' tidak dikenali.`);
          setIsLoading(false);
        }
        break;
    }
  }, [addMessage]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    addMessage(Sender.User, text);
    setInputValue('');

    const [commandValue] = text.trim().split(' ');
    const command = commands.find(c => c.value === commandValue.toLowerCase());

    if (command?.requiresParam && text.trim().split(' ').length === 1) {
      setParameterPrompt({ command });
      return;
    }
    
    processCommand(text);
  };

  const handleSelectCommand = (command: Command) => {
    setIsMenuOpen(false);
    if (command.requiresParam) {
      setParameterPrompt({ command });
    } else {
      handleSendMessage(command.value);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  const handleParameterSubmit = (parameter: string) => {
    if (!parameterPrompt) return;
    
    const { command } = parameterPrompt;
    const fullCommand = `${command.value} ${parameter}`;
    
    // Don't add user message here, handleSendMessage will do it
    setParameterPrompt(null);
    handleSendMessage(fullCommand);
  };

  return (
    <div className="flex flex-col h-screen bg-comic-bg font-comic">
      <CommandMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onSelectCommand={handleSelectCommand}
      />

      {parameterPrompt && (
        <CommandParameterInput
            isOpen={!!parameterPrompt}
            command={parameterPrompt.command}
            onClose={() => setParameterPrompt(null)}
            onSubmit={handleParameterSubmit}
        />
      )}
      
      <header className="bg-comic-user p-4 shadow-comic z-10 border-b-4 border-comic-dark flex items-center justify-between relative">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="text-comic-dark hover:text-comic-primary transition-colors z-20"
          aria-label="Buka menu perintah"
        >
          <HamburgerIcon />
        </button>
        <h1 className="text-3xl font-bold text-comic-dark absolute left-1/2 -translate-x-1/2 tracking-wider">ROBOT AI</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && !messages[messages.length-1].text?.endsWith('▌') && (
            <div className="flex items-start gap-3 justify-start">
                <div className="w-10 h-10 rounded-full bg-comic-primary border-2 border-comic-dark flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 8a1 1 0 11-2 0 1 1 0 012 0zm12 0a1 1 0 11-2 0 1 1 0 012 0zM8 13a4 4 0 004 4h.01a4.01 4.01 0 003.99-4H8z" />
                    </svg>
                </div>
                <div className="bg-comic-bot text-comic-dark rounded-lg px-4 py-3 border-2 border-comic-dark shadow-comic-sm flex items-center space-x-2">
                    <span className="font-bold">AI sedang berpikir</span>
                    <div className="w-3 h-3 bg-comic-dark rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-comic-dark rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 bg-comic-dark rounded-full animate-bounce"></div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <InputBar 
        ref={inputRef}
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        value={inputValue}
        onChange={setInputValue}
      />
    </div>
  );
};

export default App;