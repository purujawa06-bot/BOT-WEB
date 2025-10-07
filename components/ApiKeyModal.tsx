import React, { useState, useEffect, useRef } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setApiKey(''); // Reset on open
    }
  }, [isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-dialog-title"
    >
      <div 
        className="bg-comic-bg rounded-2xl shadow-comic border-4 border-comic-dark w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <div className="p-6">
            <h2 id="api-key-dialog-title" className="text-xl font-bold text-comic-dark mb-2">
              Masukkan Gemini API Key
            </h2>
            <p className="text-comic-dark/80 text-sm mb-4">
              API Key Anda dibutuhkan untuk menggunakan fitur AI. Kunci ini hanya akan disimpan di browser Anda untuk sesi ini.
            </p>
            <input
              ref={inputRef}
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Masukkan API Key Anda..."
              className="w-full bg-white text-comic-dark rounded-md py-2 px-4 focus:outline-none focus:ring-4 focus:ring-comic-primary/50 transition duration-300 border-2 border-comic-dark"
              aria-label="Input Gemini API Key"
            />
          </div>
          <div className="bg-comic-dark/5 px-6 py-4 flex justify-end items-center gap-3 rounded-b-2xl border-t-4 border-comic-dark">
            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="px-4 py-2 rounded-lg font-bold bg-comic-primary text-white hover:bg-comic-secondary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 border-2 border-comic-dark shadow-comic-sm active:shadow-none active:translate-y-px active:translate-x-px"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ApiKeyModal);