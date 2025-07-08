import React, { useState } from 'react';
import { isValidHexColor } from '../utils/colorUtils';

interface ColorPickerProps {
  onColorAdd: (hex: string) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorAdd, disabled = false }) => {
  const [hexInput, setHexInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hexInput.trim()) {
      setError('Please enter a hex color');
      return;
    }
    
    const formattedHex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    
    if (!isValidHexColor(formattedHex)) {
      setError('Please enter a valid hex color (e.g., #FF0000 or #F00)');
      return;
    }
    
    onColorAdd(formattedHex);
    setHexInput('');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    
    if (error) {
      setError('');
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="hex-input" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">
            Add Color (Hex)
          </label>
          <input
            id="hex-input"
            type="text"
            value={hexInput}
            onChange={handleInputChange}
            placeholder="#FF0000"
            disabled={disabled}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed bg-white dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
          />
        </div>
        
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
        >
          Add Color
        </button>
      </form>
    </div>
  );
};

export default ColorPicker;