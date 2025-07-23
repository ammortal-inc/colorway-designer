// RAL-specific utility functions for UI components
import { RALColor, searchRALByNumber, searchRALByName, getRALByHex, getRALColors } from '../data/ralColors';
import { calculateHexColorDistance } from './colorUtils';

// Debounce utility for search operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func.apply(null, args), delay);
  };
}

// Enhanced search that combines both number and name results
export async function searchRAL(query: string): Promise<RALColor[]> {
  if (!query.trim()) return [];
  
  // Determine if query looks like a number or name
  const isNumericQuery = /^\d/.test(query.trim());
  
  if (isNumericQuery) {
    // Prioritize number search for numeric queries
    const numberResults = await searchRALByNumber(query);
    const nameResults = await searchRALByName(query);
    
    // Combine results, prioritizing number matches
    const combined = [...numberResults];
    nameResults.forEach(result => {
      if (!combined.find(c => c.number === result.number)) {
        combined.push(result);
      }
    });
    
    return combined.slice(0, 10);
  } else {
    // Prioritize name search for text queries
    const nameResults = await searchRALByName(query);
    const numberResults = await searchRALByNumber(query);
    
    // Combine results, prioritizing name matches
    const combined = [...nameResults];
    numberResults.forEach(result => {
      if (!combined.find(c => c.number === result.number)) {
        combined.push(result);
      }
    });
    
    return combined.slice(0, 10);
  }
}

// Format RAL color for display in dropdown
export function formatRALColorDisplay(ralColor: RALColor): string {
  const ralNumber = ralColor.number;
  return `RAL ${ralNumber} - ${ralColor.name}`;
}

// Check if a hex color matches a known RAL color
export async function findRALForHex(hex: string): Promise<RALColor | null> {
  const ralColor = await getRALByHex(hex);
  return ralColor || null;
}

// Validate RAL number format (flexible parsing)
export function parseRALNumberInput(input: string): string | null {
  // Remove non-numeric characters
  const cleaned = input.replace(/[^0-9]/g, '');
  
  if (cleaned.length < 4) return null;
  
  // Try to format as RAL number
  if (cleaned.length === 4) {
    // Format as "000 XX XX"
    const formatted = `000 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)}`;
    return formatted;
  } else if (cleaned.length === 6) {
    // Format as "XXX XX XX"
    const formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 7)}`;
    return formatted;
  } else if (cleaned.length === 7) {
    // Format as "XXX XX XX"
    const formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 7)}`;
    return formatted;
  }
  
  return null;
}

// Generate color preview style object
export function getColorPreviewStyle(hex: string): React.CSSProperties {
  return {
    backgroundColor: hex,
    width: '20px',
    height: '20px',
    borderRadius: '3px',
    border: '1px solid #e5e7eb',
    flexShrink: 0
  };
}

// Highlight search terms in text (for dropdown display)
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Interface for RAL color with distance information
export interface RALColorWithDistance extends RALColor {
  distance: number;
}

// Cache for color distance calculations to improve performance
const colorDistanceCache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 500;
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  colors: RALColorWithDistance[];
  timestamp: number;
}

// Find the closest RAL colors to a given hex color
export async function findClosestRALColors(
  targetHex: string, 
  count: number = 5
): Promise<RALColorWithDistance[]> {
  const cacheKey = `${targetHex.toUpperCase()}_${count}`;
  
  // Check cache first
  const cached = colorDistanceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_TIME) {
    return cached.colors;
  }
  
  // Load RAL colors data
  const ralColors = await getRALColors();
  if (ralColors.length === 0) {
    return [];
  }
  
  // Calculate distances to all RAL colors
  const colorsWithDistance: RALColorWithDistance[] = ralColors.map(ralColor => ({
    ...ralColor,
    distance: calculateHexColorDistance(targetHex, ralColor.hex)
  }));
  
  // Sort by distance and take the closest ones
  colorsWithDistance.sort((a, b) => a.distance - b.distance);
  const closestColors = colorsWithDistance.slice(0, count);
  
  // Cache the result
  if (colorDistanceCache.size >= CACHE_MAX_SIZE) {
    // Remove oldest cache entries
    const sortedEntries = Array.from(colorDistanceCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < Math.floor(CACHE_MAX_SIZE / 4); i++) {
      colorDistanceCache.delete(sortedEntries[i][0]);
    }
  }
  
  colorDistanceCache.set(cacheKey, {
    colors: closestColors,
    timestamp: Date.now()
  });
  
  return closestColors;
}

// Check if a color is "close" to any RAL color (distance threshold)
export async function isNearRALColor(
  hex: string, 
  threshold: number = 5.0
): Promise<{ isNear: boolean; closestColor?: RALColor; distance?: number }> {
  const closest = await findClosestRALColors(hex, 1);
  
  if (closest.length === 0) {
    return { isNear: false };
  }
  
  const closestColor = closest[0];
  const isNear = closestColor.distance <= threshold;
  
  return {
    isNear,
    closestColor: isNear ? closestColor : undefined,
    distance: closestColor.distance
  };
}

// Clear the color distance cache (useful for testing or memory management)
export function clearColorDistanceCache(): void {
  colorDistanceCache.clear();
}