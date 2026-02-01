#!/bin/bash

# Apply Social Media Migrations to Supabase
# This script runs the SQL migrations directly using the Supabase SQL Editor
# Copy and paste each SQL file content into Supabase Dashboard > SQL Editor

echo "🔧 Social Media Verification Migrations"
echo "========================================"
echo ""
echo "Please apply these migrations in your Supabase Dashboard:"
echo "https://supabase.com/dashboard/project/qazuurdubwpcpzpwjfwh/sql"
echo ""
echo "Run them in this order:"
echo ""
echo "1️⃣  20260201_add_social_media_to_profiles.sql"
echo "   - Adds social media URL columns to profiles table"
echo ""
echo "2️⃣  20260201_add_verified_status.sql"
echo "   - Adds verified status columns to profiles table"
echo ""
echo "3️⃣  20260201_create_social_verifications.sql"
echo "   - Creates social_verifications table with RLS policies"
echo ""
echo "📁 Migration files are located in: supabase/migrations/"
echo ""
echo "Or run them directly with psql if you have database access:"
echo ""
echo "psql \$DATABASE_URL < supabase/migrations/20260201_add_social_media_to_profiles.sql"
echo "psql \$DATABASE_URL < supabase/migrations/20260201_add_verified_status.sql"
echo "psql \$DATABASE_URL < supabase/migrations/20260201_create_social_verifications.sql"
echo ""
echo "After applying migrations, you can test at: http://localhost:3000/settings"
