import React, { useState } from 'react';
import { Color } from '../types';
import { calculateTotalDensity, calculateColorProbability, normalizeDensity } from '../utils/colorUtils';

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
      <div className="text-center py-8 text-gray-500">
        <p>No colors in palette</p>
        <p className="text-sm">Add some colors to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900 mb-3">
        Color Palette ({colors.length}/10)
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        {colors.map((color) => {
          const probability = calculateColorProbability(color, totalDensity, colors.length);
          const isEditing = editingDensity === color.id;
          
          return (
            <div
              key={color.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-md border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                    title={color.hex}
                  />
                  <span className="font-mono text-sm text-gray-700">
                    {color.hex}
                  </span>
                </div>
                
                <button
                  onClick={() => onColorRemove(color.id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md p-1 transition-colors w-6 h-6 flex items-center justify-center text-sm font-bold"
                  aria-label={`Remove color ${color.hex}`}
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
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
                          className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleDensitySubmit(color.id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleDensityCancel(color.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDensityEdit(color.id, color.density)}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {color.density}
                      </button>
                    )}
                  </div>
                  
                  <span className="text-xs font-medium">
                    {(probability * 100).toFixed(1)}%
                  </span>
                </div>
                
                {/* Visual density bar */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(probability * 100, 100)}%`,
                        backgroundColor: color.hex,
                        opacity: 0.8
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