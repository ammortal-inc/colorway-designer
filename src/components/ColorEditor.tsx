import React, { useState, useEffect, useCallback } from 'react';
import { Color } from '../types';
import { 
  hexToRgb, 
  rgbToHex, 
  hexToHsb, 
  hsbToHex, 
  rgbToHsb, 
  hsbToRgb,
  isValidHexColor,
  formatHexColor
} from '../utils/colorUtils';
import ColorPicker2D from './ColorPicker2D';

interface ColorEditorProps {
  color: Color;
  isOpen: boolean;
  onSave: (newHex: string) => void;
  onCancel: () => void;
}

const ColorEditor: React.FC<ColorEditorProps> = ({ color, isOpen, onSave, onCancel }) => {
  const [currentHex, setCurrentHex] = useState(color.hex);
  const [hexInput, setHexInput] = useState(color.hex);
  const [rgbValues, setRgbValues] = useState(() => hexToRgb(color.hex));
  const [hsbValues, setHsbValues] = useState(() => hexToHsb(color.hex));
  const [isHexValid, setIsHexValid] = useState(true);

  // Update all values when color prop changes
  useEffect(() => {
    setCurrentHex(color.hex);
    setHexInput(color.hex);
    setRgbValues(hexToRgb(color.hex));
    setHsbValues(hexToHsb(color.hex));
    setIsHexValid(true);
  }, [color.hex]);

  // Update all values when currentHex changes
  const updateFromHex = useCallback((hex: string) => {
    if (isValidHexColor(hex)) {
      setCurrentHex(hex);
      setRgbValues(hexToRgb(hex));
      setHsbValues(hexToHsb(hex));
      setIsHexValid(true);
    }
  }, []);

  // Handle hex input changes
  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    const formatted = formatHexColor(value);
    
    if (isValidHexColor(formatted)) {
      updateFromHex(formatted);
    } else {
      setIsHexValid(false);
    }
  }, [updateFromHex]);

  // Handle RGB input changes
  const handleRgbChange = useCallback((field: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgbValues, [field]: numValue };
    setRgbValues(newRgb);
    
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setCurrentHex(hex);
    setHexInput(hex);
    setHsbValues(rgbToHsb(newRgb.r, newRgb.g, newRgb.b));
    setIsHexValid(true);
  }, [rgbValues]);

  // Handle HSB input changes
  const handleHsbChange = useCallback((field: 'h' | 's' | 'b', value: string) => {
    const numValue = field === 'h' 
      ? Math.max(0, Math.min(360, parseInt(value) || 0))
      : Math.max(0, Math.min(100, parseInt(value) || 0));
    
    const newHsb = { ...hsbValues, [field]: numValue };
    setHsbValues(newHsb);
    
    const hex = hsbToHex(newHsb.h, newHsb.s, newHsb.b);
    setCurrentHex(hex);
    setHexInput(hex);
    setRgbValues(hsbToRgb(newHsb.h, newHsb.s, newHsb.b));
    setIsHexValid(true);
  }, [hsbValues]);

  // Handle 2D picker changes
  const handlePickerChange = useCallback((saturation: number, brightness: number) => {
    const newHsb = { ...hsbValues, s: saturation, b: brightness };
    setHsbValues(newHsb);
    
    const hex = hsbToHex(newHsb.h, newHsb.s, newHsb.b);
    setCurrentHex(hex);
    setHexInput(hex);
    setRgbValues(hsbToRgb(newHsb.h, newHsb.s, newHsb.b));
    setIsHexValid(true);
  }, [hsbValues]);

  // Handle hue slider changes
  const handleHueChange = useCallback((hue: number) => {
    const newHsb = { ...hsbValues, h: hue };
    setHsbValues(newHsb);
    
    const hex = hsbToHex(newHsb.h, newHsb.s, newHsb.b);
    setCurrentHex(hex);
    setHexInput(hex);
    setRgbValues(hsbToRgb(newHsb.h, newHsb.s, newHsb.b));
    setIsHexValid(true);
  }, [hsbValues]);

  // Handle save
  const handleSave = useCallback(() => {
    if (isHexValid && currentHex !== color.hex) {
      onSave(currentHex);
    }
    onCancel();
  }, [isHexValid, currentHex, color.hex, onSave, onCancel]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, handleSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Edit Color</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Color Preview */}
          <div className="mb-6">
            <div className="flex gap-4 mb-2">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">Before</div>
                <div 
                  className="w-full h-16 rounded border border-gray-300"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-xs text-gray-500 mt-1 font-mono">{color.hex}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">After</div>
                <div 
                  className="w-full h-16 rounded border border-gray-300"
                  style={{ backgroundColor: currentHex }}
                />
                <div className="text-xs text-gray-500 mt-1 font-mono">{currentHex}</div>
              </div>
            </div>
          </div>

          {/* 2D Color Picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Picker
            </label>
            <div className="flex gap-4 items-start">
              <ColorPicker2D
                hue={hsbValues.h}
                saturation={hsbValues.s}
                brightness={hsbValues.b}
                onChange={handlePickerChange}
                size={200}
              />
              
              {/* Hue Slider */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-600">Hue</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsbValues.h}
                  onChange={(e) => handleHueChange(parseInt(e.target.value))}
                  className="w-32 h-6 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                  }}
                />
                <div className="text-xs text-gray-500 text-center">{hsbValues.h}°</div>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            {/* Hex Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hex
              </label>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm font-mono ${
                  isHexValid 
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                    : 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                }`}
                placeholder="#FF0000"
              />
              {!isHexValid && (
                <div className="text-red-500 text-xs mt-1">Invalid hex color</div>
              )}
            </div>

            {/* RGB Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RGB
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="R"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">R</div>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="G"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">G</div>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="B"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">B</div>
                </div>
              </div>
            </div>

            {/* HSB Inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HSB
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hsbValues.h}
                    onChange={(e) => handleHsbChange('h', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="H"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">H</div>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsbValues.s}
                    onChange={(e) => handleHsbChange('s', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="S"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">S</div>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsbValues.b}
                    onChange={(e) => handleHsbChange('b', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="B"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">B</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={!isHexValid}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorEditor;