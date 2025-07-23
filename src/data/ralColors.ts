// RAL Colors data module
// Parses and provides searchable access to RAL color data

export interface RALColor {
  number: string;      // e.g., "000 15 00"
  hex: string;         // e.g., "#252626"
  name: string;        // e.g., "Ink black"
  searchTerms: string; // Pre-computed lowercase search terms for performance
}

// RAL colors data - will be loaded from CSV
let RAL_COLORS_DATA: RALColor[] = [];
let isDataLoaded = false;

// Load RAL colors from CSV file
async function loadRALColorsData(): Promise<RALColor[]> {
  if (isDataLoaded && RAL_COLORS_DATA.length > 0) {
    return RAL_COLORS_DATA;
  }

  try {
    // Import CSV data from the public directory
    const response = await fetch('/colorway-designer/ral_colors.csv');
    const csvText = await response.text();
    
    RAL_COLORS_DATA = parseRALColorsFromCSV(csvText);
    isDataLoaded = true;
    
    // Populate lookup maps after loading data
    populateLookupMaps();
    
    return RAL_COLORS_DATA;
  } catch (error) {
    console.error('Failed to load RAL colors data:', error);
    return [];
  }
}

// Parse CSV data into structured format
function parseRALColorsFromCSV(csvData: string): RALColor[] {
  const lines = csvData.trim().split('\n');
  const colors: RALColor[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line (simple parsing for this structured data)
    const [number, hex, name] = line.split(',');
    
    if (number && hex && name) {
      const formattedHex = `#${hex.toUpperCase()}`;
      const searchTerms = `${number} ${name}`.toLowerCase();
      
      colors.push({
        number: number.trim(),
        hex: formattedHex,
        name: name.trim(),
        searchTerms
      });
    }
  }
  
  return colors;
}

// Create lookup maps for fast access
let RAL_BY_NUMBER = new Map<string, RALColor>();
let RAL_BY_HEX = new Map<string, RALColor>();

// Populate lookup maps after data is loaded
function populateLookupMaps() {
  RAL_BY_NUMBER.clear();
  RAL_BY_HEX.clear();
  
  RAL_COLORS_DATA.forEach(color => {
    RAL_BY_NUMBER.set(color.number, color);
    RAL_BY_HEX.set(color.hex.toLowerCase(), color);
  });
}

// Export function to get all RAL colors (async)
export async function getRALColors(): Promise<RALColor[]> {
  return await loadRALColorsData();
}

// Search functions (async to ensure data is loaded)
export async function searchRALByNumber(query: string): Promise<RALColor[]> {
  await loadRALColorsData();
  
  if (!query.trim()) return [];
  
  const searchQuery = query.toLowerCase().replace(/\s+/g, '');
  const results: RALColor[] = [];
  
  for (const color of RAL_COLORS_DATA) {
    const numberNoSpaces = color.number.replace(/\s+/g, '').toLowerCase();
    
    // Exact match gets priority
    if (numberNoSpaces === searchQuery) {
      results.unshift(color);
    }
    // Partial match from start
    else if (numberNoSpaces.startsWith(searchQuery)) {
      results.push(color);
    }
  }
  
  return results.slice(0, 10); // Limit results
}

export async function searchRALByName(query: string): Promise<RALColor[]> {
  await loadRALColorsData();
  
  if (!query.trim()) return [];
  
  const searchQuery = query.toLowerCase();
  const results: RALColor[] = [];
  
  for (const color of RAL_COLORS_DATA) {
    const name = color.name.toLowerCase();
    
    // Exact word match gets priority
    if (name === searchQuery) {
      results.unshift(color);
    }
    // Word starts with query
    else if (name.startsWith(searchQuery)) {
      results.push(color);
    }
    // Contains query as whole word
    else if (name.includes(` ${searchQuery}`) || name.includes(`${searchQuery} `)) {
      results.push(color);
    }
    // Contains query anywhere
    else if (name.includes(searchQuery)) {
      results.push(color);
    }
  }
  
  return results.slice(0, 10); // Limit results
}

export async function getRALByNumber(number: string): Promise<RALColor | undefined> {
  await loadRALColorsData();
  return RAL_BY_NUMBER.get(number);
}

export async function getRALByHex(hex: string): Promise<RALColor | undefined> {
  await loadRALColorsData();
  return RAL_BY_HEX.get(hex.toLowerCase());
}

export async function isValidRALNumber(number: string): Promise<boolean> {
  await loadRALColorsData();
  return RAL_BY_NUMBER.has(number);
}

// Format RAL number for display (e.g., "000 15 00" -> "RAL 1500")
export function formatRALNumber(number: string): string {
  return `RAL ${number.replace(/\s+/g, '')}`;
}

// Parse user input RAL number (e.g., "1500" -> "000 15 00")
export function parseRALInput(input: string): string {
  const cleaned = input.replace(/[^0-9]/g, '');
  
  if (cleaned.length >= 4) {
    // Try to match format: first 3 digits, space, next 2 digits, space, last 2 digits
    const first3 = cleaned.substring(0, 3).padStart(3, '0');
    const next2 = cleaned.substring(3, 5).padStart(2, '0');
    const last2 = cleaned.substring(5, 7).padStart(2, '0');
    
    return `${first3} ${next2} ${last2}`;
  }
  
  return input;
}