import React from 'react';
import { Color } from '../types';
import ColorPicker from './ColorPicker';
import ColorPalette from './ColorPalette';
import ScaleControl from './ScaleControl';
import ShareButton from './ShareButton';

interface SidebarProps {
  colors: Color[];
  onColorAdd: (hex: string) => void;
  onColorRemove: (colorId: string) => void;
  onDensityChange: (colorId: string, density: number) => void;
  onColorChange?: (colorId: string, hex: string) => void;
  onTemporaryColorChange?: (colorId: string, hex: string) => void;
  onTemporaryColorClose?: () => void;
  onTemporaryColorSave?: (colorId: string, hex: string) => void;
  temporaryColorId?: string | null;
  temporaryColorHex?: string | null;
  maxColors: number;
  scale: number;
  onScaleChange: (scale: number) => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  colors,
  onColorAdd,
  onColorRemove,
  onDensityChange,
  onColorChange,
  onTemporaryColorChange,
  onTemporaryColorClose,
  onTemporaryColorSave,
  temporaryColorId,
  temporaryColorHex,
  maxColors,
  scale,
  onScaleChange,
  isGenerating,
}) => {
  const isMaxColorsReached = colors.length >= maxColors;

  return (
    <div className="w-1/4 bg-neutral-800 border-r border-neutral-600 p-6 overflow-y-auto flex-shrink-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-100 mb-2">
          Colorway Designer
        </h1>
        <p className="text-neutral-300 text-sm">
          Design custom colorways for plastic sheets using recycled chip colors
        </p>
      </div>

      <div className="mb-6">
        <ColorPicker
          onColorAdd={onColorAdd}
          disabled={isMaxColorsReached}
        />
        
        {isMaxColorsReached && (
          <p className="text-yellow-400 text-sm mt-2">
            Maximum of {maxColors} colors reached. Remove a color to add more.
          </p>
        )}
      </div>

      <ColorPalette
        colors={colors}
        onColorRemove={onColorRemove}
        onDensityChange={onDensityChange}
        onColorChange={onColorChange}
        onTemporaryColorChange={onTemporaryColorChange}
        onTemporaryColorClose={onTemporaryColorClose}
        onTemporaryColorSave={onTemporaryColorSave}
        temporaryColorId={temporaryColorId}
        temporaryColorHex={temporaryColorHex}
      />

      <div className="mt-6">
        <ScaleControl
          scale={scale}
          onScaleChange={onScaleChange}
          disabled={colors.length === 0}
          isGenerating={isGenerating}
        />
      </div>
      
      <div className="mt-6">
        <ShareButton
          colors={colors}
          scale={scale}
          disabled={isGenerating}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-600">
        <div className="text-sm text-neutral-300 space-y-1">
          <p><strong>About:</strong> This tool helps you visualize how different colored plastic chips will look when mixed together in a manufacturing process.</p>
          <p><strong>Density:</strong> Each color has a density value that controls its probability of being selected. Higher density = more frequent appearance in the visualization.</p>
          <p><strong>Visualization:</strong> The Voronoi diagram shows a weighted distribution of your selected colors based on their density values, simulating the random mixing of plastic chips.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;