# Colorway Designer

A React-based web application for designing and visualizing plastic sheet color patterns using Voronoi diagrams.

## Overview

This application allows users to create color palettes and visualize how they would appear when mixed as plastic sheets using Voronoi tessellation. Each color has a density value that affects its probability of appearing in the visualization.

## Key Features

- **Color Palette Management**: Add, edit, and remove colors with density weights
- **Real-time Color Editing**: Compact popup color picker with 2D color picker, RGB/HSB inputs, and hex validation
- **Voronoi Visualization**: Dynamic visualization showing how colors would appear when mixed
- **Persistent Structure**: Cell patterns remain consistent during color editing
- **Adaptive UI**: Full background colors with automatic text contrast adjustment
- **URL Sharing**: Share colorways via URL parameters

## Technical Stack

- **React 18** with TypeScript
- **Vite** for build system
- **Tailwind CSS** for styling
- **D3-Delaunay** for Voronoi diagram generation
- **Canvas API** for rendering

## Key Components

### `VoronoiVisualization.tsx`
- Renders the main Voronoi diagram using Canvas
- Maintains persistent cell structure using seeded random generation
- Supports scale adjustment (0.1-4.0) mapping to 100-10000 cells
- Regenerates patterns only when explicitly requested

### `ColorPalette.tsx`
- Displays color list with full background colors and adaptive text
- Handles color editing via compact popup
- Shows density values and probability percentages
- Supports real-time color preview during editing

### `CompactColorPicker.tsx`
- Positioned popup color editor
- 2D color picker with hue slider
- RGB and HSB input fields with real-time conversion
- Smart positioning with viewport boundary detection

### `ColorPicker2D.tsx`
- Canvas-based 2D color picker for saturation/brightness selection
- Pointer and keyboard navigation support
- Real-time color generation in HSB color space

## Utilities

### `colorUtils.ts`
- Color space conversions (RGB, HSB, Hex)
- WCAG 2.1 contrast calculations for text readability
- Weighted random color selection with density support
- Seeded random color selection for consistent results

### `voronoiUtils.ts`
- Seeded point generation for consistent cell patterns
- Voronoi rendering with gap elimination
- Performance optimizations for high cell counts

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint code
npm run lint
```

## Color Management

Colors are stored with the following structure:
```typescript
interface Color {
  id: string;
  hex: string;      // #RRGGBB format
  density: number;  // Weight for probability calculation
}
```

## Voronoi Rendering

The Voronoi visualization uses seeded random generation to ensure:
- Consistent cell positions across color changes
- Deterministic color assignment per cell
- Proper density-weighted color distribution

## URL Sharing

Colors can be shared via URL parameters:
- `colors`: Base64-encoded array of color objects
- Automatically loads shared palettes on page load

## Performance Considerations

- Canvas rendering optimized for up to 10,000 cells
- Seeded random generation for consistent performance
- Polygon expansion to eliminate visual gaps
- Conditional image smoothing based on cell density

## Testing

Test the application by:
1. Adding multiple colors with different densities
2. Editing colors and verifying consistent cell patterns
3. Adjusting scale to test performance with different cell counts
4. Sharing URLs to test persistence

## State Management Architecture

### Temporary Color System
The application uses a sophisticated temporary color state system to enable real-time color editing:

```typescript
// App.tsx state
const [temporaryColorId, setTemporaryColorId] = useState<string | null>(null);
const [temporaryColorHex, setTemporaryColorHex] = useState<string | null>(null);
```

**How it works:**
1. When a color is being edited, `temporaryColorId` identifies which color is being modified
2. `temporaryColorHex` stores the temporary color value during editing
3. The visualization immediately reflects temporary changes without modifying the permanent palette
4. Changes are committed to the permanent state only when the color picker is closed

### State Flow
```
User edits color → onTemporaryColorChange → Temporary state updated → 
Visualization re-renders → User closes picker → onColorChange → 
Permanent state updated → Temporary state cleared
```

### Visualization Colors
The `VoronoiVisualization` component receives processed colors:
```typescript
const visualizationColors = colors.map(color => 
  color.id === temporaryColorId && temporaryColorHex
    ? { ...color, hex: temporaryColorHex }
    : color
);
```

This ensures the visualization always shows the most current color state without disrupting the permanent palette.

## URL State Management Deep Dive

### Encoding Process
Colors are encoded using Base64 to create shareable URLs:

```typescript
// 1. Strip IDs from colors (only hex and density needed)
const serializableColors = colors.map(({ hex, density }) => ({ hex, density }));

