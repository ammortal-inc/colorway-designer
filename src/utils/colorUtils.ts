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

export interface CreateColorOptions {
  density?: number;
  ralNumber?: string;
  ralName?: string;
  name?: string;
  visible?: boolean;    // Visibility option
}

// Overloaded function signatures for backward compatibility
export function createColor(hex: string): Color;
export function createColor(hex: string, density: number): Color;
export function createColor(hex: string, options: CreateColorOptions): Color;
export function createColor(hex: string, densityOrOptions?: number | CreateColorOptions): Color {
  // Handle legacy usage: createColor(hex, density)
  let options: CreateColorOptions;
  if (typeof densityOrOptions === 'number') {
    options = { density: densityOrOptions };
  } else {
    options = densityOrOptions || {};
  }
  
  const { density = 1, ralNumber, ralName, name, visible = true } = options;
  
  if (!isValidHexColor(hex)) {
    throw new Error('Invalid hex color format');
  }
  
  if (!isValidDensity(density)) {
    throw new Error('Invalid density value');
  }
  
  const color: Color = {
    id: generateColorId(),
    hex: hex.toUpperCase(),
    density,
    visible
  };
  
  // Add optional properties if provided
  if (name) color.name = name;
  if (ralNumber) color.ralNumber = ralNumber;
  if (ralName) color.ralName = ralName;
  
  return color;
};

export const calculateTotalDensity = (colors: Color[]): number => {
  // Only calculate density for visible colors
  return colors
    .filter(color => color.visible !== false)
    .reduce((total, color) => total + color.density, 0);
};

export const calculateColorProbability = (color: Color, totalDensity: number, colorsLength: number): number => {
  // If color is not visible, probability is 0
  if (color.visible === false) return 0;
  
  if (totalDensity === 0) {
    return 1 / colorsLength; // Equal probability if all densities are 0
  }
  return color.density / totalDensity;
};

export const getWeightedRandomColor = (colors: Color[]): Color => {
  // Filter to only visible colors
  const visibleColors = colors.filter(color => color.visible !== false);
  
  if (visibleColors.length === 0) {
    throw new Error('Cannot select from empty visible color array');
  }
  
  if (visibleColors.length === 1) {
    return visibleColors[0];
  }
  
  const totalDensity = visibleColors.reduce((total, color) => total + color.density, 0);
  
  // If all densities are 0, fall back to equal probability
  if (totalDensity === 0) {
    const randomIndex = Math.floor(Math.random() * visibleColors.length);
    return visibleColors[randomIndex];
  }
  
  // Generate random number between 0 and totalDensity
  const randomValue = Math.random() * totalDensity;
  
  // Find the color using cumulative probability
  let cumulativeDensity = 0;
  for (const color of visibleColors) {
    cumulativeDensity += color.density;
    if (randomValue <= cumulativeDensity) {
      return color;
    }
  }
  
  // Fallback to last color (should not happen with proper implementation)
  return visibleColors[visibleColors.length - 1];
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

// Convert RGB to hex
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(value)));
    return clamped.toString(16).padStart(2, '0');
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// Convert RGB to HSB
export const rgbToHsb = (r: number, g: number, b: number): { h: number; s: number; b: number } => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  
  let h = 0;
  let s = 0;
  const brightness = max;
  
  if (delta !== 0) {
    s = delta / max;
    
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    
    h *= 60;
    if (h < 0) h += 360;
  }
  
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    b: Math.round(brightness * 100)
  };
};

// Convert HSB to RGB
export const hsbToRgb = (h: number, s: number, b: number): { r: number; g: number; b: number } => {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const bNorm = b / 100;
  
  const c = bNorm * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = bNorm - c;
  
  let r = 0, g = 0, blue = 0;
  
  if (hNorm >= 0 && hNorm < 1/6) {
    r = c; g = x; blue = 0;
  } else if (hNorm >= 1/6 && hNorm < 2/6) {
    r = x; g = c; blue = 0;
  } else if (hNorm >= 2/6 && hNorm < 3/6) {
    r = 0; g = c; blue = x;
  } else if (hNorm >= 3/6 && hNorm < 4/6) {
    r = 0; g = x; blue = c;
  } else if (hNorm >= 4/6 && hNorm < 5/6) {
    r = x; g = 0; blue = c;
  } else if (hNorm >= 5/6 && hNorm < 1) {
    r = c; g = 0; blue = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((blue + m) * 255)
  };
};

