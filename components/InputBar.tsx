import React, { forwardRef } from 'react';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);


const InputBar = forwardRef<HTMLInputElement, InputBarProps>(({ onSendMessage, isLoading, value, onChange }, ref) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSendMessage(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-comic-bg border-t-4 border-comic-dark">
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isLoading ? "AI sedang berpikir..." : "Ketikkan perintah atau pesan..."}
          disabled={isLoading}
          className="w-full bg-white text-comic-dark font-bold rounded-full py-3 pl-5 pr-20 focus:outline-none focus:ring-4 focus:ring-comic-primary/50 transition duration-300 border-2 border-comic-dark"
          aria-label="Input pesan"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-comic-primary text-white rounded-full p-3 hover:bg-comic-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 border-2 border-comic-dark active:shadow-none active:translate-y-px active:translate-x-px shadow-comic-sm"
          aria-label="Kirim pesan"
        >
          <SendIcon/>
        </button>
      </div>
    </form>
  );
});

export default React.memo(InputBar);