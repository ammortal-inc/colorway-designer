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
          <label htmlFor="hex-input" className="block text-sm font-medium text-gray-700 mb-1">
            Add Color (Hex)
          </label>
          <input
            id="hex-input"
            type="text"
            value={hexInput}
            onChange={handleInputChange}
            placeholder="#FF0000"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Add Color
        </button>
      </form>
    </div>
  );
};

export default ColorPicker;