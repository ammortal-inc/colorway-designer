import { Color } from '../types';

export const generateColorId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isValidHexColor = (hex: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
};

export const isValidDensity = (density: number): boolean => {
  return typeof density === 'number' && density >= 0 && !isNaN(density) && isFinite(density);
};

export const normalizeDensity = (densityInput: string): number => {
  const density = parseFloat(densityInput);
  if (isNaN(density) || density < 0) {
    return 1; // Default to 1 for invalid inputs
  }
  return density;
};

export const createColor = (hex: string, density: number = 1): Color => {
  if (!isValidHexColor(hex)) {
    throw new Error('Invalid hex color format');
  }
  
  if (!isValidDensity(density)) {
    throw new Error('Invalid density value');
  }
  
  return {
    id: generateColorId(),
    hex: hex.toUpperCase(),
    density,
  };
};

export const calculateTotalDensity = (colors: Color[]): number => {
  return colors.reduce((total, color) => total + color.density, 0);
};

export const calculateColorProbability = (color: Color, totalDensity: number, colorsLength: number): number => {
  if (totalDensity === 0) {
    return 1 / colorsLength; // Equal probability if all densities are 0
  }
  return color.density / totalDensity;
};

export const getWeightedRandomColor = (colors: Color[]): Color => {
  if (colors.length === 0) {
    throw new Error('Cannot select from empty color array');
  }
  
  if (colors.length === 1) {
    return colors[0];
  }
  
  const totalDensity = calculateTotalDensity(colors);
  
  // If all densities are 0, fall back to equal probability
  if (totalDensity === 0) {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
  
  // Generate random number between 0 and totalDensity
  const randomValue = Math.random() * totalDensity;
  
  // Find the color using cumulative probability
  let cumulativeDensity = 0;
  for (const color of colors) {
    cumulativeDensity += color.density;
    if (randomValue <= cumulativeDensity) {
      return color;
    }
  }
  
  // Fallback to last color (should not happen with proper implementation)
  return colors[colors.length - 1];
};

// Keep the old function for backward compatibility, but use weighted selection
export const getRandomColor = getWeightedRandomColor;

export const formatHexColor = (hex: string): string => {
  // Remove # if present and convert to uppercase
  const cleanHex = hex.replace('#', '').toUpperCase();
  
  // Add # prefix if not present
  return `#${cleanHex}`;
};