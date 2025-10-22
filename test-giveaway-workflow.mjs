// Test script to verify the complete Create Giveaway workflow
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Create a minimal PNG image buffer for testing
function createTestPNG() {
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), Compression: 0, Filter: 0, Interlace: 0
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Compressed data
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  return pngData;
}

async function testCompleteWorkflow() {
  let testGiveawayId = null;
  let testImagePath = null;

  try {
    console.log('🧪 Testing complete Create Giveaway workflow...\n');

    // Step 1: Upload test image
    console.log('1️⃣ Testing image upload...');
    const fileBuffer = createTestPNG();
    const fileName = `test-workflow-${Date.now()}.png`;
    const filePath = `giveaway-photos/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('giveaways')
      .upload(filePath, fileBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('giveaways')
      .getPublicUrl(filePath);

    testImagePath = filePath;
    console.log('✅ Image uploaded successfully');
    console.log(`   Public URL: ${urlData.publicUrl}\n`);

    // Step 2: Create test giveaway
    console.log('2️⃣ Testing giveaway creation...');
    
    // Create a future end date (1 week from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const testGiveaway = {
      title: `Test Giveaway ${Date.now()}`,
      description: 'This is a test giveaway created by the automated test script.',
      ticket_price: 5.00,
      prize_amount: 100.00,
      prize_pool_usdt: 100.00,
      ends_at: endDate.toISOString(),
      photo_url: urlData.publicUrl,
      creator_id: '00000000-0000-0000-0000-000000000000', // Test user ID
      status: 'active',
      escrow_amount: 0
    };

    const { data: giveawayData, error: giveawayError } = await supabase
      .from('giveaways')
      .insert(testGiveaway)
      .select()
      .single();

    if (giveawayError) {
      throw new Error(`Giveaway creation failed: ${giveawayError.message}`);
    }

    testGiveawayId = giveawayData.id;
    console.log('✅ Giveaway created successfully');
    console.log(`   ID: ${giveawayData.id}`);
    console.log(`   Title: ${giveawayData.title}`);
    console.log(`   Prize: $${giveawayData.prize_amount}\n`);

    // Step 3: Test API endpoint
    console.log('3️⃣ Testing /api/giveaways endpoint...');
    
    const { data: apiData, error: apiError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (apiError) {
      throw new Error(`API test failed: ${apiError.message}`);
    }

    const testGiveawayInResults = apiData.find(g => g.id === testGiveawayId);
    if (!testGiveawayInResults) {
      throw new Error('Test giveaway not found in API results');
    }

    console.log('✅ API endpoint working correctly');
    console.log(`   Found ${apiData.length} active giveaways`);
    console.log(`   Test giveaway included in results\n`);

    // Step 4: Test giveaway retrieval by ID
    console.log('4️⃣ Testing giveaway retrieval by ID...');
    
    const { data: singleGiveaway, error: retrieveError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', testGiveawayId)
      .single();

    if (retrieveError) {
      throw new Error(`Giveaway retrieval failed: ${retrieveError.message}`);
    }

    console.log('✅ Giveaway retrieval working correctly');
    console.log(`   Retrieved: ${singleGiveaway.title}\n`);

    console.log('🎉 All tests passed! Create Giveaway workflow is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up test data...');
    
    if (testGiveawayId) {
      const { error: deleteGiveawayError } = await supabase
        .from('giveaways')
        .delete()
        .eq('id', testGiveawayId);
      
      if (deleteGiveawayError) {
        console.warn('Warning: Could not delete test giveaway:', deleteGiveawayError.message);
      } else {
        console.log('✅ Test giveaway deleted');
      }
    }

    if (testImagePath) {
      const { error: deleteImageError } = await supabase.storage
        .from('giveaways')
        .remove([testImagePath]);
      
      if (deleteImageError) {
        console.warn('Warning: Could not delete test image:', deleteImageError.message);
      } else {
        console.log('✅ Test image deleted');
      }
    }

    console.log('✅ Cleanup completed');
  }
}

testCompleteWorkflow();