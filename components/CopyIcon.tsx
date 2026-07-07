'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react'; // or use heroicons / your icon library

interface CopyIconProps {
  text: string;
  className?: string;
  size?: number;
}

export default function CopyIcon({ text, className = "", size = 15 }: CopyIconProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 hover:bg-gray-900 dark:hover: rounded-md transition-colors ${className}`}
      title={isCopied ? "Copied!" : "Copy to clipboard"}
      aria-label="Copy"
    >
      <div className="relative flex items-center justify-center">
        {/* Copy Icon */}
        <Copy
          size={size}
          className={`transition-all duration-300 ${
            isCopied 
              ? 'scale-0 opacity-0' 
              : 'scale-100 opacity-100'
          }`}
        />

        {/* Copied Icon (Checkmark) */}
        <Check
          size={size}
          className={`absolute transition-all duration-300 text-green-500 ${
            isCopied 
              ? 'scale-100 opacity-100' 
              : 'scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );
}