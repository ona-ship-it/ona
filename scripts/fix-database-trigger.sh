#!/bin/bash
# Quick fix script for "Database error saving new user"
# This script applies the corrected trigger migration

set -e

echo "🔧 Fixing Database Trigger Schema Issue"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/migrations/20250123_fix_trigger_schema.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "✓ Supabase CLI found"
    echo ""
    echo "Choose deployment method:"
    echo "1) Local development (supabase start must be running)"
    echo "2) Remote/Production (requires linking to Supabase project)"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            echo ""
            echo "📦 Applying migration to local Supabase..."
            supabase db push
            echo ""
            echo "✅ Migration applied to local database!"
            ;;
        2)
            echo ""
            echo "📦 Applying migration to remote Supabase..."
            echo "Make sure you've run: supabase link --project-ref your-project-ref"
            echo ""
            read -p "Continue? (y/n): " confirm
            if [ "$confirm" = "y" ]; then
                supabase db push
                echo ""
                echo "✅ Migration applied to remote database!"
            else
                echo "Cancelled."
                exit 0
            fi
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
else
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "Please apply the migration manually via Supabase Dashboard:"
    echo ""
    echo "1. Go to https://app.supabase.com/project/<your-project-id>/sql"
    echo "2. Create a new query"
    echo "3. Copy and paste the contents of:"
    echo "   supabase/migrations/20250123_fix_trigger_schema.sql"
    echo "4. Run the query"
    echo ""
    
    # Display the migration file for easy copying
    echo "Migration file contents:"
    echo "========================"
    cat supabase/migrations/20250123_fix_trigger_schema.sql
    echo ""
    echo "========================"
fi

echo ""
echo "🧪 Testing Steps:"
echo "1. Try signing up with a new user"
echo "2. Check for the error: 'Database error saving new user'"
echo "3. If successful, verify user exists in both tables:"
echo "   - public.app_users"
echo "   - public.onagui_profiles"
echo ""
echo "📚 For more details, see: FIX_DATABASE_ERROR.md"
