import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/supabase';

export type UserProfile = Database['public']['Tables']['onagui_profiles']['Row'];

export class ProfileService {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get user profile with basic information
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  }
}

// Export a singleton instance
export const profileService = new ProfileService();