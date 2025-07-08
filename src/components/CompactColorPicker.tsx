import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color } from '../types';
import { 
  hexToHsb, 
  hsbToHex,
  hexToRgb,
  rgbToHex,
  isValidHexColor,
  formatHexColor
} from '../utils/colorUtils';
import ColorPicker2D from './ColorPicker2D';

interface CompactColorPickerProps {
  color: Color;
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  onColorChange: (newHex: string) => void;
  onClose: () => void;
}

interface Position {
  top: number;
  left: number;
}

const CompactColorPicker: React.FC<CompactColorPickerProps> = ({ 
  color, 
  isOpen, 
  anchorElement,
  onColorChange, 
  onClose 
}) => {
  const [hexInput, setHexInput] = useState(color.hex);
  const [hsbValues, setHsbValues] = useState(() => hexToHsb(color.hex));
  const [rgbValues, setRgbValues] = useState(() => hexToRgb(color.hex));
  const [isHexValid, setIsHexValid] = useState(true);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  // Update values when color prop changes
  useEffect(() => {
    setHexInput(color.hex);
    setHsbValues(hexToHsb(color.hex));
    setRgbValues(hexToRgb(color.hex));
    setIsHexValid(true);
  }, [color.hex]);

  // Calculate position when anchor element or open state changes
  useEffect(() => {
    if (!isOpen || !anchorElement || !popupRef.current) return;

    const calculatePosition = () => {
      const anchorRect = anchorElement.getBoundingClientRect();
      const popupRect = popupRef.current!.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let top = anchorRect.bottom + scrollY + 8; // 8px gap below anchor
      let left = anchorRect.left + scrollX;

      // Adjust if popup would go off the right edge
      if (left + popupRect.width > viewportWidth + scrollX) {
        left = anchorRect.right + scrollX - popupRect.width;
      }

      // Adjust if popup would go off the left edge
      if (left < scrollX) {
        left = scrollX + 8;
      }

      // If popup would go below viewport, position above anchor
      if (top + popupRect.height > viewportHeight + scrollY) {
        top = anchorRect.top + scrollY - popupRect.height - 8;
      }

      // Ensure popup doesn't go above viewport
      if (top < scrollY) {
        top = scrollY + 8;
      }

      setPosition({ top, left });
    };

    // Small delay to ensure popup is rendered before calculating position
    const timeoutId = setTimeout(calculatePosition, 0);
    
    // Recalculate on window resize/scroll
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isOpen, anchorElement]);

  // Update color and notify parent in real-time
  const updateColor = useCallback((hex: string) => {
    setHexInput(hex);
    setRgbValues(hexToRgb(hex));
    onColorChange(hex);
  }, [onColorChange]);

  // Handle hex input changes
  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    const formatted = formatHexColor(value);
    
    if (isValidHexColor(formatted)) {
      setHsbValues(hexToHsb(formatted));
      setRgbValues(hexToRgb(formatted));
      updateColor(formatted);
      setIsHexValid(true);
    } else {
      setIsHexValid(false);
    }
  }, [updateColor]);

  // Handle 2D picker changes
  const handlePickerChange = useCallback((saturation: number, brightness: number) => {
    const newHsb = { ...hsbValues, s: saturation, b: brightness };
    setHsbValues(newHsb);
    
    const hex = hsbToHex(newHsb.h, newHsb.s, newHsb.b);
    setRgbValues(hexToRgb(hex));
    updateColor(hex);
    setIsHexValid(true);
  }, [hsbValues, updateColor]);

  // Handle hue slider changes
  const handleHueChange = useCallback((hue: number) => {
    const newHsb = { ...hsbValues, h: hue };
    setHsbValues(newHsb);
    
    const hex = hsbToHex(newHsb.h, newHsb.s, newHsb.b);
    setRgbValues(hexToRgb(hex));
    updateColor(hex);
    setIsHexValid(true);
  }, [hsbValues, updateColor]);

  // Handle RGB input changes
  const handleRgbChange = useCallback((field: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgbValues, [field]: numValue };
    setRgbValues(newRgb);
    
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHsbValues(hexToHsb(hex));
    updateColor(hex);
    setIsHexValid(true);
  }, [rgbValues, updateColor]);

  // Handle HSB input changes
  const handleHsbChange = useCallback((field: 'h' | 's' | 'b', value: string) => {
    const numValue = field === 'h' 
      ? Math.max(0, Math.min(360, parseInt(value) || 0))
      : Math.max(0, Math.min(100, parseInt(value) || 0));
    
    const newHsb = { ...hsbValues, [field]: numValue };
    setHsbValues(newHsb);
    
    const hex = hsbToHex(newHsb.h, newHsb.s, newHsb.b);
    setRgbValues(hexToRgb(hex));
    updateColor(hex);
    setIsHexValid(true);
  }, [hsbValues, updateColor]);

  // Handle hue slider interactions
  const handleHueSliderInteraction = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hueSliderRef.current) return;
    
    const rect = hueSliderRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, y / rect.height));
    const hue = Math.round(percentage * 360);
    handleHueChange(hue);
  }, [handleHueChange]);

  // Handle mouse events for hue slider dragging
  useEffect(() => {
    if (!isDraggingHue) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hueSliderRef.current) return;
      
      const rect = hueSliderRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = Math.max(0, Math.min(1, y / rect.height));
      const hue = Math.round(percentage * 360);
      handleHueChange(hue);
    };

    const handleMouseUp = () => {
      setIsDraggingHue(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHue, handleHueChange]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-300 dark:border-neutral-600 p-4 z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '400px'
      }}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Edit Color</div>
        <button
          onClick={onClose}
          className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Color picker and hue slider */}
      <div className="mb-3">
        <div className="flex gap-3 items-start">
          <ColorPicker2D
            hue={hsbValues.h}
            saturation={hsbValues.s}
            brightness={hsbValues.b}
            onChange={handlePickerChange}
            size={120}
          />
          
          {/* Vertical hue slider */}
          <div className="flex flex-col items-center">
            <div 
              ref={hueSliderRef}
              className="w-4 h-[120px] rounded cursor-pointer relative border border-neutral-300 dark:border-neutral-600"
              style={{
                background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
              onMouseDown={(e) => {
                setIsDraggingHue(true);
                handleHueSliderInteraction(e);
              }}
              onClick={handleHueSliderInteraction}
            >
              {/* Hue indicator */}
              <div
                className="absolute w-4 h-2 bg-white border border-neutral-600 dark:border-neutral-700 rounded-sm shadow-md pointer-events-none"
                style={{
                  top: `${(hsbValues.h / 360) * 100}%`,
                  left: '0px',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
          </div>

          {/* RGB and HSB inputs */}
          <div className="flex gap-3">
            {/* RGB Inputs */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">RGB</label>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 w-3">R</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                    className="w-16 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 w-3">G</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                    className="w-16 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 w-3">B</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                    className="w-16 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>

            {/* HSB Inputs */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">HSB</label>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 w-3">H</span>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hsbValues.h}
                    onChange={(e) => handleHsbChange('h', e.target.value)}
                    className="w-16 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 w-3">S</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsbValues.s}
                    onChange={(e) => handleHsbChange('s', e.target.value)}
                    className="w-16 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 w-3">B</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsbValues.b}
                    onChange={(e) => handleHsbChange('b', e.target.value)}
                    className="w-16 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hex input */}
      <div>
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Hex Color
        </label>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          className={`w-full px-2 py-1 border rounded text-sm font-mono bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 ${
            isHexValid 
              ? 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
              : 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
          }`}
          placeholder="#FF0000"
        />
        {!isHexValid && (
          <div className="text-red-500 dark:text-red-400 text-xs mt-1">Invalid hex color</div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
        Click outside or press Escape to close
      </div>
    </div>
  );
};

export default CompactColorPicker;