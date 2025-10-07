import React, { useState, useMemo, useEffect, useRef } from 'react';
import { commandCategories } from '../commands';
import { Command } from '../types';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (command: Command) => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, onSelectCommand }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset search query and focus input when the menu is opened
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);


  const handleCommandClick = (command: Command) => {
    onSelectCommand(command);
    setSearchQuery('');
    onClose();
  };
  
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return commandCategories;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return commandCategories
      .map(category => {
        const filteredCommands = category.commands.filter(
          command =>
            command.name.toLowerCase().includes(lowerCaseQuery) ||
            command.description.toLowerCase().includes(lowerCaseQuery)
        );
        return { ...category, commands: filteredCommands };
      })
      .filter(category => category.commands.length > 0);
  }, [searchQuery]);


  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-comic-dark bg-opacity-60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Dialog */}
      <div
        className={`fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 sm:pt-32 transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-menu-title"
      >
        <div 
            className="bg-comic-bg rounded-2xl shadow-comic border-4 border-comic-dark w-full max-w-xl relative"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
        >
            <button
                onClick={onClose}
                className="absolute top-2 right-2 p-2 rounded-full text-comic-dark/70 hover:bg-comic-dark/10 hover:text-comic-dark focus:outline-none focus:ring-2 focus:ring-comic-primary/50 transition-colors z-10"
                aria-label="Tutup menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="p-4 border-b-4 border-comic-dark">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Cari perintah..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white text-comic-dark font-bold rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-4 focus:ring-comic-primary/50 border-2 border-comic-dark"
                        aria-label="Cari perintah"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-comic-dark/70 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="p-2 sm:p-4 overflow-y-auto max-h-[60vh]">
            {filteredCategories.length > 0 ? (
                filteredCategories.map(({ name, commands }) => (
                <div key={name} className="mb-4 last:mb-0">
                    <h3 className="text-sm font-bold text-comic-dark/60 px-2 mb-2">{name}</h3>
                    <ul className="space-y-1">
                    {commands.map((command) => (
                        <li key={command.name}>
                        <button
                            onClick={() => handleCommandClick(command)}
                            className="w-full text-left p-3 rounded-lg hover:bg-comic-user/50 focus:bg-comic-user/50 focus:outline-none transition-colors duration-200"
                        >
                            <p className="text-comic-dark font-bold">
                            <code className="bg-comic-dark text-comic-user font-mono px-2 py-1 rounded-md">{command.name}</code>
                            </p>
                            <p className="text-comic-dark/70 text-sm mt-1">{command.description}</p>
                        </button>
                        </li>
                    ))}
                    </ul>
                </div>
                ))
            ) : (
                <div className="text-center text-comic-dark/70 py-12">
                <p className='font-bold text-lg'>Tidak ada perintah yang ditemukan.</p>
                <p className='text-sm mt-1'>Coba cari dengan kata kunci lain.</p>
                </div>
            )}
            </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(CommandMenu);