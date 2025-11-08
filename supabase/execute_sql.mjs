// Script to execute SQL against Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    // Get SQL file path from command line argument or use default
    const sqlFileName = process.argv[2] || 'mock_users.sql';
    const sqlFilePath = path.isAbsolute(sqlFileName) 
      ? sqlFileName 
      : path.join(__dirname, '..', sqlFileName);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim() !== '');

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim() + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}`);

      const { error } = await supabase.rpc('exec_sql', { query: stmt });

      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }

    console.log('All SQL statements executed');
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSQL();