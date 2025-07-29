export interface Color {
  id: string;
  hex: string;
  name?: string;
  density: number;
  // RAL color metadata (optional)
  ralNumber?: string;  // e.g., "000 15 00"
  ralName?: string;    // e.g., "Ink black"
  visible?: boolean;   // Visibility toggle (defaults to true)
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

// RAL Color Picker component types
export interface RALColorPickerProps {
  value: string;
  onColorChange: (hex: string, ralData?: { number: string; name: string }) => void;
  onClose?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface RALDropdownProps {
  results: import('../data/ralColors').RALColor[];
  selectedIndex: number;
  onSelect: (ralColor: import('../data/ralColors').RALColor) => void;
  onClose: () => void;
  isLoading?: boolean;
  searchTerm?: string;
  maxHeight?: number;
}

export type RALTabType = 'hex' | 'number' | 'name';