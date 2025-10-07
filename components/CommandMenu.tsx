import React, { useState, useMemo } from 'react';
import { commandCategories } from '../commands';
import { Command } from '../types';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (command: Command) => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, onSelectCommand }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
      <div
        className={`fixed inset-0 bg-comic-dark bg-opacity-50 z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div
        className={`fixed top-0 left-0 h-dvh w-full sm:w-80 bg-comic-bg shadow-lg z-30 transform transition-transform duration-300 ease-in-out border-r-4 border-comic-dark ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-menu-title"
      >
        <div className="flex justify-between items-center p-4 border-b-4 border-comic-dark">
          <h2 id="command-menu-title" className="text-2xl font-bold text-comic-dark">Daftar Perintah</h2>
          <button onClick={onClose} className="text-comic-dark hover:text-comic-primary" aria-label="Tutup menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 border-b-4 border-comic-dark">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari perintah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white text-comic-dark font-bold rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-4 focus:ring-comic-primary/50 border-2 border-comic-dark"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-comic-dark/70">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-168px)]">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(({ name, commands }) => (
              <div key={name} className="mb-6">
                <h3 className="text-xl font-bold text-comic-primary mb-3">{name}</h3>
                <ul className="space-y-2">
                  {commands.map((command) => (
                    <li key={command.name}>
                      <button
                        onClick={() => handleCommandClick(command)}
                        className="w-full text-left p-3 rounded-lg hover:bg-comic-user/50 transition-colors duration-200 border-2 border-transparent hover:border-comic-dark"
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
            <div className="text-center text-comic-dark/70 mt-8">
              <p>Tidak ada perintah yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommandMenu;