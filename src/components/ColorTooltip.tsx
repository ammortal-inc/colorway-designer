import React from 'react';
import { Color } from '../types';
import { calculateColorProbability, calculateTotalDensity } from '../utils/colorUtils';

interface ColorTooltipProps {
  color: Color;
  allColors: Color[];
  position: { x: number; y: number };
  canvasRect: DOMRect;
}

const ColorTooltip: React.FC<ColorTooltipProps> = ({ 
  color, 
  allColors, 
  position, 
  canvasRect 
}) => {
  const totalDensity = calculateTotalDensity(allColors);
  const probability = calculateColorProbability(color, totalDensity, allColors.length);

  // Position tooltip relative to canvas
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: canvasRect.left + position.x + 10,
    top: canvasRect.top + position.y - 10,
    transform: 'translateY(-100%)',
    zIndex: 1000,
    pointerEvents: 'none',
  };

  return (
    <div
      style={tooltipStyle}
      className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-3 py-2 rounded-lg shadow-lg text-sm border border-neutral-700 dark:border-neutral-300"
    >
      <div className="flex items-center space-x-2">
        <div
          className="w-4 h-4 rounded border border-neutral-600 dark:border-neutral-400"
          style={{ backgroundColor: color.hex }}
        />
        <div>
          <div className="font-mono font-medium">{color.hex}</div>
          <div className="text-xs opacity-75">
            Density: {color.density} • {(probability * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTooltip;