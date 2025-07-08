import { Delaunay } from 'd3-delaunay';
import { Color, VoronoiCell } from '../types';
import { getRandomColor } from './colorUtils';

// Simple Linear Congruential Generator for consistent seeded randomness
const createSeededRandom = (seed: number): (() => number) => {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % 4294967296;
    return current / 4294967296;
  };
};

export const generateRandomPoints = (count: number, width: number, height: number): [number, number][] => {
  const points: [number, number][] = [];
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    points.push([x, y]);
  }
  
  return points;
};

export const generateSeededPoints = (
  count: number, 
  width: number, 
  height: number, 
  seed: number
): [number, number][] => {
  const random = createSeededRandom(seed);
  const points: [number, number][] = [];
  
  for (let i = 0; i < count; i++) {
    const x = random() * width;
    const y = random() * height;
    points.push([x, y]);
  }
  
  return points;
};

export const createVoronoiDiagram = (
  width: number,
  height: number,
  colors: Color[],
  cellCount: number = 100
): VoronoiCell[] => {
  if (colors.length === 0) {
    return [];
  }
  
  const points = generateRandomPoints(cellCount, width, height);
  const cells: VoronoiCell[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    const randomColor = getRandomColor(colors);
    
    cells.push({
      x,
      y,
      color: randomColor.hex,
    });
  }
  
  return cells;
};

export const renderVoronoiToCanvas = (
  canvas: HTMLCanvasElement,
  preGeneratedPoints: [number, number][] | null,
  colors: Color[],
  cellCount: number = 100
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const { width, height } = canvas;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  if (colors.length === 0) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    return;
  }
  
  // Use pre-generated points if available, otherwise generate new ones
  const points = preGeneratedPoints || generateRandomPoints(cellCount, width, height);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  
  // Configure canvas to prevent thin lines/borders
  ctx.lineWidth = 0;
  ctx.strokeStyle = 'transparent';
  
  // Disable smoothing for very high cell counts to prevent artifacts
  if (cellCount >= 8000) {
    ctx.imageSmoothingEnabled = false;
  } else {
    ctx.imageSmoothingEnabled = true;
  }
  
  // Helper function to expand polygon to eliminate gaps
  const expandPolygon = (polygon: [number, number][], expansionFactor: number): [number, number][] => {
    // Calculate centroid
    let centerX = 0, centerY = 0;
    for (const [x, y] of polygon) {
      centerX += x;
      centerY += y;
    }
    centerX /= polygon.length;
    centerY /= polygon.length;
    
    // Expand each vertex away from centroid
    return polygon.map(([x, y]) => {
      const dx = x - centerX;
      const dy = y - centerY;
      const expandedX = centerX + dx * (1 + expansionFactor);
      const expandedY = centerY + dy * (1 + expansionFactor);
      return [expandedX, expandedY] as [number, number];
    });
  };
  
  // Progressive expansion based on cell density
  // Expansion factor is 0.01 at 0 cells and 0.2 at 10000 cells
  let expansionFactor = (cellCount / 10000) * 0.2;
  
  // Render each cell
  for (let i = 0; i < points.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;
    
    const randomColor = getRandomColor(colors);
    
    ctx.fillStyle = randomColor.hex;
    ctx.beginPath();
    
    // Expand polygon if needed to eliminate gaps
    const finalPolygon = expansionFactor > 0 ? expandPolygon(cell, expansionFactor) : cell;
    
    // Round coordinates to prevent subpixel rendering artifacts
    ctx.moveTo(Math.round(finalPolygon[0][0]), Math.round(finalPolygon[0][1]));
    
    for (let j = 1; j < finalPolygon.length; j++) {
      ctx.lineTo(Math.round(finalPolygon[j][0]), Math.round(finalPolygon[j][1]));
    }
    
    ctx.closePath();
    ctx.fill();
  }
};