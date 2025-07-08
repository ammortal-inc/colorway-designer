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
  lightingId: string;
  onColorsChange: (colors: Color[]) => void;
  onScaleChange: (scale: number) => void;
  onLightingChange: (lightingId: string) => void;
}

interface UseURLStateReturn {
  updateURLWithState: (colors: Color[], scale: number, lightingId: string) => void;
  loadStateFromURL: () => { colors: Color[], scale: number, lightingId: string } | null;
}

export const useURLState = ({
  colors,
  scale,
  lightingId,
  onColorsChange,
  onScaleChange,
  onLightingChange,
}: UseURLStateProps): UseURLStateReturn => {
  const isInitialLoad = useRef(true);
  const isUpdatingFromURL = useRef(false);
  
  // Debounced URL update function
  const debouncedUpdateURL = useRef(
    debounce((colors: Color[], scale: number, lightingId: string) => {
      // Only update URL if we're not currently updating from URL
      if (!isUpdatingFromURL.current) {
        updateURL(colors, scale, lightingId);
      }
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

  // Update URL when colors, scale, or lighting changes
  const updateURLWithState = useCallback((colors: Color[], scale: number, lightingId: string) => {
    // Don't update URL if we're currently loading from URL
    if (isUpdatingFromURL.current) {
      return;
    }
    
    debouncedUpdateURL(colors, scale, lightingId);
  }, [debouncedUpdateURL]);

  // Load initial state from URL (only on mount)
  useEffect(() => {
    if (isInitialLoad.current) {
      const urlState = loadStateFromURL();
      
      if (urlState) {
        isUpdatingFromURL.current = true;
        
        // Only update if the URL state is different from current state
        const colorsChanged = 
          urlState.colors.length !== colors.length ||
          urlState.colors.some((urlColor, index) => 
            !colors[index] || 
            urlColor.hex !== colors[index].hex || 
            urlColor.density !== colors[index].density
          );
        
        const scaleChanged = Math.abs(urlState.scale - scale) > 0.01;
        const lightingChanged = urlState.lightingId !== lightingId;
        
        if (colorsChanged) {
          onColorsChange(urlState.colors);
        }
        
        if (scaleChanged) {
          onScaleChange(urlState.scale);
        }
        
        if (lightingChanged) {
          onLightingChange(urlState.lightingId);
        }
        
        // Reset flag after state updates have been applied
        setTimeout(() => {
          isUpdatingFromURL.current = false;
        }, 100);
      }
      
      isInitialLoad.current = false;
    }
  }, []); // Remove dependencies to prevent re-runs

  // Update URL when state changes (after initial load)
  useEffect(() => {
    if (!isInitialLoad.current) {
      updateURLWithState(colors, scale, lightingId);
    }
  }, [colors, scale, lightingId, updateURLWithState]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      isUpdatingFromURL.current = true;
      
      const urlState = loadStateFromURL();
      
      if (urlState) {
        onColorsChange(urlState.colors);
        onScaleChange(urlState.scale);
        onLightingChange(urlState.lightingId);
      }
      
      // Reset flag after state updates
      setTimeout(() => {
        isUpdatingFromURL.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onColorsChange, onScaleChange, onLightingChange, loadStateFromURL]);

  return {
    updateURLWithState,
    loadStateFromURL,
  };
};