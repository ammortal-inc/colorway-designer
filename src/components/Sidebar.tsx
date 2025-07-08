import React from 'react';
import { Color } from '../types';
import ColorPicker from './ColorPicker';
import ColorPalette from './ColorPalette';
import ScaleControl from './ScaleControl';
import LightingSelector from './LightingSelector';
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
  onReset: () => void;
  temporaryColorId?: string | null;
  temporaryColorHex?: string | null;
  maxColors: number;
  scale: number;
  onScaleChange: (scale: number) => void;
  selectedLightId: string;
  onLightChange: (lightId: string) => void;
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
  onReset,
  temporaryColorId,
  temporaryColorHex,
  maxColors,
  scale,
  onScaleChange,
  selectedLightId,
  onLightChange,
  isGenerating,
}) => {
  const isMaxColorsReached = colors.length >= maxColors;

  return (
    <div className="w-1/4 bg-white dark:bg-neutral-800 border-r border-neutral-300 dark:border-neutral-600 p-6 overflow-y-auto flex-shrink-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Colorway Designer
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm">
          Design custom colorways for plastic sheets using recycled chip colors
        </p>
      </div>

      <div className="mb-6">
        <ColorPicker
          onColorAdd={onColorAdd}
          disabled={isMaxColorsReached}
        />
        
        {isMaxColorsReached && (
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
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

      {colors.length > 0 && (
        <div className="mt-4">
          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-600 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800 transition-colors"
          >
            Reset Palette
          </button>
        </div>
      )}

      <div className="mt-6">
        <ScaleControl
          scale={scale}
          onScaleChange={onScaleChange}
          disabled={colors.length === 0}
          isGenerating={isGenerating}
        />
      </div>
      
      <div className="mt-6">
        <LightingSelector
          selectedLightId={selectedLightId}
          onLightChange={onLightChange}
        />
      </div>
      
      <div className="mt-6">
        <ShareButton
          colors={colors}
          scale={scale}
          lightingId={selectedLightId}
          disabled={isGenerating}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-300 dark:border-neutral-600">
        <div className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
          <p><strong>About:</strong> This tool helps you visualize how different colored plastic chips will look when mixed together in a manufacturing process.</p>
          <p><strong>Density:</strong> Each color has a density value that controls its probability of being selected. Higher density = more frequent appearance in the visualization.</p>
          <p><strong>Visualization:</strong> The Voronoi diagram shows a weighted distribution of your selected colors based on their density values, simulating the random mixing of plastic chips.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;