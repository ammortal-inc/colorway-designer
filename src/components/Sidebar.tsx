import React from 'react';
import { Color } from '../types';
import ColorPicker from './ColorPicker';
import ColorPalette from './ColorPalette';

interface SidebarProps {
  colors: Color[];
  onColorAdd: (hex: string) => void;
  onColorRemove: (colorId: string) => void;
  maxColors: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  colors,
  onColorAdd,
  onColorRemove,
  maxColors,
}) => {
  const isMaxColorsReached = colors.length >= maxColors;

  return (
    <div className="w-80 lg:w-80 md:w-72 sm:w-full bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Colorway Designer
        </h1>
        <p className="text-gray-600 text-sm">
          Design custom colorways for plastic sheets using recycled chip colors
        </p>
      </div>

      <div className="mb-6">
        <ColorPicker
          onColorAdd={onColorAdd}
          disabled={isMaxColorsReached}
        />
        
        {isMaxColorsReached && (
          <p className="text-orange-600 text-sm mt-2">
            Maximum of {maxColors} colors reached. Remove a color to add more.
          </p>
        )}
      </div>

      <ColorPalette
        colors={colors}
        onColorRemove={onColorRemove}
      />

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>About:</strong> This tool helps you visualize how different colored plastic chips will look when mixed together in a manufacturing process.</p>
          <p><strong>Visualization:</strong> The Voronoi diagram shows an equal distribution of your selected colors, simulating the random mixing of plastic chips.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;