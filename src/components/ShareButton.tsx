import React, { useState } from 'react';
import { Color } from '../types';
import { generateShareableURL } from '../utils/urlUtils';

interface ShareButtonProps {
  colors: Color[];
  scale: number;
  disabled?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ colors, scale, disabled = false }) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (disabled || isSharing) return;
    
    setIsSharing(true);
    
    try {
      // Wait a brief moment to ensure URL is updated
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const shareableUrl = generateShareableURL(colors, scale);
      
      // Try to use the modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareableUrl);
        setCopied(true);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareableUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
      }
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // You could add a toast notification here for error handling
    } finally {
      setIsSharing(false);
    }
  };

  const hasContent = colors.length > 0;

  return (
    <div className="mb-6">
      <div className="mb-3">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Share Configuration
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Copy a link to share this color palette and scale setting
        </p>
      </div>
      
      <button
        onClick={handleShare}
        disabled={disabled || isSharing || !hasContent}
        className={`
          w-full px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800
          ${copied 
            ? 'bg-green-600 text-white focus:ring-green-400' 
            : hasContent && !disabled && !isSharing
              ? 'bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-400'
              : 'bg-neutral-400 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 cursor-not-allowed'
          }
        `}
      >
        {isSharing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Copying...
          </span>
        ) : copied ? (
          <span className="flex items-center justify-center">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Copied!
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy Share Link
          </span>
        )}
      </button>
      
      {!hasContent && (
        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
          Add colors to enable sharing
        </p>
      )}
    </div>
  );
};

export default ShareButton;