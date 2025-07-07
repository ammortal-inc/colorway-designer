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
  width = 800,
  height = 500,
  cellCount = 150,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width, height });

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const aspectRatio = height / width;
      const newWidth = Math.min(containerWidth - 32, width); // 32px for padding
      const newHeight = newWidth * aspectRatio;
      
      setCanvasSize({ width: newWidth, height: newHeight });
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
    <div ref={containerRef} className="flex flex-col items-center space-y-4">
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg shadow-sm w-full max-w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {colors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <p className="text-lg">Add colors to see visualization</p>
              <p className="text-sm">Your plastic sheet preview will appear here</p>
            </div>
          </div>
        )}
      </div>
      
      {colors.length > 0 && (
        <button
          onClick={regeneratePattern}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Regenerate Pattern
        </button>
      )}
    </div>
  );
};

export default VoronoiVisualization;