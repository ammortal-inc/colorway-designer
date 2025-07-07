import { Delaunay } from 'd3-delaunay';
import { Color, VoronoiCell } from '../types';
import { getRandomColor } from './colorUtils';

export const generateRandomPoints = (count: number, width: number, height: number): [number, number][] => {
  const points: [number, number][] = [];
  
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
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
  _cells: VoronoiCell[],
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
  
  // Generate points and create Voronoi diagram
  const points = generateRandomPoints(cellCount, width, height);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  
  // Render each cell
  for (let i = 0; i < points.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;
    
    const randomColor = getRandomColor(colors);
    
    ctx.fillStyle = randomColor.hex;
    ctx.beginPath();
    ctx.moveTo(cell[0][0], cell[0][1]);
    
    for (let j = 1; j < cell.length; j++) {
      ctx.lineTo(cell[j][0], cell[j][1]);
    }
    
    ctx.closePath();
    ctx.fill();
  }
};