import React, { useState, Fragment } from 'react';
import { Message, Sender } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

const BotIcon = () => (
  <div className="w-10 h-10 rounded-full bg-comic-primary border-2 border-comic-dark flex items-center justify-center flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 8a1 1 0 11-2 0 1 1 0 012 0zm12 0a1 1 0 11-2 0 1 1 0 012 0zM8 13a4 4 0 004 4h.01a4.01 4.01 0 003.99-4H8z" />
    </svg>
  </div>
);

const UserIcon = () => (
    <div className="w-10 h-10 rounded-full bg-comic-secondary border-2 border-comic-dark flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" />
        </svg>
    </div>
);

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    if (inline) {
        return <code className="bg-comic-dark/10 text-comic-secondary font-bold px-1.5 py-0.5 rounded-md" {...props}>{children}</code>;
    }
    
    return (
        <div className="bg-comic-dark/5 rounded-lg my-2 overflow-hidden border-2 border-dashed border-comic-dark/50">
            {match && (
                <div className="flex justify-between items-center px-4 py-1 bg-comic-dark/10">
                    <span className="text-comic-dark/70 text-sm font-bold">{match[1]}</span>
                     <button onClick={handleCopy} className="text-comic-dark/70 hover:text-comic-dark text-sm font-bold flex items-center gap-1 transition-colors">
                        {isCopied ? 'Disalin!' : 'Salin'}
                    </button>
                </div>
            )}
            <pre className="p-4 text-sm overflow-x-auto text-comic-dark" {...props}>
                <code>{children}</code>
            </pre>
        </div>
    );
};

const LinkifiedText: React.FC<{ text: string }> = React.memo(({ text }) => {
    // Regex to find URLs and split the text by them. The capturing group is important for split.
    const urlRegex = /(\b(?:https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const parts = text.split(urlRegex);

    return (
        <p className="whitespace-pre-wrap">
            {parts.map((part, index) => 
                index % 2 === 1 ? ( // URLs will be at odd indices
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-comic-primary font-bold hover:underline"
                    >
                        {part}
                    </a>
                ) : (
                    <Fragment key={index}>{part}</Fragment>
                )
            )}
        </p>
    );
});


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  const bubbleClasses = isUser
    ? 'bg-comic-user text-comic-dark self-end'
    : 'bg-comic-bot text-comic-dark self-start';
  
  const containerClasses = `flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`;

  const markdownComponents = {
      code: CodeBlock,
      p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
      a: ({ node, ...props }: any) => <a className="text-comic-primary font-bold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
      ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
      ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
      li: ({ node, ...props }: any) => <li className="pl-2" {...props} />,
      blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-comic-dark/50 pl-4 italic my-2" {...props} />,
      h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold my-2" {...props} />,
      h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold my-2" {...props} />,
      h3: ({ node, ...props }: any) => <h3 className="text-lg font-bold my-2" {...props} />,
  };
  
  const isTypingPlaceholder = !isUser && message.text === '▌';

  return (
    <div className={containerClasses}>
      {!isUser && <BotIcon />}
      <div className={`max-w-xl lg:max-w-2xl rounded-2xl p-4 shadow-comic border-2 border-comic-dark break-words ${bubbleClasses}`}>
        {isUser && message.text && <LinkifiedText text={message.text} />}
        {isTypingPlaceholder && (
           <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-comic-dark/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-comic-dark/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-comic-dark/50 rounded-full animate-bounce"></div>
            </div>
        )}
        {!isUser && message.text && !isTypingPlaceholder && (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {message.text}
            </ReactMarkdown>
        )}
        {message.component}
      </div>
      {isUser && <UserIcon />}
    </div>
  );
};

export default React.memo(ChatMessage);