# RAL Color Selection Implementation Plan

## Overview
Add RAL color selection capability alongside the existing hex input, allowing users to search and select colors by RAL number or name with auto-complete functionality.

## Data Structure & Utilities

### 1. Create RAL Colors Data Module (`src/data/ralColors.ts`)
- Parse the CSV data (3000+ RAL colors) into a searchable format
- Structure: `{ number: string, hex: string, name: string }`
- Create indexed lookup functions for fast searching by number and name
- Export search utilities for auto-completion

### 2. Update Color Interface (`src/types/index.ts`)
- Add optional `ralNumber?: string` and `ralName?: string` to Color interface
- Maintain backward compatibility with existing hex-only colors

## UI Components

### 3. Enhanced Color Input Component (`src/components/RALColorPicker.tsx`)
- Replace existing `ColorPicker.tsx` with enhanced version
- **Three input modes**: Hex, RAL Number, RAL Name (tabbed interface)
- **Auto-complete functionality**: 
  - RAL Number: Shows matching numbers as user types (e.g., "1015" → "RAL 1015")
  - RAL Name: Shows matching names as user types (e.g., "beige" → "Light ivory beige")
- **Dropdown results**: Show RAL number, name, and color preview
- **Real-time validation**: Immediate feedback for valid/invalid inputs
- **Selection handling**: Convert RAL selection to hex + metadata

### 4. Auto-complete Dropdown Component (`src/components/RALDropdown.tsx`)
- Keyboard navigation (arrow keys, enter, escape)
- Click selection support
- Smart positioning to avoid viewport overflow
- Fuzzy search for partial matches
- Limit results (e.g., max 10 suggestions)

## Enhanced Color Display

### 5. Update ColorPalette Component
- Display RAL information when available: "RAL 3020 - Traffic Red (#CC0605)"
- Fall back to hex-only display for non-RAL colors
- Maintain existing editing functionality (CompactColorPicker remains hex-focused)

## Integration Points

### 6. Update Core Functions (`src/utils/colorUtils.ts`)
- Modify `createColor()` to accept optional RAL metadata
- Add RAL validation utilities
- Ensure URL state management includes RAL data

### 7. Search & Filter Logic (`src/utils/ralUtils.ts`)
- Fuzzy matching algorithm for name searches
- Exact and partial number matching
- Performance optimization with debounced searching
- Case-insensitive search functionality

## User Experience Enhancements

### 8. Input Mode Switching
- **Tab Interface**: "Hex" | "RAL Number" | "RAL Name"
- **Smart defaults**: Remember user's preferred input method
- **Cross-validation**: Show RAL info when valid hex matches known RAL color

### 9. Visual Improvements
- **Color previews** in dropdown results
- **Professional styling** matching existing design system
- **Loading states** for search operations
- **Error states** for invalid inputs

## Implementation Strategy

1. **Phase 1**: Data layer (RAL parsing, search utilities)
2. **Phase 2**: Core UI components (RAL picker, dropdown)
3. **Phase 3**: Integration (replace existing picker, update displays)
4. **Phase 4**: Polish (UX improvements, performance optimization)

## Files to Create/Modify

**New Files:**
- `src/data/ralColors.ts`
- `src/components/RALColorPicker.tsx`
- `src/components/RALDropdown.tsx` 
- `src/utils/ralUtils.ts`

**Modified Files:**
- `src/types/index.ts`
- `src/components/Sidebar.tsx`
- `src/components/ColorPalette.tsx`
- `src/utils/colorUtils.ts`

This implementation will provide professional RAL color selection while maintaining full backward compatibility with existing hex workflows.