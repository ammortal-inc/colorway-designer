import { useEffect, useRef, useCallback } from 'react';
import { Color } from '../types';
import { 
  getStateFromURL, 
  updateURL, 
  debounce, 
  isValidURLState 
} from '../utils/urlUtils';

interface UseURLStateProps {
  colors: Color[];
  scale: number;
  onColorsChange: (colors: Color[]) => void;
  onScaleChange: (scale: number) => void;
}

interface UseURLStateReturn {
  updateURLWithState: (colors: Color[], scale: number) => void;
  loadStateFromURL: () => { colors: Color[], scale: number } | null;
}

export const useURLState = ({
  colors,
  scale,
  onColorsChange,
  onScaleChange,
}: UseURLStateProps): UseURLStateReturn => {
  const isInitialLoad = useRef(true);
  const lastUpdateTime = useRef(0);
  
  // Debounced URL update function
  const debouncedUpdateURL = useRef(
    debounce((colors: Color[], scale: number) => {
      updateURL(colors, scale);
    }, 300)
  ).current;

  // Load state from URL on component mount
  const loadStateFromURL = useCallback(() => {
    const urlState = getStateFromURL();
    
    if (isValidURLState(urlState)) {
      return urlState;
    }
    
    return null;
  }, []);

  // Update URL when colors or scale changes
  const updateURLWithState = useCallback((colors: Color[], scale: number) => {
    // Prevent infinite loops by checking if this is an external change
    const now = Date.now();
    if (now - lastUpdateTime.current < 100) {
      return;
    }
    
    lastUpdateTime.current = now;
    debouncedUpdateURL(colors, scale);
  }, [debouncedUpdateURL]);

  // Load initial state from URL
  useEffect(() => {
    if (isInitialLoad.current) {
      const urlState = loadStateFromURL();
      
      if (urlState) {
        // Only update if the URL state is different from current state
        const colorsChanged = 
          urlState.colors.length !== colors.length ||
          urlState.colors.some((urlColor, index) => 
            !colors[index] || 
            urlColor.hex !== colors[index].hex || 
            urlColor.density !== colors[index].density
          );
        
        const scaleChanged = Math.abs(urlState.scale - scale) > 0.01;
        
        if (colorsChanged) {
          onColorsChange(urlState.colors);
        }
        
        if (scaleChanged) {
          onScaleChange(urlState.scale);
        }
      }
      
      isInitialLoad.current = false;
    }
  }, [colors, scale, onColorsChange, onScaleChange, loadStateFromURL]);

  // Update URL when state changes (after initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      updateURLWithState(colors, scale);
    }
  }, [colors, scale, updateURLWithState]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlState = loadStateFromURL();
      
      if (urlState) {
        onColorsChange(urlState.colors);
        onScaleChange(urlState.scale);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onColorsChange, onScaleChange, loadStateFromURL]);

  return {
    updateURLWithState,
    loadStateFromURL,
  };
};