// Convert hex to HSB
export const hexToHsb = (hex: string): { h: number; s: number; b: number } => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsb(r, g, b);
};

// Convert HSB to hex
export const hsbToHex = (h: number, s: number, b: number): string => {
  const { r, g, b: blue } = hsbToRgb(h, s, b);
  return rgbToHex(r, g, blue);
};

// Simple Linear Congruential Generator for consistent seeded randomness
const createSeededRandom = (seed: number): (() => number) => {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % 4294967296;
    return current / 4294967296;
  };
};

// Get random color using seeded randomness for consistent results
export const getSeededRandomColor = (colors: Color[], seed: number): Color => {
  // Filter to only visible colors
  const visibleColors = colors.filter(color => color.visible !== false);
  
  if (visibleColors.length === 0) {
    throw new Error('Cannot select from empty visible color array');
  }
  
  if (visibleColors.length === 1) {
    return visibleColors[0];
  }
  
  const random = createSeededRandom(seed);
  const totalDensity = visibleColors.reduce((total, color) => total + color.density, 0);
  
  // If all densities are 0, fall back to equal probability
  if (totalDensity === 0) {
    const randomIndex = Math.floor(random() * visibleColors.length);
    return visibleColors[randomIndex];
  }
  
  // Generate random number between 0 and totalDensity
  const randomValue = random() * totalDensity;
  
  // Find the color using cumulative probability
  let cumulativeDensity = 0;
  for (const color of visibleColors) {
    cumulativeDensity += color.density;
    if (randomValue <= cumulativeDensity) {
      return color;
    }
  }
  
  // Fallback to last color (should not happen with proper implementation)
  return visibleColors[visibleColors.length - 1];
};

// LAB color space conversion functions for perceptually accurate color distance
export interface LABColor {
  l: number; // Lightness (0-100)
  a: number; // Green-Red axis
  b: number; // Blue-Yellow axis
}

// Convert RGB to XYZ color space (intermediate step for LAB)
export const rgbToXyz = (r: number, g: number, b: number): { x: number; y: number; z: number } => {
  // Normalize RGB values to 0-1
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;
  
  // Apply gamma correction
  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;
  
  // Scale by 100
  rNorm *= 100;
  gNorm *= 100;
  bNorm *= 100;
  
  // Convert to XYZ using sRGB matrix
  const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
  const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
  const z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;
  
  return { x, y, z };
};

// Convert XYZ to LAB color space
export const xyzToLab = (x: number, y: number, z: number): LABColor => {
  // D65 illuminant reference values
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;
  
  // Normalize by reference white point
  const xr = x / xn;
  const yr = y / yn;
  const zr = z / zn;
  
  // Apply LAB conversion function
  const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr + 16/116);
  const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr + 16/116);
  const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr + 16/116);
  
  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);
  
  return { l, a, b };
};

// Convert RGB to LAB color space (combining the above functions)
export const rgbToLab = (r: number, g: number, b: number): LABColor => {
  const { x, y, z } = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
};

// Convert hex color to LAB color space
export const hexToLab = (hex: string): LABColor => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToLab(r, g, b);
};

// Calculate perceptual color distance using Delta E CIE76 formula
export const calculateColorDistance = (color1: LABColor, color2: LABColor): number => {
  const deltaL = color1.l - color2.l;
  const deltaA = color1.a - color2.a;
  const deltaB = color1.b - color2.b;
  
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
};

// Calculate color distance between two hex colors
export const calculateHexColorDistance = (hex1: string, hex2: string): number => {
  const lab1 = hexToLab(hex1);
  const lab2 = hexToLab(hex2);
  return calculateColorDistance(lab1, lab2);
};