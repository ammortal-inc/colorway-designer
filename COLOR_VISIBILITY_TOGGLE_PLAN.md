# Color Visibility Toggle Implementation Plan

## Overview
Add the ability to toggle individual colors on/off in the palette without removing them, with full URL persistence for sharing specific color combinations.

## Phase 1: Type System & Core Infrastructure

### 1.1 Update Color Interface
**File**: `src/types/index.ts`
```typescript
export interface Color {
  id: string;           // Unique identifier (generated)
  hex: string;          // #RRGGBB format (uppercase)
  name?: string;        // Optional display name
  density: number;      // Weight for probability calculation (≥0)
  ralNumber?: string;   // RAL color number (e.g., "3020")
  ralName?: string;     // RAL color name (e.g., "Traffic red")
  visible?: boolean;    // NEW: Visibility toggle (defaults to true)
}
```

### 1.2 Update SerializableColor Interface
**File**: `src/utils/urlUtils.ts`
```typescript
interface SerializableColor {
  hex: string;
  density: number;
  visible?: boolean;    // NEW: For URL persistence
}
```

### 1.3 Update createColor Utility
**File**: `src/utils/colorUtils.ts`
```typescript
interface CreateColorOptions {
  density?: number;
  ralNumber?: string;
  ralName?: string;
  visible?: boolean;    // NEW: Visibility option
}

export function createColor(hex: string, options: CreateColorOptions = {}): Color {
  const { density = 1, ralNumber, ralName, visible = true } = options;
  // ... existing implementation
  return {
    id: generateId(),
    hex: hex.toUpperCase(),
    density: normalizeDensity(density),
    ...(ralNumber && { ralNumber }),
    ...(ralName && { ralName }),
    visible
  };
}
```

## Phase 2: URL State Management

### 2.1 Modify URL Encoding
**File**: `src/utils/urlUtils.ts`
```typescript
export const encodeColorsToURL = (colors: Color[], scale: number, lightingId: string): string => {
  try {
    // Convert colors to a simpler format for URL encoding
    const serializableColors: SerializableColor[] = colors.map(({ hex, density, visible }) => {
      const serializable: SerializableColor = { hex, density };
      // Only include visible property when it's false (keep URLs compact)
      if (visible === false) {
        serializable.visible = false;
      }
      return serializable;
    });
    
    // ... rest of existing implementation
  } catch (error) {
    console.error('Error encoding colors to URL:', error);
    return '';
  }
};
```

### 2.2 Modify URL Decoding
**File**: `src/utils/urlUtils.ts`
```typescript
export const decodeColorsFromURL = async (url: string): Promise<URLState | null> => {
  try {
    // ... existing URL parsing logic
    
    // Look up RAL data for each color with visibility support
    colors = await Promise.all(
      validColors.map(async ({ hex, density, visible = true }) => {
        try {
          const ralColor = await getRALByHex(hex);
          if (ralColor) {
            return createColor(hex, {
              density,
              ralNumber: ralColor.number,
              ralName: ralColor.name,
              visible
            });
          } else {
            return createColor(hex, { density, visible });
          }
        } catch (error) {
          console.warn('Error looking up RAL color for', hex, error);
          return createColor(hex, { density, visible });
        }
      })
    );
    
    // ... rest of existing implementation
  } catch (error) {
    console.error('Error decoding colors from URL:', error);
    return null;
  }
};
```

## Phase 3: State Management & Filtering

### 3.1 Add Visibility Toggle Handlers
**File**: `src/App.tsx`
```typescript
// New state management functions
const handleColorVisibilityToggle = useCallback((colorId: string) => {
  setColors(prevColors => 
    prevColors.map(color => 
      color.id === colorId 
        ? { ...color, visible: !color.visible }
        : color
    )
  );
}, []);

const handleToggleAllVisibility = useCallback((visible: boolean) => {
  setColors(prevColors => 
    prevColors.map(color => ({ ...color, visible }))
  );
}, []);

// Add to component props
<ColorPalette
  // ... existing props
  onColorVisibilityToggle={handleColorVisibilityToggle}
  onToggleAllVisibility={handleToggleAllVisibility}
/>
```

### 3.2 Update Visualization Logic
**File**: `src/components/VoronoiVisualization.tsx`
```typescript
const VoronoiVisualization: React.FC<VoronoiVisualizationProps> = ({
  colors,
  // ... other props
}) => {
  // Filter to only visible colors for visualization
  const visibleColors = useMemo(() => 
    colors.filter(color => color.visible !== false), 
    [colors]
  );
  
  // Use visibleColors instead of colors for all visualization logic
  const visualizationColors = visibleColors.map(color => 
    color.id === temporaryColorId && temporaryColorHex
      ? { ...color, hex: temporaryColorHex }
      : color
  );
  
  // ... rest of component uses visualizationColors
};
```

### 3.3 Update Probability Calculations
**File**: `src/utils/colorUtils.ts`
```typescript
export const calculateTotalDensity = (colors: Color[]): number => {
  // Only calculate density for visible colors
  return colors
    .filter(color => color.visible !== false)
    .reduce((total, color) => total + color.density, 0);
};

export const calculateColorProbability = (
  color: Color, 
  totalDensity: number, 
  totalColors: number
): number => {
  // If color is not visible, probability is 0
  if (color.visible === false) return 0;
  
  if (totalDensity === 0 || totalColors === 0) return 0;
  return color.density / totalDensity;
};
```

## Phase 4: UI Components

