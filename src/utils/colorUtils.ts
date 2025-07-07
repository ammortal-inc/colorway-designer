import { Color } from '../types';

export const generateColorId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isValidHexColor = (hex: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
};

export const createColor = (hex: string): Color => {
  if (!isValidHexColor(hex)) {
    throw new Error('Invalid hex color format');
  }
  
  return {
    id: generateColorId(),
    hex: hex.toUpperCase(),
  };
};

export const getRandomColor = (colors: Color[]): Color => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

export const formatHexColor = (hex: string): string => {
  // Remove # if present and convert to uppercase
  const cleanHex = hex.replace('#', '').toUpperCase();
  
  // Add # prefix if not present
  return `#${cleanHex}`;
};