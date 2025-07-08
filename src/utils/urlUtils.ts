import { Color } from '../types';
import { createColor, isValidHexColor, isValidDensity } from './colorUtils';

interface URLState {
  colors: Color[];
  scale: number;
  lightingId: string;
}

interface SerializableColor {
  hex: string;
  density: number;
}


export const encodeColorsToURL = (colors: Color[], scale: number, lightingId: string): string => {
  try {
    // Convert colors to a simpler format for URL encoding
    const serializableColors: SerializableColor[] = colors.map(({ hex, density }) => ({
      hex,
      density,
    }));

    // Create URL parameters
    const params = new URLSearchParams();
    
    if (serializableColors.length > 0) {
      const colorsJson = JSON.stringify(serializableColors);
      const encodedColors = btoa(colorsJson);
      params.set('colors', encodedColors);
    }
    
    if (scale !== 1.0) {
      params.set('scale', scale.toString());
    }
    
    if (lightingId !== 'natural') {
      params.set('lighting', lightingId);
    }

    return params.toString();
  } catch (error) {
    console.error('Error encoding colors to URL:', error);
    return '';
  }
};

export const decodeColorsFromURL = (url: string): URLState | null => {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    const colorsParam = params.get('colors');
    const scaleParam = params.get('scale');
    const lightingParam = params.get('lighting');
    
    let colors: Color[] = [];
    let scale = 1.0;
    let lightingId = 'natural';
    
    // Decode colors if present
    if (colorsParam) {
      try {
        const decodedColors = atob(colorsParam);
        const parsedColors: SerializableColor[] = JSON.parse(decodedColors);
        
        // Validate and create Color objects
        colors = parsedColors
          .filter(({ hex, density }) => 
            isValidHexColor(hex) && isValidDensity(density)
          )
          .map(({ hex, density }) => createColor(hex, density));
      } catch (error) {
        console.warn('Invalid colors parameter in URL:', error);
      }
    }
    
    // Decode scale if present
    if (scaleParam) {
      const parsedScale = parseFloat(scaleParam);
      if (!isNaN(parsedScale) && parsedScale >= 0.1 && parsedScale <= 4.0) {
        scale = parsedScale;
      }
    }
    
    // Decode lighting if present
    if (lightingParam) {
      // Import lighting sources to validate
      import('../utils/lightingUtils').then(({ LIGHT_SOURCES }) => {
        const validLightIds = ['natural', ...LIGHT_SOURCES.map(l => l.id)];
        if (validLightIds.includes(lightingParam)) {
          lightingId = lightingParam;
        }
      });
      // For synchronous validation, use a simple check
      const knownLightIds = ['natural', 'incandescent-a', 'fluorescent-f2', 'led-5000k', 'red-660nm'];
      if (knownLightIds.includes(lightingParam)) {
        lightingId = lightingParam;
      }
    }
    
    return { colors, scale, lightingId };
  } catch (error) {
    console.error('Error decoding colors from URL:', error);
    return null;
  }
};

export const getStateFromURL = (): URLState | null => {
  try {
    const currentUrl = window.location.href;
    return decodeColorsFromURL(currentUrl);
  } catch (error) {
    console.error('Error getting state from URL:', error);
    return null;
  }
};

export const updateURL = (colors: Color[], scale: number, lightingId: string): void => {
  try {
    const urlParams = encodeColorsToURL(colors, scale, lightingId);
    const newUrl = urlParams ? `${window.location.pathname}?${urlParams}` : window.location.pathname;
    
    // Only update URL if it's actually different from current URL
    if (newUrl !== window.location.pathname + window.location.search) {
      // Use replaceState to avoid cluttering browser history
      window.history.replaceState({}, '', newUrl);
    }
  } catch (error) {
    console.error('Error updating URL:', error);
  }
};

export const generateShareableURL = (colors: Color[], scale: number, lightingId: string): string => {
  try {
    // First, check if the current URL already has the right state
    const currentUrlState = getStateFromURL();
    
    if (currentUrlState && 
        currentUrlState.colors.length === colors.length &&
        Math.abs(currentUrlState.scale - scale) < 0.01 &&
        currentUrlState.lightingId === lightingId &&
        currentUrlState.colors.every((urlColor, index) => 
          colors[index] && 
          urlColor.hex === colors[index].hex && 
          Math.abs(urlColor.density - colors[index].density) < 0.01
        )) {
      // Current URL already represents the current state, return it
      return window.location.href;
    }
    
    // Otherwise, generate a new URL
    const urlParams = encodeColorsToURL(colors, scale, lightingId);
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return urlParams ? `${baseUrl}?${urlParams}` : baseUrl;
  } catch (error) {
    console.error('Error generating shareable URL:', error);
    return window.location.href;
  }
};

export const isValidURLState = (state: URLState | null): state is URLState => {
  return (
    state !== null &&
    Array.isArray(state.colors) &&
    typeof state.scale === 'number' &&
    state.scale >= 0.1 &&
    state.scale <= 4.0 &&
    typeof state.lightingId === 'string' &&
    state.lightingId.length > 0
  );
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};