export interface Color {
  id: string;
  hex: string;
  name?: string;
  density: number;
}

export interface ColorPalette {
  colors: Color[];
  maxColors: number;
}

export interface VoronoiCell {
  x: number;
  y: number;
  color: string;
}