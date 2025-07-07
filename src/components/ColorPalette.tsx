import React from 'react';
import { Color } from '../types';

interface ColorPaletteProps {
  colors: Color[];
  onColorRemove: (colorId: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onColorRemove }) => {
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
      
      <div className="grid grid-cols-1 gap-2">
        {colors.map((color) => (
          <div
            key={color.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
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
              className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md p-1 transition-colors"
              aria-label={`Remove color ${color.hex}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;