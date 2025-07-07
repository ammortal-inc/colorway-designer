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

// Convert hex color to RGB values
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex colors (e.g., #RGB -> #RRGGBB)
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex;
  
  const r = parseInt(fullHex.substr(0, 2), 16);
  const g = parseInt(fullHex.substr(2, 2), 16);
  const b = parseInt(fullHex.substr(4, 2), 16);
  
  return { r, g, b };
};

// Calculate relative luminance using WCAG 2.1 formula
export const getColorLuminance = (r: number, g: number, b: number): number => {
  // Convert RGB to linear RGB
  const toLinear = (value: number): number => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);
  
  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

// Get appropriate text color based on background color luminance
export const getContrastTextColor = (backgroundColor: string): string => {
  const { r, g, b } = hexToRgb(backgroundColor);
  const luminance = getColorLuminance(r, g, b);
  
  // Return dark text for light backgrounds, light text for dark backgrounds
  return luminance > 0.5 ? '#374151' : '#F3F4F6';
};