// 2. JSON stringify and Base64 encode
const colorsJson = JSON.stringify(serializableColors);
const encodedColors = btoa(colorsJson);

// 3. Add to URL parameters
params.set('colors', encodedColors);
```

### URL Format
```
https://example.com/colorway-designer/?colors=W3siaGV4IjoiI0ZGMDAwMCIsImRlbnNpdHkiOjEuNX1d&scale=2.5
```

### Debouncing Strategy
URL updates are debounced (300ms) to prevent excessive browser history entries:
```typescript
const debouncedUpdateURL = useRef(
  debounce((colors: Color[], scale: number) => {
    if (!isUpdatingFromURL.current) {
      updateURL(colors, scale);
    }
  }, 300)
).current;
```

### Browser History Management
- Uses `replaceState` instead of `pushState` to avoid cluttering history
- Handles browser back/forward navigation with `popstate` event
- Prevents circular updates with `isUpdatingFromURL` flag

## Seeded Random Generation Technical Details

### Linear Congruential Generator (LCG)
The application uses a custom LCG for deterministic randomness:

```typescript
const createSeededRandom = (seed: number): (() => number) => {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % 4294967296;
    return current / 4294967296;
  };
};
```

**Parameters:**
- Multiplier: 1664525 (commonly used in LCGs)
- Increment: 1013904223
- Modulus: 2^32 (4294967296)

### Two-Level Seeding
1. **Point Generation**: Uses base seed to generate consistent cell positions
2. **Color Assignment**: Uses `seed + cellIndex` to ensure each cell gets deterministic color

```typescript
// Point generation (consistent positions)
const points = generateSeededPoints(cellCount, width, height, seed);

