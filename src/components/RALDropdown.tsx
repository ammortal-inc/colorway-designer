import { forwardRef, useEffect } from 'react';
import { RALColor } from '../data/ralColors';
import { formatRALColorDisplay, getColorPreviewStyle } from '../utils/ralUtils';

interface RALDropdownProps {
  results: RALColor[];
  selectedIndex: number;
  onSelect: (ralColor: RALColor) => void;
  onClose: () => void;
  isLoading?: boolean;
  searchTerm?: string;
  maxHeight?: number;
}

const RALDropdown = forwardRef<HTMLDivElement, RALDropdownProps>(({
  results,
  selectedIndex,
  onSelect,
  onClose,
  isLoading = false,
  searchTerm = '',
  maxHeight = 200
}, ref) => {
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, ref]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && ref && 'current' in ref && ref.current) {
      const selectedElement = ref.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, ref]);

  if (isLoading) {
    return (
      <div
        ref={ref}
        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 
                   border border-neutral-200 dark:border-neutral-600 rounded-md shadow-lg z-50"
        style={{ maxHeight }}
      >
        <div className="p-3 text-center text-neutral-500 dark:text-neutral-400">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Searching RAL colors...
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div
        ref={ref}
        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 
                   border border-neutral-200 dark:border-neutral-600 rounded-md shadow-lg z-50"
        style={{ maxHeight }}
      >
        <div className="p-3 text-center text-neutral-500 dark:text-neutral-400">
          {searchTerm.trim() ? 'No RAL colors found' : 'Start typing to search...'}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 
                 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-lg z-50 overflow-auto"
      style={{ maxHeight }}
    >
      {results.map((ralColor, index) => (
        <button
          key={ralColor.number}
          type="button"
          onClick={() => onSelect(ralColor)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 
                     transition-colors ${
                       index === selectedIndex 
                         ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                         : 'text-neutral-900 dark:text-white'
                     } ${index === 0 ? 'rounded-t-md' : ''} ${index === results.length - 1 ? 'rounded-b-md' : ''}`}
        >
          {/* Color preview */}
          <div 
            style={getColorPreviewStyle(ralColor.hex)} 
            className="flex-shrink-0 border border-neutral-300 dark:border-neutral-600"
          />
          
          {/* Color info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {formatRALColorDisplay(ralColor)}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {ralColor.hex}
            </div>
          </div>
        </button>
      ))}
      
      {/* Show count if many results */}
      {results.length >= 10 && (
        <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-600">
          Showing first 10 results
        </div>
      )}
    </div>
  );
});

RALDropdown.displayName = 'RALDropdown';

export default RALDropdown;