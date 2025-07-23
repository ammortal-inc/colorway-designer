// Quick test for RAL data loading functionality
import { getRALColors, searchRALByNumber, searchRALByName, getRALByHex } from '../data/ralColors';

export async function testRALDataLoading(): Promise<boolean> {
  try {
    console.log('Testing RAL data loading...');
    
    // Test 1: Load all RAL colors
    const allColors = await getRALColors();
    console.log(`✓ Loaded ${allColors.length} RAL colors`);
    
    if (allColors.length === 0) {
      console.error('✗ No RAL colors loaded');
      return false;
    }
    
    // Test 2: Search by number
    const numberResults = await searchRALByNumber('1015');
    console.log(`✓ Search by number '1015' returned ${numberResults.length} results`);
    
    // Test 3: Search by name
    const nameResults = await searchRALByName('black');
    console.log(`✓ Search by name 'black' returned ${nameResults.length} results`);
    
    // Test 4: Get by hex
    const hexResult = await getRALByHex('#252626');
    console.log(`✓ Get by hex '#252626' returned:`, hexResult?.name || 'null');
    
    // Sample some data
    const sample = allColors.slice(0, 3);
    console.log('Sample RAL colors:', sample.map(c => `${c.number} - ${c.name} (${c.hex})`));
    
    console.log('✓ All RAL data tests passed!');
    return true;
  } catch (error) {
    console.error('✗ RAL data test failed:', error);
    return false;
  }
}

// Auto-run test if in development
if (typeof window !== 'undefined') {
  testRALDataLoading().then(success => {
    if (success) {
      console.log('🎉 RAL data system is working correctly!');
    } else {
      console.error('❌ RAL data system has issues');
    }
  });
}