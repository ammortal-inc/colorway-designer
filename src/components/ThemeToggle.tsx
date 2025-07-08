import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg
          className="w-5 h-5 text-neutral-700"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          className="w-5 h-5 text-neutral-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,2A1,1,0,0,0,11,3V4a1,1,0,0,0,2,0V3A1,1,0,0,0,12,2ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM4,11H3a1,1,0,0,0,0,2H4a1,1,0,0,0,0-2ZM6.22,5A1,1,0,0,0,4.81,6.45l.71.71A1,1,0,0,0,6.93,6.45L6.22,5.74A1,1,0,0,0,6.22,5ZM17.78,5a1,1,0,0,0-.71.29l-.71.71a1,1,0,1,0,1.41,1.41l.71-.71A1,1,0,0,0,17.78,5ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5ZM17.78,19a1,1,0,0,0-.71-.29,1,1,0,0,0-.71.29l-.71.71a1,1,0,0,0,1.41,1.41l.71-.71A1,1,0,0,0,17.78,19ZM6.22,19a1,1,0,0,0-.71.29l-.71.71a1,1,0,0,0,1.41,1.41l.71-.71A1,1,0,0,0,6.22,19Z"/>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;