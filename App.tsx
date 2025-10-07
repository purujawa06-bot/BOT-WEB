import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender, Command, TiktokResult, TiktokApiResponse } from './types';
import ChatMessage from './components/ChatMessage';
import InputBar from './components/InputBar';
import CommandMenu from './components/CommandMenu';
import CommandParameterInput from './components/CommandParameterInput';
import { getAiResponseStream } from './services/geminiService';
import { getIPAddress } from './services/ipService';
import { commands } from './commands';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const TiktokVideo: React.FC<{ data: TiktokResult }> = ({ data }) => {
  const videoNoWm = data.data?.find(d => d.type === 'nowatermark')?.url;
  const videoNoWmHd = data.data?.find(d => d.type === 'nowatermark_hd')?.url;
  const musicUrl = data.music_info?.url;

  const hasDownloads = !!(videoNoWm || videoNoWmHd || musicUrl);

  // If no downloadable content is found, show an error.
  if (!hasDownloads) {
    return <p className="text-comic-dark">Gagal memproses video. URL mungkin tidak valid atau video tidak tersedia.</p>;
  }

  return (
    <div className="w-full">
      {data.author && (
        <div className="flex items-center gap-3 mb-3">
          <img src={data.author.avatar} alt={data.author.nickname} className="w-10 h-10 rounded-full border-2 border-comic-dark" />
          <span className="font-bold text-comic-dark">{data.author.nickname}</span>
        </div>
      )}
      {data.title && <p className="mb-3 text-sm">{data.title}</p>}
      
      {videoNoWm && (
        <video
          controls
          src={videoNoWm}
          poster={data.cover}
          className="w-full rounded-lg border-2 border-comic-dark mb-4"
        >
          Browser Anda tidak mendukung tag video.
        </video>
      )}

      {hasDownloads && (
        <div className="space-y-2">
          <h4 className="font-bold text-comic-primary">Unduh</h4>
          {videoNoWmHd && (
            <a href={videoNoWmHd} target="_blank" rel="noopener noreferrer" download className="flex items-center justify-center w-full px-4 py-2 rounded-lg font-bold bg-comic-primary text-white hover:bg-comic-secondary transition-colors duration-200 border-2 border-comic-dark shadow-comic-sm active:shadow-none active:translate-y-px active:translate-x-px">
              <DownloadIcon /> Video HD
            </a>
          )}
          {videoNoWm && videoNoWmHd !== videoNoWm && (
            <a href={videoNoWm} target="_blank" rel="noopener noreferrer" download className="flex items-center justify-center w-full px-4 py-2 rounded-lg font-bold bg-comic-primary text-white hover:bg-comic-secondary transition-colors duration-200 border-2 border-comic-dark shadow-comic-sm active:shadow-none active:translate-y-px active:translate-x-px">
              <DownloadIcon /> Video SD
            </a>
          )}
          {musicUrl && (
            <a href={musicUrl} target="_blank" rel="noopener noreferrer" download className="flex items-center justify-center w-full px-4 py-2 rounded-lg font-bold bg-comic-user text-comic-dark hover:bg-yellow-400 transition-colors duration-200 border-2 border-comic-dark shadow-comic-sm active:shadow-none active:translate-y-px active:translate-x-px">
              <DownloadIcon /> Musik (MP3)
            </a>
          )}
        </div>
      )}
    </div>
  );
};


const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const downloadTiktokVideo = async (url: string): Promise<TiktokResult> => {
    const API_BASE_URL = 'https://api.sxtream.xyz/downloader/tiktok';
    try {
        const response = await fetch(`${API_BASE_URL}?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `Network response was not ok: ${response.statusText}`);
            } catch (e) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
        }
        const data: TiktokApiResponse = await response.json();
        if (data.status !== 200 || !data.result) {
            throw new Error(data.message || 'API returned an error or invalid data.');
        }
        return data.result;
    } catch (error) {
        console.error('Error fetching TikTok video:', error);
        throw error;
    }
};

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

  const handleAiInteraction = useCallback(async (aiPrompt: string) => {
    const botMessageId = Date.now() + Math.random();
    setMessages(prev => [...prev, { id: botMessageId, sender: Sender.Bot, text: '▌' }]);
    
    try {
      const stream = await getAiResponseStream(aiPrompt);
      let firstChunk = true;
      for await (const chunk of stream) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === botMessageId) {
            let newText = msg.text || '';
            if (firstChunk) {
              newText = ''; 
              firstChunk = false;
            }
            return { ...msg, text: newText + (chunk.text || '') };
          }
          return msg;
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const fullError = `Maaf, terjadi kesalahan saat berkomunikasi dengan AI: ${errorMessage}`;
      setMessages(prev => prev.map(msg => {
        if (msg.id === botMessageId) {
          return { ...msg, text: fullError };
        }
        return msg;
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processCommand = useCallback(async (text: string) => {
    setIsLoading(true);

    const [commandValue, ...args] = text.trim().split(' ');
    const prompt = args.join(' ');

    switch (commandValue.toLowerCase()) {
      case '/ping':
        setTimeout(() => {
          addMessage(Sender.Bot, 'Pong!');
          setIsLoading(false);
        }, 500);
        break;
      case '/ip':
        try {
            const ip = await getIPAddress();
            addMessage(Sender.Bot, `Alamat IP publik Anda adalah: ${ip}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.";
            addMessage(Sender.Bot, `Maaf, terjadi kesalahan saat mengambil alamat IP: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
        break;
      case '/ai':
        await handleAiInteraction(prompt);
        break;
      case '/tiktok':
        const botMessageId = Date.now();
        addMessage(Sender.Bot, "Sedang memproses video TikTok...");
        try {
            const result = await downloadTiktokVideo(prompt);
            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    id: botMessageId,
                    sender: Sender.Bot,
                    component: <TiktokVideo data={result} />
                }
            ]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.";
            setMessages(prev => [
                ...prev.slice(0, -1),
                {
                    id: botMessageId,
                    sender: Sender.Bot,
                    text: `Maaf, terjadi kesalahan saat mengunduh video TikTok: ${errorMessage}`
                }
            ]);
        } finally {
            setIsLoading(false);
        }
        break;
      default:
        if (!commandValue.startsWith('/')) {
          await handleAiInteraction(text);
        } else {
          addMessage(Sender.Bot, `Perintah '${commandValue}' tidak dikenali.`);
          setIsLoading(false);
        }
        break;
    }
  }, [addMessage, handleAiInteraction]);

  const handleSendMessage = useCallback(async (text: string) => {
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
  }, [addMessage, processCommand]);

  const handleSelectCommand = useCallback((command: Command) => {
    setIsMenuOpen(false);
    if (command.requiresParam) {
      setParameterPrompt({ command });
    } else {
      handleSendMessage(command.value);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [handleSendMessage]);
  
  const handleParameterSubmit = useCallback((parameter: string) => {
    if (!parameterPrompt) return;
    
    const { command } = parameterPrompt;
    const fullCommand = `${command.value} ${parameter}`;
    
    setParameterPrompt(null);
    handleSendMessage(fullCommand);
  }, [parameterPrompt, handleSendMessage]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeParameterInput = useCallback(() => setParameterPrompt(null), []);

  return (
    <div className="flex flex-col h-dvh bg-comic-bg font-comic">
      <CommandMenu 
        isOpen={isMenuOpen} 
        onClose={closeMenu} 
        onSelectCommand={handleSelectCommand}
      />

      {parameterPrompt && (
        <CommandParameterInput
            isOpen={!!parameterPrompt}
            command={parameterPrompt.command}
            onClose={closeParameterInput}
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