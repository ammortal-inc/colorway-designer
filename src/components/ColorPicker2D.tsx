import React, { useRef, useEffect, useState, useCallback } from 'react';
import { hsbToRgb } from '../utils/colorUtils';

interface ColorPicker2DProps {
  hue: number;
  saturation: number;
  brightness: number;
  onChange: (saturation: number, brightness: number) => void;
  size?: number;
}

const ColorPicker2D: React.FC<ColorPicker2DProps> = ({
  hue,
  saturation,
  brightness,
  onChange,
  size = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate the 2D color gradient
  const generateGradient = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const s = (x / size) * 100; // Saturation increases left to right
        const b = ((size - y) / size) * 100; // Brightness increases bottom to top
        
        const { r, g, b: blue } = hsbToRgb(hue, s, b);
        const index = (y * size + x) * 4;
        
        data[index] = r;     // Red
        data[index + 1] = g; // Green
        data[index + 2] = blue; // Blue
        data[index + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [hue, size]);

  // Update gradient when hue changes
  useEffect(() => {
    generateGradient();
  }, [generateGradient]);

  // Convert saturation/brightness to canvas coordinates
  const getPickerPosition = useCallback(() => {
    const x = (saturation / 100) * size;
    const y = size - (brightness / 100) * size;
    return { x, y };
  }, [saturation, brightness, size]);

  // Convert canvas coordinates to saturation/brightness
  const getColorFromPosition = useCallback((x: number, y: number) => {
    const s = Math.max(0, Math.min(100, (x / size) * 100));
    const b = Math.max(0, Math.min(100, ((size - y) / size) * 100));
    return { s, b };
  }, [size]);

  // Handle mouse/touch events
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { s, b } = getColorFromPosition(x, y);
    onChange(s, b);
    setIsDragging(true);
    e.preventDefault();
  }, [getColorFromPosition, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { s, b } = getColorFromPosition(x, y);
    onChange(s, b);
    e.preventDefault();
  }, [isDragging, getColorFromPosition, onChange]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    let newS = saturation;
    let newB = brightness;

    switch (e.key) {
      case 'ArrowLeft':
        newS = Math.max(0, saturation - step);
        break;
      case 'ArrowRight':
        newS = Math.min(100, saturation + step);
        break;
      case 'ArrowUp':
        newB = Math.min(100, brightness + step);
        break;
      case 'ArrowDown':
        newB = Math.max(0, brightness - step);
        break;
      default:
        return;
    }

    onChange(newS, newB);
    e.preventDefault();
  }, [saturation, brightness, onChange]);

  const { x, y } = getPickerPosition();

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border border-neutral-300 rounded cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Color picker"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={saturation}
        aria-valuetext={`Saturation ${saturation}%, Brightness ${brightness}%`}
      />
      
      {/* Picker dot */}
      <div
        className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  );
};

export default ColorPicker2D;