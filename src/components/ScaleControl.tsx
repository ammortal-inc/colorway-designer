import React from 'react';

interface ScaleControlProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

const ScaleControl: React.FC<ScaleControlProps> = ({ scale, onScaleChange, disabled = false, isGenerating = false }) => {
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    onScaleChange(newScale);
  };

  const getCellCount = (scale: number) => {
    // Map scale 0.1-4.0 to cell count 100-10000
    // Linear interpolation: cellCount = 100 + (scale - 0.1) * (10000 - 100) / (4.0 - 0.1)
    const minCells = 100;
    const maxCells = 10000;
    const minScale = 0.1;
    const maxScale = 4.0;
    
    const cellCount = minCells + (scale - minScale) * (maxCells - minCells) / (maxScale - minScale);
    return Math.round(cellCount);
  };

  return (
    <div className="mb-6">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-neutral-100">
            Scale Control
          </h3>
          {isGenerating && (
            <span className="text-xs text-blue-400">Updating...</span>
          )}
        </div>
        <div className="text-sm text-neutral-300">
          {scale.toFixed(1)}x ({getCellCount(scale)} cells)
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-neutral-400 w-8">Close</span>
          
          <div className="flex-1 relative">
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.1"
              value={scale}
              onChange={handleScaleChange}
              disabled={disabled}
              className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <span className="text-sm text-neutral-400 w-10">Far</span>
        </div>
      </div>
      
      <p className="text-xs text-neutral-400 mt-3">
        Adjust the viewing scale to see more or fewer color cells. Lower values simulate viewing from farther away.
      </p>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: rgb(96 165 250);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: rgb(96 165 250);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .slider:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
        }
        
        .slider:disabled::-moz-range-thumb {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ScaleControl;