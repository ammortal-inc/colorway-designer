// Color science utilities for lighting visualization
// Implements CIE color space conversions and chromatic adaptation

// XYZ color space (CIE 1931) - device-independent intermediate
export interface XYZColor {
  X: number;
  Y: number;
  Z: number;
}

// Light source definition
export interface LightSource {
  id: string;
  name: string;
  description: string;
  whitePoint: XYZColor;        // CIE XYZ white point
  colorTemperature?: number;    // Kelvin (for thermal sources)
  spectralProfile: 'continuous' | 'narrow' | 'mixed';
  transformMatrix?: number[][];  // 3x3 matrix for direct RGB transforms
}

// sRGB to linear RGB conversion (remove gamma correction)
function srgbToLinear(value: number): number {
  if (value <= 0.04045) {
    return value / 12.92;
  }
  return Math.pow((value + 0.055) / 1.055, 2.4);
}

// Linear RGB to sRGB conversion (apply gamma correction)
function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return value * 12.92;
  }
  return 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055;
}

// Convert hex color to RGB values (0-1 range)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  
  let r: number, g: number, b: number;
  
  if (cleanHex.length === 3) {
    // Shorthand hex (e.g., #AAA -> #AAAAAA)
    r = parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16) / 255;
    g = parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16) / 255;
    b = parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16) / 255;
  } else if (cleanHex.length === 6) {
    // Full hex (e.g., #AABBCC)
    r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  } else {
    // Invalid hex length - return black as fallback
    console.error(`Invalid hex color length: ${hex}`);
    return { r: 0, g: 0, b: 0 };
  }
  
  return { r, g, b };
}

// Convert RGB values (0-255 range) to hex
function rgbToHex(r: number, g: number, b: number): string {
  // Safety checks for invalid values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.error(`NaN values in rgbToHex: r=${r}, g=${g}, b=${b}`);
    return '#000000';
  }
  
  // Clamp to valid range
  const rClamped = Math.max(0, Math.min(255, Math.round(r)));
  const gClamped = Math.max(0, Math.min(255, Math.round(g)));
  const bClamped = Math.max(0, Math.min(255, Math.round(b)));
  
  const rHex = rClamped.toString(16).padStart(2, '0');
  const gHex = gClamped.toString(16).padStart(2, '0');
  const bHex = bClamped.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

// Convert sRGB to XYZ using D65 white point
// Uses sRGB transformation matrix
export function srgbToXyz(r: number, g: number, b: number): XYZColor {
  // Convert to linear RGB first
  const rLinear = srgbToLinear(r);
  const gLinear = srgbToLinear(g);
  const bLinear = srgbToLinear(b);
  
  // Apply sRGB to XYZ transformation matrix (D65 illuminant)
  const X = 0.4124564 * rLinear + 0.3575761 * gLinear + 0.1804375 * bLinear;
  const Y = 0.2126729 * rLinear + 0.7151522 * gLinear + 0.0721750 * bLinear;
  const Z = 0.0193339 * rLinear + 0.1191920 * gLinear + 0.9503041 * bLinear;
  
  // Scale to standard illuminant (Y = 100)
  return {
    X: X * 100,
    Y: Y * 100,
    Z: Z * 100
  };
}

// Convert XYZ back to sRGB with gamma correction
export function xyzToSrgb(xyz: XYZColor): { r: number; g: number; b: number } {
  // Safety checks for invalid values
  if (isNaN(xyz.X) || isNaN(xyz.Y) || isNaN(xyz.Z)) {
    console.error(`NaN values in xyzToSrgb:`, xyz);
    return { r: 0, g: 0, b: 0 };
  }
  
  // Scale back from standard illuminant
  const X = xyz.X / 100;
  const Y = xyz.Y / 100;
  const Z = xyz.Z / 100;
  
  // Apply XYZ to sRGB transformation matrix (D65 illuminant)
  let r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  let g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
  let b = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
  
  // Apply gamma correction
  r = linearToSrgb(r);
  g = linearToSrgb(g);
  b = linearToSrgb(b);
  
  // Safety checks for output
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.error(`NaN values in sRGB output: r=${r}, g=${g}, b=${b}`);
    return { r: 0, g: 0, b: 0 };
  }
  
  return { r, g, b };
}

// Clamp RGB values to valid range [0, 1]
function clampRgb(rgb: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
  return {
    r: Math.max(0, Math.min(1, rgb.r)),
    g: Math.max(0, Math.min(1, rgb.g)),
    b: Math.max(0, Math.min(1, rgb.b))
  };
}

// Apply 3x3 matrix transformation to XYZ color
function applyMatrixTransform(xyz: XYZColor, matrix: number[][]): XYZColor {
  if (matrix.length !== 3 || matrix[0].length !== 3) {
    throw new Error('Transform matrix must be 3x3');
  }
  
  return {
    X: matrix[0][0] * xyz.X + matrix[0][1] * xyz.Y + matrix[0][2] * xyz.Z,
    Y: matrix[1][0] * xyz.X + matrix[1][1] * xyz.Y + matrix[1][2] * xyz.Z,
    Z: matrix[2][0] * xyz.X + matrix[2][1] * xyz.Y + matrix[2][2] * xyz.Z
  };
}

