import React, { useEffect, useRef, useState } from 'react';
import { Color } from '../types';
import { renderVoronoiToCanvas } from '../utils/voronoiUtils';

interface VoronoiVisualizationProps {
  colors: Color[];
  width?: number;
  height?: number;
  cellCount?: number;
}

const VoronoiVisualization: React.FC<VoronoiVisualizationProps> = ({
  colors,
  width = 600,
  height = 600,
  cellCount = 150,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      
      // Reserve space for the button and spacing (approximately 80px)
      const availableHeight = containerHeight - 80;
      
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    renderVoronoiToCanvas(canvas, [], colors, cellCount);
  }, [colors, canvasSize, cellCount]);

  const regeneratePattern = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    renderVoronoiToCanvas(canvas, [], colors, cellCount);
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center space-y-4 h-full">
      <div className="relative flex justify-center flex-1">
        <canvas
          ref={canvasRef}
          className="border border-neutral-600 rounded-lg shadow-sm"
          style={{ 
            width: `${canvasSize.width}px`, 
            height: `${canvasSize.height}px`,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
        
        {colors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-700 rounded-lg">
            <div className="text-center text-neutral-400">
              <p className="text-lg">Add colors to see visualization</p>
              <p className="text-sm">Your plastic sheet preview will appear here</p>
            </div>
          </div>
        )}
      </div>
      
      {colors.length > 0 && (
        <button
          onClick={regeneratePattern}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-colors"
        >
          Regenerate Pattern
        </button>
      )}
    </div>
  );
};

export default VoronoiVisualization;