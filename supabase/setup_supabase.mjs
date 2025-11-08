// This script will help set up Supabase tables and mock profiles
// Run this with: node supabase/setup_supabase.mjs

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up Supabase database...');

    // Read SQL files
    const profilesTableSQL = fs.readFileSync(path.resolve(__dirname, 'profiles_table.sql'), 'utf8');
    const mockProfilesSQL = fs.readFileSync(path.resolve(__dirname, 'mock_profiles.sql'), 'utf8');

    // Execute SQL to create profiles table
    console.log('Creating profiles table...');
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: profilesTableSQL });

    if (tableError) {
      console.error('Error creating profiles table:', tableError);
    } else {
      console.log('Profiles table created successfully!');
    }

    // Execute SQL to insert mock profiles
    console.log('Inserting mock profiles...');
    const { error: mockError } = await supabase.rpc('exec_sql', { sql: mockProfilesSQL });

    if (mockError) {
      console.error('Error inserting mock profiles:', mockError);
    } else {
      console.log('Mock profiles inserted successfully!');
    }

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();