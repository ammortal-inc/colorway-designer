import React, { useEffect, useRef, useState } from 'react';
import { Color } from '../types';
import { renderVoronoiToCanvas, generateSeededPoints } from '../utils/voronoiUtils';

interface VoronoiVisualizationProps {
  colors: Color[];
  width?: number;
  height?: number;
  scale?: number;
}

const VoronoiVisualization: React.FC<VoronoiVisualizationProps> = ({
  colors,
  width = 600,
  height = 600,
  scale = 1.0,
}) => {
  // Map scale 0.1-4.0 to cell count 100-10000
  const minCells = 100;
  const maxCells = 10000;
  const minScale = 0.1;
  const maxScale = 4.0;
  
  const cellCount = Math.round(minCells + (scale - minScale) * (maxCells - minCells) / (maxScale - minScale));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const [seed, setSeed] = useState(() => Math.random() * 1000000);
  const [cachedPoints, setCachedPoints] = useState<[number, number][]>([]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Reserve space for the button and fixed spacing
      // Fixed spacing: 32px (h-8) + button height (~40px) + minimum bottom flex space (20px)
      const fixedSpacing = 32; // h-8 class
      const buttonHeight = 40;
      const minBottomSpace = 20;
      const totalReservedHeight = fixedSpacing + buttonHeight + minBottomSpace;
      
      const availableHeight = containerHeight - totalReservedHeight;
      
      // Use the smaller of available width or height to ensure it's a perfect square
      const maxSize = Math.min(
        containerWidth - 32, // small padding for borders
        availableHeight
      );
      
      // Make it a perfect square with a reasonable minimum size
      const squareSize = Math.max(150, maxSize);
      
      setCanvasSize({ width: squareSize, height: squareSize });
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [width, height]);

  // Generate points only when cell count or canvas size changes, or when seed changes
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const points = generateSeededPoints(cellCount, canvasSize.width, canvasSize.height, seed);
      setCachedPoints(points);
    }
  }, [cellCount, canvasSize.width, canvasSize.height, seed]);

  // Render canvas using cached points whenever colors or points change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    renderVoronoiToCanvas(canvas, cachedPoints.length > 0 ? cachedPoints : null, colors, cellCount, seed);
  }, [colors, canvasSize, cachedPoints, cellCount, seed]);

  const regeneratePattern = () => {
    // Generate a new seed to create a completely new pattern
    setSeed(Math.random() * 1000000);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center h-full">
      <div className="flex-1"></div>
      
      <div className="relative flex justify-center">
        <canvas
          ref={canvasRef}
          className="border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm"
          style={{ 
            width: `${canvasSize.width}px`, 
            height: `${canvasSize.height}px`,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
        
        {colors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-lg">
            <div className="text-center text-neutral-600 dark:text-neutral-400">
              <p className="text-lg">Add colors to see visualization</p>
              <p className="text-sm">Your plastic sheet preview will appear here</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-8"></div>
      
      {colors.length > 0 && (
        <button
          onClick={regeneratePattern}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800 transition-colors"
        >
          Regenerate Pattern
        </button>
      )}
      
      <div className="flex-1"></div>
    </div>
  );
};

export default VoronoiVisualization;