// Color assignment (consistent per cell)
const cellSeed = seed + i;
const randomColor = getSeededRandomColor(colors, cellSeed);
```

### Why Seeded Randomness Matters
- **Persistent Structure**: Cell patterns remain identical during color editing
- **Deterministic Results**: Same seed always produces same output
- **Predictable Behavior**: Users can edit colors without losing their preferred pattern

## Color Picker Architecture

### Popup Positioning Algorithm
The `CompactColorPicker` uses smart positioning to stay within viewport:

```typescript
const calculatePosition = () => {
  const anchorRect = anchorElement.getBoundingClientRect();
  const popupRect = popupRef.current!.getBoundingClientRect();
  
  // Default: below anchor with 8px gap
  let top = anchorRect.bottom + scrollY + 8;
  let left = anchorRect.left + scrollX;
  
  // Adjust for right edge overflow
  if (left + popupRect.width > viewportWidth + scrollX) {
    left = anchorRect.right + scrollX - popupRect.width;
  }
  
  // Adjust for bottom edge overflow (position above)
  if (top + popupRect.height > viewportHeight + scrollY) {
    top = anchorRect.top + scrollY - popupRect.height - 8;
  }
  
  // Ensure minimum margins
  left = Math.max(scrollX + 8, left);
  top = Math.max(scrollY + 8, top);
};
```

### Real-time Color Conversion
The color picker maintains synchronized RGB, HSB, and Hex values:

```typescript
// RGB input changes
const handleRgbChange = (field: 'r' | 'g' | 'b', value: string) => {
  const newRgb = { ...rgbValues, [field]: clampedValue };
  setRgbValues(newRgb);
  
  // Convert to other formats
  const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  setHsbValues(hexToHsb(hex));
  updateColor(hex);
};
```

### 2D Color Picker Implementation
- Uses HTML Canvas for interactive color selection
- Draws saturation-brightness square based on current hue
- Handles mouse/touch events for smooth interaction
- Updates parent component via callback with saturation/brightness values

## Performance & Canvas Optimizations

### Cell Count Scaling
Cell count scales exponentially with the scale parameter:
```typescript
const cellCount = Math.round(
  minCells + (scale - minScale) * (maxCells - minCells) / (maxScale - minScale)
);
// Scale 0.1 → 100 cells
// Scale 4.0 → 10,000 cells
```

### Canvas Rendering Optimizations
1. **Polygon Expansion**: Eliminates visual gaps between cells
   ```typescript
   const expandPolygon = (polygon, expansionFactor) => {
     // Expand each vertex away from centroid
     return polygon.map(([x, y]) => {
       const dx = x - centerX;
       const dy = y - centerY;
       return [centerX + dx * (1 + expansionFactor), centerY + dy * (1 + expansionFactor)];
     });
   };
   ```

2. **Coordinate Rounding**: Prevents subpixel rendering artifacts
   ```typescript
   ctx.moveTo(Math.round(finalPolygon[0][0]), Math.round(finalPolygon[0][1]));
   ```

3. **Conditional Image Smoothing**: Disabled for high cell counts (≥8000)
   ```typescript
   if (cellCount >= 8000) {
     ctx.imageSmoothingEnabled = false;
   }
   ```

### Memory Management
- Canvas is cleared and redrawn on each update
- Points are cached to avoid regeneration during color changes
- Polygon expansion factor scales with cell density

## Configuration & Deployment

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/colorway-designer/', // Important for GitHub Pages deployment
})
```

### Build Process
```bash
# TypeScript compilation + Vite build
npm run build

# Outputs to dist/ directory
# Ready for static hosting (GitHub Pages, Netlify, etc.)
```

### Deployment Considerations
- Base path configured for GitHub Pages deployment
- All assets use relative paths
- No server-side rendering required (pure client-side app)
- URL sharing works with query parameters

## Reference Data

### Plastics Color Lookup (`ref/plastics-to-hex-lookup.csv`)
Contains real-world plastic color mappings:
```csv
Pantone Plastics Code,Hex Code
Q758-1-4,d0cdc5
Q722-3-3,afbfc8
Q740-1-5,dbe3df
```

**Usage:**
- Reference for real-world plastic colors
- Can be used to populate color palettes with industry-standard colors
- Pantone codes provide professional color matching

## Complete Type Definitions

### Core Types (`src/types/index.ts`)
```typescript
export interface Color {
  id: string;        // Unique identifier (generated)
  hex: string;       // #RRGGBB format (uppercase)
  name?: string;     // Optional display name
  density: number;   // Weight for probability (≥0)
}

export interface ColorPalette {
  colors: Color[];     // Array of colors (max 10)
  maxColors: number;   // Maximum allowed colors
}

export interface VoronoiCell {
  x: number;          // Cell center X coordinate
  y: number;          // Cell center Y coordinate
  color: string;      // Hex color for this cell
}
```

### Component Props
```typescript
interface VoronoiVisualizationProps {
  colors: Color[];           // Colors to visualize
  width?: number;           // Canvas width (default: 600)
  height?: number;          // Canvas height (default: 600)
  scale?: number;           // Scale factor 0.1-4.0 (default: 1.0)
}

interface CompactColorPickerProps {
  color: Color;                                    // Color being edited
  isOpen: boolean;                                // Visibility state
  anchorElement: HTMLElement | null;              // Reference for positioning
  onColorChange: (newHex: string) => void;        // Real-time color updates
  onClose: () => void;                           // Close callback
}
```

## Future Enhancements

Potential areas for improvement:
- Export functionality (PNG, SVG)
- Custom cell shapes beyond Voronoi
- Animation between color changes
- Batch color operations
- Advanced color harmony tools