### 4.1 Add Visibility Controls to Color Palette
**File**: `src/components/ColorPalette.tsx`
```typescript
interface ColorPaletteProps {
  // ... existing props
  onColorVisibilityToggle?: (colorId: string) => void;
  onToggleAllVisibility?: (visible: boolean) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  // ... existing props
  onColorVisibilityToggle,
  onToggleAllVisibility
}) => {
  const handleVisibilityToggle = (colorId: string) => {
    if (onColorVisibilityToggle) {
      onColorVisibilityToggle(colorId);
    }
  };

  // Add bulk visibility controls to header
  const visibleCount = colors.filter(c => c.visible !== false).length;
  const hasHiddenColors = colors.some(c => c.visible === false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Color Palette ({colors.length}/10)
        </h3>
        <div className="flex items-center space-x-2">
          {hasHiddenColors && onToggleAllVisibility && (
            <button
              onClick={() => onToggleAllVisibility(true)}
              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
              title="Show all colors"
            >
              Show All
            </button>
          )}
          {visibleCount > 0 && onToggleAllVisibility && (
            <button
              onClick={() => onToggleAllVisibility(false)}
              className="text-xs px-2 py-1 bg-neutral-600 text-white rounded hover:bg-neutral-500 transition-colors"
              title="Hide all colors"
            >
              Hide All
            </button>
          )}
          {isolatedColorId && (
            <button
              onClick={() => onColorIsolate && onColorIsolate(null)}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
              title="Clear isolation"
            >
              Clear Isolation
            </button>
          )}
        </div>
      </div>
      
      {/* Color items with visibility controls */}
      <div className="grid grid-cols-1 gap-3">
        {colors.map((color) => {
          const isVisible = color.visible !== false;
          const isHidden = color.visible === false;
          
          return (
            <div
              key={color.id}
              className={`p-3 border rounded-lg transition-all ${
                isHidden 
                  ? 'opacity-50 border-neutral-300 dark:border-neutral-600' 
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
              style={{ 
                backgroundColor: displayColor,
                ...(isHidden && { 
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
                })
              }}
            >
              {/* Add visibility toggle button */}
              <div className="flex items-center space-x-2">
                {onColorVisibilityToggle && (
                  <button
                    onClick={() => handleVisibilityToggle(color.id)}
                    className="hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-md p-1 transition-all w-6 h-6 flex items-center justify-center"
                    style={{ color: textColor }}
                    title={isVisible ? "Hide color" : "Show color"}
                  >
                    <svg 
                      className="w-4 h-4" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {isVisible ? (
                        // Open eye icon
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      ) : (
                        // Closed eye icon with slash
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      )}
                    </svg>
                  </button>
                )}
                
                {/* Existing isolation control */}
                {onColorIsolate && (
                  <button
                    onClick={() => handleColorIsolate(color.id)}
                    // ... existing isolation button code
                  />
                )}
              </div>
              
              {/* Rest of existing color item layout */}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### 4.2 Update Existing "Show All" Button Logic
The existing "Show All" button for isolation should be updated to handle both isolation and visibility states appropriately.

## Phase 5: Integration Testing

### 5.1 Backwards Compatibility Testing
- [ ] Verify existing shared URLs without visibility data work correctly
- [ ] Confirm colors default to visible when no visibility property is present
- [ ] Test that old URLs load properly with all colors visible

### 5.2 Feature Interaction Testing
- [ ] Test visibility toggle with color isolation feature
- [ ] Verify visibility works with all lighting conditions
- [ ] Confirm RAL colors maintain metadata when toggled
- [ ] Test visibility with temporary color editing
- [ ] Verify density calculations update correctly for hidden colors

### 5.3 URL State Testing
- [ ] Test that visibility state persists in shared URLs
- [ ] Verify URL updates properly when visibility changes
- [ ] Confirm debounced URL updates work with visibility toggles
- [ ] Test browser back/forward navigation with visibility state

### 5.4 UI/UX Testing
- [ ] Verify eye icons display correctly in both themes
- [ ] Test hover states and visual feedback
- [ ] Confirm hidden colors show appropriate visual treatment
- [ ] Test bulk "Show All" / "Hide All" functionality
- [ ] Verify tooltip text is accurate for visibility states

## Implementation Benefits

### User Experience
- ✅ **Non-destructive workflow**: Colors remain in palette but can be excluded from visualization
- ✅ **Quick iteration**: Rapidly test different color combinations without losing work
- ✅ **Shareable states**: Share specific color combinations via URL
- ✅ **Visual clarity**: Clear eye icon metaphor for visibility state

### Technical Architecture
- ✅ **Backwards compatible**: Existing shared URLs continue to work
- ✅ **Minimal performance impact**: Filtering happens at render time
- ✅ **Consistent with existing patterns**: Follows established state management
- ✅ **URL-first approach**: State persistence through URL parameters

### Professional Workflow
- ✅ **Design exploration**: Test multiple color variations efficiently
- ✅ **Client presentations**: Show different options without rebuilding
- ✅ **Iterative refinement**: Hide colors temporarily while preserving work
- ✅ **Composition control**: Fine-tune color presence in final visualization

## Future Enhancement Opportunities

1. **Color Groups**: Group related colors for bulk visibility control
2. **Visibility Presets**: Save and restore specific visibility combinations
3. **Animation**: Smooth transitions when toggling visibility
4. **Keyboard Shortcuts**: Quick visibility toggles via keyboard
5. **Advanced Filtering**: Filter by color properties (density, RAL status, etc.)

This implementation provides a solid foundation for advanced color management while maintaining the application's core design principles of simplicity, performance, and user-focused design.