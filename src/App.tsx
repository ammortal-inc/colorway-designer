import { useState, useCallback } from 'react';
import { Color } from './types';
import { createColor } from './utils/colorUtils';
import { useURLState } from './hooks/useURLState';
import Sidebar from './components/Sidebar';
import VoronoiVisualization from './components/VoronoiVisualization';
import ThemeToggle from './components/ThemeToggle';

const MAX_COLORS = 10;

// Default demo colors to show the functionality
interface DefaultColor {
  hex: string;
  density?: number;
}

const DEFAULT_COLORS: DefaultColor[] = [
];

function App() {
  const [colors, setColors] = useState<Color[]>(() => {
    return DEFAULT_COLORS.map(({ hex, density }) => createColor(hex, density));
  });
  
  const [scale, setScale] = useState<number>(1.0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [temporaryColorId, setTemporaryColorId] = useState<string | null>(null);
  const [temporaryColorHex, setTemporaryColorHex] = useState<string | null>(null);
  
  // URL state management
  const handleColorsChange = useCallback((newColors: Color[]) => {
    setColors(newColors);
  }, []);
  
  const handleScaleChangeFromURL = useCallback((newScale: number) => {
    setScale(newScale);
  }, []);
  
  useURLState({
    colors,
    scale,
    onColorsChange: handleColorsChange,
    onScaleChange: handleScaleChangeFromURL,
  });

  const handleColorAdd = (hex: string) => {
    if (colors.length >= MAX_COLORS) {
      return;
    }
    
    try {
      const newColor = createColor(hex);
      setColors(prev => [...prev, newColor]);
    } catch (error) {
      console.error('Error adding color:', error);
    }
  };

  const handleColorRemove = (colorId: string) => {
    setColors(prev => prev.filter(color => color.id !== colorId));
  };

  const handleDensityChange = (colorId: string, density: number) => {
    setColors(prev => 
      prev.map(color => 
        color.id === colorId 
          ? { ...color, density } 
          : color
      )
    );
  };

  const handleColorChange = (colorId: string, hex: string) => {
    setColors(prev => 
      prev.map(color => 
        color.id === colorId 
          ? { ...color, hex } 
          : color
      )
    );
  };

  const handleTemporaryColorChange = (colorId: string, hex: string) => {
    setTemporaryColorId(colorId);
    setTemporaryColorHex(hex);
  };

  const handleTemporaryColorClose = () => {
    setTemporaryColorId(null);
    setTemporaryColorHex(null);
  };

  const handleTemporaryColorSave = (colorId: string, hex: string) => {
    handleColorChange(colorId, hex);
    handleTemporaryColorClose();
  };

  const handleReset = () => {
    setColors([]);
    // Also clear any temporary color state
    handleTemporaryColorClose();
  };

  // Create colors with temporary override for visualization
  const visualizationColors = colors.map(color => 
    color.id === temporaryColorId && temporaryColorHex
      ? { ...color, hex: temporaryColorHex }
      : color
  );
  
  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
    setIsGenerating(true);
    // Clear the generating state after a short delay
    setTimeout(() => setIsGenerating(false), 200);
  }, []);

  return (
    <div className="flex flex-row h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Theme toggle in upper right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <Sidebar
        colors={colors}
        onColorAdd={handleColorAdd}
        onColorRemove={handleColorRemove}
        onDensityChange={handleDensityChange}
        onColorChange={handleColorChange}
        onTemporaryColorChange={handleTemporaryColorChange}
        onTemporaryColorClose={handleTemporaryColorClose}
        onTemporaryColorSave={handleTemporaryColorSave}
        onReset={handleReset}
        temporaryColorId={temporaryColorId}
        temporaryColorHex={temporaryColorHex}
        maxColors={MAX_COLORS}
        scale={scale}
        onScaleChange={handleScaleChange}
        isGenerating={isGenerating}
      />
      
      <main className="flex-1 p-4 lg:p-8 overflow-auto flex flex-col">
        <div className="max-w-4xl mx-auto flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Plastic Sheet Preview
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm lg:text-base">
              This visualization shows how your selected colors will appear when mixed as plastic chips in a manufactured sheet.
            </p>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 lg:p-6 flex-1">
            <VoronoiVisualization
              colors={visualizationColors}
              width={600}
              height={600}
              scale={scale}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;