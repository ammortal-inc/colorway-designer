import { useState } from 'react';
import { Color } from './types';
import { createColor } from './utils/colorUtils';
import Sidebar from './components/Sidebar';
import VoronoiVisualization from './components/VoronoiVisualization';

const MAX_COLORS = 10;

// Default demo colors to show the functionality
const DEFAULT_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A'  // Orange
];

function App() {
  const [colors, setColors] = useState<Color[]>(() => {
    return DEFAULT_COLORS.map(hex => createColor(hex));
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

  return (
    <div className="flex flex-row h-screen bg-gray-50">
      <Sidebar
        colors={colors}
        onColorAdd={handleColorAdd}
        onColorRemove={handleColorRemove}
        maxColors={MAX_COLORS}
      />
      
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Plastic Sheet Preview
            </h2>
            <p className="text-gray-600 text-sm lg:text-base">
              This visualization shows how your selected colors will appear when mixed as plastic chips in a manufactured sheet.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <VoronoiVisualization
              colors={colors}
              width={800}
              height={500}
              cellCount={150}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;