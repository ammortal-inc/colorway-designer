import React, { useState } from 'react';
import { isValidHexColor } from '../utils/colorUtils';
import RALColorPicker from './RALColorPicker';

interface ColorPickerProps {
  onColorAdd: (hex: string, ralData?: { number: string; name: string }) => void;
  disabled?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorAdd, disabled = false }) => {
  const [currentHex, setCurrentHex] = useState('#FF0000');
  const [currentRalData, setCurrentRalData] = useState<{ number: string; name: string } | undefined>();
  const [error, setError] = useState('');

  const handleColorChange = (hex: string, ralData?: { number: string; name: string }, autoAdd?: boolean) => {
    setCurrentHex(hex);
    setCurrentRalData(ralData);
    setError('');
    
    // Auto-add color if it came from RAL dropdown selection
    if (autoAdd && isValidHexColor(hex)) {
      onColorAdd(hex, ralData);
      // Reset to default state after auto-adding
      setCurrentHex('#FF0000');
      setCurrentRalData(undefined);
    }
  };

  const handleAddColor = () => {
    if (!isValidHexColor(currentHex)) {
      setError('Please select a valid color');
      return;
    }
    
    onColorAdd(currentHex, currentRalData);
    setError('');
    
    // Reset to a default state after adding
    setCurrentHex('#FF0000');
    setCurrentRalData(undefined);
  };

  return (
    <div className="mb-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">
            Add Color
          </label>
          
          <RALColorPicker
            value={currentHex}
            onColorChange={handleColorChange}
            disabled={disabled}
            className="mb-3"
          />
        </div>
        
        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
        )}
        
        <button
          onClick={handleAddColor}
          disabled={disabled || !isValidHexColor(currentHex)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800 disabled:bg-neutral-400 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
        >
          Add Color
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;