// Chromatic adaptation using Bradford transform
// Converts colors from one illuminant to another
export function chromaticAdaptation(xyz: XYZColor, sourceWhite: XYZColor, targetWhite: XYZColor): XYZColor {
  // Bradford transformation matrix (XYZ to LMS)
  const bradfordMatrix = [
    [0.8951, 0.2664, -0.1614],
    [-0.7502, 1.7135, 0.0367],
    [0.0389, -0.0685, 1.0296]
  ];
  
  // Inverse Bradford matrix (LMS to XYZ)
  const bradfordInverse = [
    [0.9869929, -0.1470543, 0.1599627],
    [0.4323053, 0.5183603, 0.0492912],
    [-0.0085287, 0.0400428, 0.9684867]
  ];
  
  // Convert source and target white points to LMS
  const sourceLMS = applyMatrixTransform(sourceWhite, bradfordMatrix);
  const targetLMS = applyMatrixTransform(targetWhite, bradfordMatrix);
  
  // Check for division by zero
  if (sourceLMS.X === 0 || sourceLMS.Y === 0 || sourceLMS.Z === 0) {
    console.error(`Division by zero in chromatic adaptation`, sourceLMS);
    return xyz; // Return original color
  }
  
  // Calculate adaptation matrix
  const adaptMatrix = [
    [targetLMS.X / sourceLMS.X, 0, 0],
    [0, targetLMS.Y / sourceLMS.Y, 0],
    [0, 0, targetLMS.Z / sourceLMS.Z]
  ];
  
  // Apply full transformation: XYZ -> LMS -> adapted LMS -> XYZ
  const lms = applyMatrixTransform(xyz, bradfordMatrix);
  const adaptedLMS = applyMatrixTransform(lms, adaptMatrix);
  return applyMatrixTransform(adaptedLMS, bradfordInverse);
}

// Standard D65 white point (daylight, 6500K)
export const D65_WHITE_POINT: XYZColor = {
  X: 95.047,
  Y: 100.0,
  Z: 108.883
};

// Standard light sources for visualization
export const LIGHT_SOURCES: LightSource[] = [
  {
    id: 'incandescent-a',
    name: 'Incandescent',
    description: 'Warm tungsten bulb (2856K) - traditional indoor lighting',
    whitePoint: { X: 109.85, Y: 100.0, Z: 35.585 },
    colorTemperature: 2856,
    spectralProfile: 'continuous'
  },
  {
    id: 'fluorescent-f2',
    name: 'Fluorescent',
    description: 'Cool white fluorescent (4230K) - office lighting',
    whitePoint: { X: 99.19, Y: 100.0, Z: 67.39 },
    colorTemperature: 4230,
    spectralProfile: 'mixed'
  },
  {
    id: 'led-5000k',
    name: 'LED Cool White',
    description: 'Modern LED bulb (5000K) - energy-efficient lighting',
    whitePoint: { X: 96.42, Y: 100.0, Z: 82.51 },
    colorTemperature: 5000,
    spectralProfile: 'mixed'
  },
  {
    id: 'red-660nm',
    name: 'Red LED (660nm)',
    description: 'Narrow-band red light - specialized viewing condition',
    whitePoint: { X: 41.24, Y: 21.26, Z: 1.93 },
    spectralProfile: 'narrow',
    transformMatrix: [
      [0.8, 0.0, 0.0],   // Heavy red emphasis
      [0.3, 0.1, 0.0],   // Minimal green response  
      [0.0, 0.0, 0.05]   // Almost no blue
    ]
  }
];

// Main function to transform a color for a specific lighting condition
export function transformColorForLighting(hexColor: string, lightSource: LightSource): string {
  // 1. Convert hex to RGB (0-1 range)
  const rgb = hexToRgb(hexColor);
  
  // 2. Convert to XYZ color space
  const xyz = srgbToXyz(rgb.r, rgb.g, rgb.b);
  
  // 3. Apply lighting transformation
  let transformedXyz: XYZColor;
  
  if (lightSource.transformMatrix) {
    // Direct matrix transformation for special cases (like 660nm red)
    transformedXyz = applyMatrixTransform(xyz, lightSource.transformMatrix);
  } else {
    // Chromatic adaptation for standard illuminants
    transformedXyz = chromaticAdaptation(xyz, D65_WHITE_POINT, lightSource.whitePoint);
  }
  
  // 4. Convert back to sRGB and clamp to valid range
  const transformedRgb = xyzToSrgb(transformedXyz);
  const clampedRgb = clampRgb(transformedRgb);
  
  // 5. Convert to hex (multiply by 255 and round)
  return rgbToHex(
    Math.round(clampedRgb.r * 255), 
    Math.round(clampedRgb.g * 255), 
    Math.round(clampedRgb.b * 255)
  );
}

// Performance optimization: Cache for color transformations
const colorTransformCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

// Get cached color transformation (for performance)
export function getCachedColorTransform(hexColor: string, lightId: string): string {
  const cacheKey = `${hexColor}-${lightId}`;
  
  if (colorTransformCache.has(cacheKey)) {
    return colorTransformCache.get(cacheKey)!;
  }
  
  // Find light source and perform transformation
  const lightSource = LIGHT_SOURCES.find(l => l.id === lightId);
  if (!lightSource) {
    return hexColor; // Return original if light source not found
  }
  
  try {
    const transformed = transformColorForLighting(hexColor, lightSource);
    
    // Maintain cache size (LRU eviction)
    if (colorTransformCache.size >= MAX_CACHE_SIZE) {
      const firstKey = colorTransformCache.keys().next().value;
      if (firstKey !== undefined) {
        colorTransformCache.delete(firstKey);
      }
    }
    
    colorTransformCache.set(cacheKey, transformed);
    return transformed;
  } catch (error) {
    console.error(`Transform error for ${hexColor} with ${lightId}:`, error);
    return hexColor; // Return original on error
  }
}