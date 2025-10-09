import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database, Json } from '../types/supabase';

export type UserRank = Database['public']['Tables']['ranks']['Row'];
export type UserAchievement = Database['public']['Tables']['achievements']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];
export type UserProfile = Database['public']['Tables']['onagui_profiles']['Row'];
export type UserWallet = Database['public']['Tables']['wallets']['Row'];

export class ProfileService {
  private supabase = createClientComponentClient<Database>();

  /**
   * Get user profile with rank information
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

  /**
   * Get user's current rank
   */
  async getUserRank(userId: string): Promise<UserRank | null> {
    const { data: user, error: userError } = await this.supabase
      .from('app_users')
      .select('current_rank')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.error('Error fetching user rank:', userError);
      return null;
    }
    
    const { data: rank, error: rankError } = await this.supabase
      .from('ranks')
      .select('*')
      .eq('code', user.current_rank)
      .single();
    
    if (rankError) {
      console.error('Error fetching rank details:', rankError);
      return null;
    }
    
    return rank;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await this.supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        unlocked_at,
        achievements (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
    
    return (data?.map((item: Database['public']['Tables']['user_achievements']['Row'] & { achievements: UserAchievement }) => item.achievements) ?? []);
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await this.supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
    
    return data || [];
  }

  /**
   * Update user's rank
   */
  async updateUserRank(userId: string, rankCode: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('app_users')
      .update({ current_rank: rankCode })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user rank:', error);
      return false;
    }
    
    return true;
  }

  /**
   * Award an achievement to a user
   */
  async awardAchievement(userId: string, achievementId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
    
    return true;
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: string, badgeCode: string, badgeName: string, icon?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_code: badgeCode,
        name: badgeName,
        icon: icon,
        earned_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
    
    return true;
  }

  /**
   * Log user activity
   */
  async logActivity(userId: string, action: string, metadata?: Json): Promise<boolean> {
    const { error } = await this.supabase
      .from('activities')
      .insert({
        user_id: userId,
        action,
        metadata,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging activity:', error);
      return false;
    }
    
    return true;
  }

  /**
   * Get user's wallet
   */
  async getUserWallet(userId: string): Promise<UserWallet | null> {
    const { data, error } = await this.supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user wallet:', error);
      return null;
    }
    
    return data;
  }

  /**
   * Update wallet balance
   */
  async updateWalletBalance(userId: string, tickets?: number, fiat?: number): Promise<boolean> {
    // First get current wallet
    const wallet = await this.getUserWallet(userId);
    
    if (!wallet) {
      console.error('Wallet not found for user:', userId);
      return false;
    }
    
    const updates: Partial<UserWallet> = {};
    
    if (tickets !== undefined) {
      updates.balance_tickets = tickets;
    }
    
    if (fiat !== undefined) {
      updates.balance_fiat = fiat;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length === 0) {
      return true;
    }
    
    const { error } = await this.supabase
      .from('wallets')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating wallet balance:', error);
      return false;
    }
    
    return true;
  }
}

// Export a singleton instance
export const profileService = new ProfileService();