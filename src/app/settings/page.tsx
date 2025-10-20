// src/app/settings/page.tsx

import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - ONAGUI',
  description: 'Manage your profile and application settings.',
};

/**
 * Settings Page
 * A placeholder page to resolve the 404 error.
 * Future work: Implement user preferences, notifications, and security settings here.
 */
export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">User Settings</h1>
      
      <div className="bg-white/5 p-6 rounded-xl shadow-lg border border-white/10">
        <p className="text-gray-300">
          Settings configuration is coming soon! This page is currently a placeholder to ensure the 
          navigation link resolves correctly (200 OK).
        </p>
        <p className="text-gray-400 mt-3 text-sm">
          You can implement sections for Profile Management, Security Preferences, and Theme Switching here.
        </p>
      </div>

      {/* Placeholder for future components like SecurityForm or PreferencesForm */}
    </div>
  );
}