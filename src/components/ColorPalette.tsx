import React, { useState } from 'react';
import { Color } from '../types';
import { calculateTotalDensity, calculateColorProbability, normalizeDensity, getContrastTextColor } from '../utils/colorUtils';

interface ColorPaletteProps {
  colors: Color[];
  onColorRemove: (colorId: string) => void;
  onDensityChange: (colorId: string, density: number) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onColorRemove, onDensityChange }) => {
  const [editingDensity, setEditingDensity] = useState<string | null>(null);
  const [tempDensityValues, setTempDensityValues] = useState<Record<string, string>>({});
  
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

  if (colors.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        <p>No colors in palette</p>
        <p className="text-sm">Add some colors to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-neutral-100 mb-3">
        Color Palette ({colors.length}/10)
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        {colors.map((color) => {
          const probability = calculateColorProbability(color, totalDensity, colors.length);
          const isEditing = editingDensity === color.id;
          const textColor = getContrastTextColor(color.hex);
          
          return (
            <div
              key={color.id}
              className="p-3 border border-neutral-600 rounded-lg hover:border-neutral-500 transition-colors"
              style={{ backgroundColor: color.hex }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-medium" style={{ color: textColor }}>
                    {color.hex}
                  </span>
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
                          className="w-16 px-1 py-0.5 text-xs border border-neutral-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/90 backdrop-blur-sm"
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
    </div>
  );
};

export default ColorPalette;