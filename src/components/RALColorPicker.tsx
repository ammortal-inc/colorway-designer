import { useState, useRef, useEffect } from 'react';
import { RALColor } from '../data/ralColors';
import { isValidHexColor } from '../utils/colorUtils';
import { searchRAL, findRALForHex } from '../utils/ralUtils';
import RALDropdown from './RALDropdown';

interface RALColorPickerProps {
  value: string;
  onColorChange: (hex: string, ralData?: { number: string; name: string }, autoAdd?: boolean) => void;
  onClose?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

type TabType = 'hex' | 'number' | 'name';

export default function RALColorPicker({
  value,
  onColorChange,
  onClose,
  placeholder = 'Enter color...',
  disabled = false,
  className = ''
}: RALColorPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('hex');
  const [inputValue, setInputValue] = useState(value);
  const [searchResults, setSearchResults] = useState<RALColor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Auto-detect RAL color for current hex value
  useEffect(() => {
    if (activeTab === 'hex' && isValidHexColor(value)) {
      findRALForHex(value).then(ralColor => {
        if (ralColor) {
          // Could show RAL info as hint
        }
      });
    }
  }, [value, activeTab]);

  // Handle input changes
  const handleInputChange = async (newValue: string) => {
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    if (activeTab === 'hex') {
      // Direct hex input
      if (isValidHexColor(newValue)) {
        onColorChange(newValue.toUpperCase());
        setShowDropdown(false);
      } else {
        setShowDropdown(false);
      }
    } else {
      // RAL search
      if (newValue.trim().length >= 2) {
        setIsSearching(true);
        setShowDropdown(true);
        
        try {
          const results = await searchRAL(newValue);
          setSearchResults(results);
        } catch (error) {
          console.error('RAL search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowDropdown(false);
        setSearchResults([]);
      }
    }
  };

  // Handle RAL color selection
  const handleRALSelect = (ralColor: RALColor) => {
    const ralData = {
      number: ralColor.number,
      name: ralColor.name
    };
    
    onColorChange(ralColor.hex, ralData, true); // autoAdd = true for dropdown selections
    setInputValue(getDisplayValue(ralColor));
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Get display value based on active tab
  const getDisplayValue = (ralColor: RALColor): string => {
    switch (activeTab) {
      case 'number':
        return ralColor.number.replace(/\s+/g, '');
      case 'name':
        return ralColor.name;
      default:
        return ralColor.hex;
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleRALSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        if (onClose) onClose();
        break;
    }
  };

  // Get placeholder text for current tab
  const getPlaceholder = (): string => {
    switch (activeTab) {
      case 'hex':
        return '#FF0000';
      case 'number':
        return 'RAL 3020 or 3020';
      case 'name':
        return 'Traffic red';
      default:
        return placeholder;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-600 mb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('hex');
            setShowDropdown(false);
            setInputValue(value);
          }}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'hex'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Hex
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('number');
            setShowDropdown(false);
            setInputValue('');
          }}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'number'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          RAL Number
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('name');
            setShowDropdown(false);
            setInputValue('');
          }}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'name'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          RAL Name
        </button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md
                   bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white
                   placeholder-neutral-500 dark:placeholder-neutral-400
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-neutral-100 dark:disabled:bg-neutral-700
                   disabled:text-neutral-500 dark:disabled:text-neutral-400"
        />
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <RALDropdown
          ref={dropdownRef}
          results={searchResults}
          selectedIndex={selectedIndex}
          onSelect={handleRALSelect}
          onClose={() => setShowDropdown(false)}
          isLoading={isSearching}
          searchTerm={inputValue}
        />
      )}
    </div>
  );
}