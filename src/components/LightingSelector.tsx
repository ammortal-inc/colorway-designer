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
  // Add "Natural" option (no lighting transformation)
  const lightOptions = [
    {
      id: 'natural',
      name: 'Natural',
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

  const getLightIcon = (lightId: string) => {
    switch (lightId) {
      case 'natural':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'daylight-d65':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
          </svg>
        );
      case 'incandescent-a':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
          </svg>
        );
      case 'fluorescent-f2':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 11h16v2H4zm0-4h16v2H4zm0 8h16v2H4z"/>
          </svg>
        );
      case 'led-5000k':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'red-660nm':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      default:
        return null;
    }
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
                flex items-center space-x-2 border-2 min-w-0 flex-shrink-0
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }
              `}
              title={light.description}
            >
              <span className="flex-shrink-0">
                {getLightIcon(light.id)}
              </span>
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
      
      {/* Current selection info */}
      {selectedLightId !== 'natural' && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-all duration-300">
          <div className="text-sm text-blue-900 dark:text-blue-100">
            {LIGHT_SOURCES.find(l => l.id === selectedLightId)?.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default LightingSelector;