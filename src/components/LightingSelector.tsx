import React from 'react';
import { LIGHT_SOURCES } from '../utils/lightingUtils';

interface LightingSelectorProps {
  selectedLightId: string;
  onLightChange: (lightId: string) => void;
  className?: string;
}

const LightingSelector: React.FC<LightingSelectorProps> = ({ 
  selectedLightId, 
  onLightChange, 
  className = '' 
}) => {
  // Add "Natural (Daylight)" option (no lighting transformation)
  const lightOptions = [
    {
      id: 'natural',
      name: 'Natural (Daylight)',
      description: 'No lighting transformation - colors as specified',
      colorTemperature: undefined
    },
    ...LIGHT_SOURCES
  ];

  const getTemperatureDisplay = (lightSource: typeof lightOptions[0]) => {
    if (lightSource.colorTemperature) {
      return `${lightSource.colorTemperature}K`;
    }
    return '';
  };


  return (
    <div className={`mb-6 ${className}`}>
      <div className="mb-3">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          Lighting Conditions
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          See how your colorway appears under different lighting
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {lightOptions.map((light) => {
          const isSelected = selectedLightId === light.id;
          const temperature = getTemperatureDisplay(light);
          
          return (
            <button
              key={light.id}
              onClick={() => onLightChange(light.id)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                flex items-center border-2 min-w-0 flex-shrink-0
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }
              `}
              title={light.description}
            >
              <div className="flex flex-col items-start min-w-0">
                <span className="truncate">{light.name}</span>
                {temperature && (
                  <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {temperature}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
    </div>
  );
};

export default LightingSelector;