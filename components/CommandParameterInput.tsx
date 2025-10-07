import React, { useState, useEffect, useRef } from 'react';
import { Command } from '../types';

interface CommandParameterInputProps {
  isOpen: boolean;
  command: Command;
  onClose: () => void;
  onSubmit: (parameter: string) => void;
}

const CommandParameterInput: React.FC<CommandParameterInputProps> = ({ isOpen, command, onClose, onSubmit }) => {
  const [parameter, setParameter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setParameter(''); // Reset on open
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parameter.trim()) {
      onSubmit(parameter.trim());
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="parameter-dialog-title"
    >
      <div 
        className="bg-comic-bg rounded-2xl shadow-comic border-4 border-comic-dark w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 id="parameter-dialog-title" className="text-lg font-bold text-comic-dark mb-2">
              Parameter untuk <code className="bg-comic-dark/10 text-comic-primary font-bold px-2 py-1 rounded-md">{command.value}</code>
            </h2>
            <p className="text-comic-dark/80 text-sm mb-4">{command.description}</p>
            <input
              ref={inputRef}
              type="text"
              value={parameter}
              onChange={(e) => setParameter(e.target.value)}
              placeholder="Masukkan parameter..."
              className="w-full bg-white text-comic-dark rounded-md py-2 px-4 focus:outline-none focus:ring-4 focus:ring-comic-primary/50 transition duration-300 border-2 border-comic-dark"
              aria-label="Input parameter"
            />
          </div>
          <div className="bg-comic-dark/5 px-6 py-4 flex justify-end items-center gap-3 rounded-b-2xl border-t-4 border-comic-dark">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-bold text-comic-dark bg-white hover:bg-gray-200 transition-colors duration-200 border-2 border-comic-dark shadow-comic-sm active:shadow-none active:translate-y-px active:translate-x-px"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!parameter.trim()}
              className="px-4 py-2 rounded-lg font-bold bg-comic-primary text-white hover:bg-comic-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 border-2 border-comic-dark shadow-comic-sm active:shadow-none active:translate-y-px active:translate-x-px"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommandParameterInput;