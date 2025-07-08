import React, { useState, useRef } from 'react';
import { Color } from '../types';
import { calculateTotalDensity, calculateColorProbability, normalizeDensity, getContrastTextColor } from '../utils/colorUtils';
import CompactColorPicker from './CompactColorPicker';

interface ColorPaletteProps {
  colors: Color[];
  onColorRemove: (colorId: string) => void;
  onDensityChange: (colorId: string, density: number) => void;
  onColorChange?: (colorId: string, hex: string) => void;
  onTemporaryColorChange?: (colorId: string, hex: string) => void;
  onTemporaryColorClose?: () => void;
  onTemporaryColorSave?: (colorId: string, hex: string) => void;
  temporaryColorId?: string | null;
  temporaryColorHex?: string | null;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ 
  colors, 
  onColorRemove, 
  onDensityChange, 
  onColorChange,
  onTemporaryColorChange,
  onTemporaryColorClose,
  temporaryColorId,
  temporaryColorHex
}) => {
  const [editingDensity, setEditingDensity] = useState<string | null>(null);
  const [tempDensityValues, setTempDensityValues] = useState<Record<string, string>>({});
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const colorButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  const totalDensity = calculateTotalDensity(colors);

  const handleDensityEdit = (colorId: string, currentDensity: number) => {
    setEditingDensity(colorId);
    setTempDensityValues(prev => ({
      ...prev,
      [colorId]: currentDensity.toString()
    }));
  };

  const handleDensityChange = (colorId: string, value: string) => {
    setTempDensityValues(prev => ({
      ...prev,
      [colorId]: value
    }));
  };

  const handleDensitySubmit = (colorId: string) => {
    const value = tempDensityValues[colorId] || '1';
    const density = normalizeDensity(value);
    onDensityChange(colorId, density);
    setEditingDensity(null);
    setTempDensityValues(prev => {
      const newValues = { ...prev };
      delete newValues[colorId];
      return newValues;
    });
  };

  const handleDensityCancel = (colorId: string) => {
    setEditingDensity(null);
    setTempDensityValues(prev => {
      const newValues = { ...prev };
      delete newValues[colorId];
      return newValues;
    });
  };

  const handleColorEdit = (colorId: string) => {
    const buttonElement = colorButtonRefs.current[colorId];
    if (buttonElement && onTemporaryColorChange) {
      setEditingColorId(colorId);
      setAnchorElement(buttonElement);
    }
  };

  const handleTemporaryColorChange = (newHex: string) => {
    if (editingColorId && onTemporaryColorChange) {
      onTemporaryColorChange(editingColorId, newHex);
    }
  };

  const handleColorPickerClose = () => {
    // Save the temporary color if there is one
    if (editingColorId && temporaryColorHex && onColorChange) {
      onColorChange(editingColorId, temporaryColorHex);
    }
    
    if (onTemporaryColorClose) {
      onTemporaryColorClose();
    }
    setEditingColorId(null);
    setAnchorElement(null);
  };

  if (colors.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        <p>No colors in palette</p>
        <p className="text-sm">Add some colors to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
        Color Palette ({colors.length}/10)
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        {colors.map((color) => {
          const probability = calculateColorProbability(color, totalDensity, colors.length);
          const isEditing = editingDensity === color.id;
          
          // Use temporary color if this color is being edited
          const displayColor = color.id === temporaryColorId && temporaryColorHex 
            ? temporaryColorHex 
            : color.hex;
          const textColor = getContrastTextColor(displayColor);
          
          return (
            <div
              key={color.id}
              className="p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              style={{ backgroundColor: displayColor }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <button
                    ref={(el) => {
                      colorButtonRefs.current[color.id] = el;
                    }}
                    onClick={() => handleColorEdit(color.id)}
                    className="font-mono text-sm font-medium hover:opacity-80 underline transition-opacity flex items-center"
                    style={{ color: textColor }}
                    disabled={!onTemporaryColorChange}
                    title="Click to open color picker"
                  >
                    {displayColor}
                    <svg 
                      className="w-4 h-4 ml-2" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.91-1.93 3.12-3.12c.39-.39.39-1.02 0-1.41zM6.92 19H5v-1.92l8.06-8.06 1.92 1.92L6.92 19z"/>
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={() => onColorRemove(color.id)}
                  className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 rounded-md p-1 transition-all w-6 h-6 flex items-center justify-center text-sm font-bold"
                  style={{ 
                    color: textColor
                  }}
                  aria-label={`Remove color ${color.hex}`}
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs" style={{ color: textColor }}>
                  <div className="flex items-center space-x-2">
                    <span>Density:</span>
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={tempDensityValues[color.id] || color.density.toString()}
                          onChange={(e) => handleDensityChange(color.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleDensitySubmit(color.id);
                            if (e.key === 'Escape') handleDensityCancel(color.id);
                          }}
                          className="w-16 px-1 py-0.5 text-xs border border-neutral-400 dark:border-neutral-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                          style={{ color: '#374151' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleDensitySubmit(color.id)}
                          className="hover:opacity-80 text-xs transition-opacity"
                          style={{ color: textColor }}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleDensityCancel(color.id)}
                          className="hover:opacity-80 text-xs transition-opacity"
                          style={{ color: textColor }}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDensityEdit(color.id, color.density)}
                        className="hover:opacity-80 underline transition-opacity"
                        style={{ color: textColor }}
                      >
                        {color.density}
                      </button>
                    )}
                  </div>
                  
                  <span className="text-xs font-medium" style={{ color: textColor }}>
                    {(probability * 100).toFixed(1)}%
                  </span>
                </div>
                
                {/* Visual density bar */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-black/20 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(probability * 100, 100)}%`,
                        backgroundColor: textColor,
                        opacity: 0.6
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Color Picker */}
      {editingColorId && (
        <CompactColorPicker
          color={colors.find(c => c.id === editingColorId)!}
          isOpen={!!editingColorId}
          anchorElement={anchorElement}
          onColorChange={handleTemporaryColorChange}
          onClose={handleColorPickerClose}
        />
      )}
    </div>
  );
};

export default ColorPalette;