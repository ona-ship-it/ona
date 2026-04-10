"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import EditProfileModal from '@/components/EditProfileModal';
import EditPostModal from '@/components/EditPostModal';
import ProfileFollowButton from '@/components/ProfileFollowButton';
import { createClient } from '@/lib/supabase';
import CreatorCommissionDisplay, {
  CommissionHistoryItem,
  CommissionTotals,
} from '@/components/CreatorCommissionDisplay';
import { 
  Users, Trophy, Heart, TrendingUp, Clock, Share2, 
  ExternalLink, Check, Flame, Star, Gift, Ticket,
  Instagram, Twitter, Music2, Calendar, Eye, MessageCircle,
  Award, DollarSign, Target, Zap, Search, Plus, Pencil
} from 'lucide-react';

type ProfileRecord = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  twitter_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  website_url: string | null
  created_at: string | null
}

type CommunityProfile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

type LivePost = {
  id: string
  type: 'giveaway' | 'raffle'
  title: string
  image: string
  prize: string
  entries?: number
  tickets?: number
  soldTickets?: number
  timeLeft: string
  status: string
  views: number
}

type HistoryPost = {
  id: string
  type: 'giveaway' | 'raffle'
  title: string
  image: string
  prize: string
  entries?: number
  tickets?: number
  winner: string
  endDateValue: string
  endDate: string
  status: string
}

type PopularPost = {
  id: string
  type: 'giveaway' | 'raffle'
  title: string
  image: string
  prize: string
  entries?: number
  tickets?: number
  subs: number
  status: string
}

type WinnerEntry = {
  id: string
  username: string
  avatar: string
  prize: string
  value: string
  date: string
  verified: boolean
}

type FundraiseEntry = {
  id: string
  title: string
  image: string
  raised: number
  goal: number
  donors: number
  contribution: number
  date: string
}

type FollowerJoinRow = {
  follower: CommunityProfile | null
}

type FollowingJoinRow = {
  profile: CommunityProfile | null
}

type FundraiserRecord = {
  id: string
  title: string | null
  cover_image: string | null
  raised_amount: number | null
  goal_amount: number | null
  total_donors: number | null
  created_at: string | null
}

type ProfilePageClientProps = {
  profileIdOverride?: string | null
}

const ONAGUIProfilePage = ({ profileIdOverride = null }: ProfilePageClientProps) => {
  const searchParams = useSearchParams();
  const requestedProfileId = profileIdOverride || searchParams.get('id');
  const [activeSection, setActiveSection] = useState('live');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostType, setEditingPostType] = useState<'raffle' | 'giveaway'>('giveaway');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileRecord | null>(null);
  const [commissionTotals, setCommissionTotals] = useState<CommissionTotals>({
    totalEarned: 0,
    paidOut: 0,
    pending: 0,
  });
  const [commissionHistory, setCommissionHistory] = useState<CommissionHistoryItem[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersList, setFollowersList] = useState<CommunityProfile[]>([]);
  const [followingList, setFollowingList] = useState<CommunityProfile[]>([]);
  const [followerSearch, setFollowerSearch] = useState('');
  const [followingSearch, setFollowingSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [followerPage, setFollowerPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const pageSize = 12;
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [creatorStats, setCreatorStats] = useState({
    totalGiveaways: 0,
    totalWinners: 0,
    totalValue: 0,
  });
  const fallbackImage = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop';
  const [livePosts, setLivePosts] = useState<LivePost[]>([]);
  const [historyPosts, setHistoryPosts] = useState<HistoryPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [recentWinners, setRecentWinners] = useState<WinnerEntry[]>([]);
  const [supportedFundraises, setSupportedFundraises] = useState<FundraiseEntry[]>([]);
  const contentSearchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user && !requestedProfileId) {
        return;
      }

      const userId = requestedProfileId || session?.user?.id;
      if (!userId) return;

      setViewerId(session?.user?.id || null);
      setProfileId(userId);

      const [{ data: profileRow }, { data: onaguiProfile }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, bio, twitter_url, instagram_url, tiktok_url, website_url')
          .eq('id', userId)
          .single(),
        supabase
          .from('onagui_profiles')
          .select('id, username, full_name, avatar_url, created_at')
          .eq('id', userId)
          .single(),
      ]);

      const mergedProfile: ProfileRecord = {
        id: userId,
        username: onaguiProfile?.username || null,
        full_name: profileRow?.full_name || onaguiProfile?.full_name || null,
        avatar_url: profileRow?.avatar_url || onaguiProfile?.avatar_url || null,
        bio: profileRow?.bio || null,
        twitter_url: profileRow?.twitter_url || null,
        instagram_url: profileRow?.instagram_url || null,
        tiktok_url: profileRow?.tiktok_url || null,
        website_url: profileRow?.website_url || null,
        created_at: onaguiProfile?.created_at || null,
      };

      setProfileData(mergedProfile);

      const { count: followers } = await supabase
        .from('profile_followers')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', userId);

      setFollowersCount(followers || 0);

      if (session?.user?.id && session.user.id !== userId) {
        const { data: followRow } = await supabase
          .from('profile_followers')
          .select('profile_id')
          .eq('profile_id', userId)
          .eq('follower_id', session.user.id)
          .maybeSingle();
        setIsFollowing(!!followRow);
      } else {
        setIsFollowing(false);
      }

      const { data: creatorGiveaways } = await supabase
        .from('giveaways')
        .select('id, title, prize_value, status, created_at, ticket_price')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      const giveaways = creatorGiveaways || [];
      const totalValue = giveaways.reduce((sum, giveaway) => sum + (giveaway.prize_value || 0), 0);

      setCreatorStats({
        totalGiveaways: giveaways.length,
        totalWinners: giveaways.length,
        totalValue,
      });

      if (giveaways.length === 0) {
        setCommissionTotals({ totalEarned: 0, paidOut: 0, pending: 0 });
        setCommissionHistory([]);
        return;
      }

      const giveawayIds = giveaways.map((giveaway) => giveaway.id);
      const ticketPriceMap = new Map<string, number>();
      giveaways.forEach((giveaway) => {
        ticketPriceMap.set(giveaway.id, giveaway.ticket_price || 0);
      });

      const { data: paidTickets } = await supabase
        .from('tickets')
        .select('giveaway_id, quantity')
        .eq('is_free', false)
        .in('giveaway_id', giveawayIds);

      const revenueByGiveaway = new Map<string, number>();
      (paidTickets || []).forEach((ticket) => {
        if (!ticket.giveaway_id) return;
        const ticketPrice = ticketPriceMap.get(ticket.giveaway_id) || 0;
        const quantity = ticket.quantity || 1;
        revenueByGiveaway.set(
          ticket.giveaway_id,
          (revenueByGiveaway.get(ticket.giveaway_id) || 0) + ticketPrice * quantity
        );
      });

      let totalEarned = 0;
      let paidOut = 0;
      let pending = 0;

      const historyItems: CommissionHistoryItem[] = giveaways.slice(0, 6).map((giveaway) => {
        const revenue = revenueByGiveaway.get(giveaway.id) || 0;
        const subs = revenue * 0.1;
        totalEarned += subs;
        if (giveaway.status === 'completed') {
          paidOut += subs;
        } else {
          pending += subs;
        }
        return {
          id: giveaway.id,
          title: giveaway.title || 'Giveaway',
          amount: subs,
          status: giveaway.status === 'completed' ? 'paid' : 'pending',
        };
      });

      setCommissionTotals({ totalEarned, paidOut, pending });
      setCommissionHistory(historyItems);
    };

    loadProfile();
  }, [requestedProfileId]);

  useEffect(() => {
    if (!profileId) return;
    setFollowerPage(1);
    setFollowingPage(1);
    setFollowersList([]);
    setFollowingList([]);
    setFollowersLoading(true);
    setFollowingLoading(true);
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;
    const loadCommunity = async () => {
      const supabase = createClient();
      const followerFrom = (followerPage - 1) * pageSize;
      const followerTo = followerFrom + pageSize - 1;
      const followingFrom = (followingPage - 1) * pageSize;
      const followingTo = followingFrom + pageSize - 1;

      const [{ data: followerRows }, { data: followingRows }, { count: totalFollowers }, { count: totalFollowing }] = await Promise.all([
        supabase
          .from('profile_followers')
          .select('follower_id, follower:follower_id (id, username, full_name, avatar_url)')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false })
          .range(followerFrom, followerTo),
        supabase
          .from('profile_followers')
          .select('profile_id, profile:profile_id (id, username, full_name, avatar_url)')
          .eq('follower_id', profileId)
          .order('created_at', { ascending: false })
          .range(followingFrom, followingTo),
        supabase
          .from('profile_followers')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId),
        supabase
          .from('profile_followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileId),
      ]);

      const nextFollowers = ((followerRows || []) as FollowerJoinRow[])
        .map((row) => row.follower)
        .filter((person): person is CommunityProfile => Boolean(person));
      const nextFollowing = ((followingRows || []) as FollowingJoinRow[])
        .map((row) => row.profile)
        .filter((person): person is CommunityProfile => Boolean(person));

      setFollowersList((prev) => {
        const merged = followerPage === 1 ? nextFollowers : [...prev, ...nextFollowers];
        const seen = new Set<string>();
        return merged.filter((person) => {
          if (seen.has(person.id)) return false;
          seen.add(person.id);
          return true;
        });
      });

      setFollowingList((prev) => {
        const merged = followingPage === 1 ? nextFollowing : [...prev, ...nextFollowing];
        const seen = new Set<string>();
        return merged.filter((person) => {
          if (seen.has(person.id)) return false;
          seen.add(person.id);
          return true;
        });
      });

      if (typeof totalFollowers === 'number') {
        setFollowersCount(totalFollowers);
      }
      if (typeof totalFollowing === 'number') {
        setFollowingCount(totalFollowing);
      }

      setFollowersLoading(false);
      setFollowingLoading(false);
    };

    loadCommunity();
  }, [profileId, followerPage, followingPage]);

  useEffect(() => {
    if (!profileId) return;
    const supabase = createClient();

    const formatCurrency = (value: number | null | undefined, currency?: string | null) => {
      const safeValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
      const formatted = safeValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
      if (currency) {
        return `${formatted} ${currency}`;
      }
      return `$${formatted}`;
    };

    const formatTimeLeft = (endDate?: string | null) => {
      if (!endDate) return 'Live';
      const diffMs = new Date(endDate).getTime() - Date.now();
      if (diffMs <= 0) return 'Ended';
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      if (days > 0) return `${days}d ${hours}h`;
      return `${hours}h`;
    };

    const formatShortDate = (dateString?: string | null) => {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const loadProfileContent = async () => {
      setContentLoading(true);
      try {
        const now = new Date();

      const [{ data: giveaways }, { data: raffles }] = await Promise.all([
        supabase
          .from('giveaways')
          .select('id, title, image_url, prize_value, prize_currency, tickets_sold, total_tickets, ticket_price, ticket_currency, status, end_date, created_at, winner_id, winner_drawn_at')
          .eq('creator_id', profileId)
          .order('created_at', { ascending: false }),
        supabase
          .from('raffles')
          .select('id, title, image_urls, prize_value, prize_currency, tickets_sold, total_tickets, base_ticket_price, status, view_count, created_at, winner_id, winner_drawn_at')
          .eq('creator_id', profileId)
          .order('created_at', { ascending: false }),
      ]);

      const giveawayRows = giveaways || [];
      const raffleRows = raffles || [];
      const giveawayIds = giveawayRows.map((giveaway) => giveaway.id);

      const subsByGiveaway = new Map<string, number>();
      if (giveawayIds.length > 0) {
        const { data: paidTickets } = await supabase
          .from('tickets')
          .select('giveaway_id, quantity')
          .eq('is_free', false)
          .in('giveaway_id', giveawayIds);

        const ticketPriceMap = new Map<string, number>();
        giveawayRows.forEach((giveaway) => {
          ticketPriceMap.set(giveaway.id, giveaway.ticket_price || 0);
        });

        (paidTickets || []).forEach((ticket) => {
          if (!ticket.giveaway_id) return;
          const price = ticketPriceMap.get(ticket.giveaway_id) || 0;
          const quantity = ticket.quantity || 1;
          const revenue = price * quantity;
          const subs = revenue * 0.1;
          subsByGiveaway.set(
            ticket.giveaway_id,
            (subsByGiveaway.get(ticket.giveaway_id) || 0) + subs
          );
        });
      }

      const liveGiveaways = giveawayRows.filter((giveaway) => {
        if (giveaway.status !== 'active') return false;
        if (!giveaway.end_date) return true;
        return new Date(giveaway.end_date) > now;
      });

      const liveRaffles = raffleRows.filter((raffle) => raffle.status === 'active');

      const nextLivePosts: LivePost[] = [
        ...liveGiveaways.map((giveaway) => ({
          id: giveaway.id,
          type: 'giveaway',
          title: giveaway.title || 'Giveaway',
          image: giveaway.image_url || profileData?.avatar_url || fallbackImage,
          prize: formatCurrency(giveaway.prize_value, giveaway.prize_currency),
          entries: giveaway.tickets_sold || 0,
          timeLeft: formatTimeLeft(giveaway.end_date),
          status: giveaway.status,
          views: giveaway.tickets_sold || 0,
        })),
        ...liveRaffles.map((raffle) => ({
          id: raffle.id,
          type: 'raffle',
          title: raffle.title || 'Raffle',
          image: raffle.image_urls?.[0] || profileData?.avatar_url || fallbackImage,
          prize: formatCurrency(raffle.prize_value, raffle.prize_currency),
          tickets: raffle.total_tickets || 0,
          soldTickets: raffle.tickets_sold || 0,
          timeLeft: 'Live',
          status: raffle.status,
          views: raffle.view_count || raffle.tickets_sold || 0,
        })),
      ].sort((a, b) => (b.status === 'active' ? 1 : 0) - (a.status === 'active' ? 1 : 0));

      const historyGiveaways = giveawayRows.filter((giveaway) => {
        if (giveaway.winner_id) return true;
        if (giveaway.status === 'completed') return true;
        if (!giveaway.end_date) return false;
        return new Date(giveaway.end_date) <= now;
      });

      const historyRaffles = raffleRows.filter((raffle) => {
        if (raffle.winner_id) return true;
        return raffle.status === 'completed';
      });

      const winnerIds = Array.from(
        new Set(
          [
            ...historyGiveaways.map((giveaway) => giveaway.winner_id),
            ...historyRaffles.map((raffle) => raffle.winner_id),
          ].filter((id): id is string => !!id)
        )
      );

      let winnerProfiles: CommunityProfile[] = [];
      if (winnerIds.length > 0) {
        const { data: winners } = await supabase
          .from('onagui_profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', winnerIds);
        winnerProfiles = winners || [];
      }

      const winnerMap = new Map(
        winnerProfiles.map((winner) => [
          winner.id,
          {
            username: winner.username || winner.full_name || 'winner',
            avatar: winner.avatar_url || profileData?.avatar_url || '',
          },
        ])
      );

      const nextHistoryPosts: HistoryPost[] = [
        ...historyGiveaways.map((giveaway) => ({
          id: giveaway.id,
          type: 'giveaway',
          title: giveaway.title || 'Giveaway',
          image: giveaway.image_url || profileData?.avatar_url || fallbackImage,
          prize: formatCurrency(giveaway.prize_value, giveaway.prize_currency),
          entries: giveaway.tickets_sold || 0,
          winner: giveaway.winner_id
            ? `@${winnerMap.get(giveaway.winner_id)?.username || 'winner'}`
            : 'Pending',
          endDateValue: giveaway.winner_drawn_at || giveaway.end_date || giveaway.created_at,
          endDate: formatShortDate(giveaway.winner_drawn_at || giveaway.end_date),
          status: giveaway.status,
        })),
        ...historyRaffles.map((raffle) => ({
          id: raffle.id,
          type: 'raffle',
          title: raffle.title || 'Raffle',
          image: raffle.image_urls?.[0] || profileData?.avatar_url || fallbackImage,
          prize: formatCurrency(raffle.prize_value, raffle.prize_currency),
          tickets: raffle.total_tickets || 0,
          winner: raffle.winner_id
            ? `@${winnerMap.get(raffle.winner_id)?.username || 'winner'}`
            : 'Pending',
          endDateValue: raffle.winner_drawn_at || raffle.created_at,
          endDate: formatShortDate(raffle.winner_drawn_at || raffle.created_at),
          status: raffle.status,
        })),
      ].sort((a, b) => new Date(b.endDateValue).getTime() - new Date(a.endDateValue).getTime());

      const nextPopularPosts: PopularPost[] = giveawayRows
        .map((giveaway) => ({
          id: giveaway.id,
          type: 'giveaway',
          title: giveaway.title || 'Giveaway',
          image: giveaway.image_url || profileData?.avatar_url || fallbackImage,
          prize: formatCurrency(giveaway.prize_value, giveaway.prize_currency),
          entries: giveaway.tickets_sold || 0,
          subs: Math.round(subsByGiveaway.get(giveaway.id) || 0),
          status: giveaway.status,
        }))
        .sort((a, b) => b.subs - a.subs)
        .slice(0, 3);

      const nextWinners: WinnerEntry[] = [
        ...historyGiveaways
          .filter((giveaway) => giveaway.winner_id)
          .map((giveaway) => ({
            id: giveaway.id,
            username: winnerMap.get(giveaway.winner_id || '')?.username || 'winner',
            avatar: winnerMap.get(giveaway.winner_id || '')?.avatar || profileData?.avatar_url || fallbackImage,
            prize: giveaway.title || 'Giveaway',
            value: formatCurrency(giveaway.prize_value, giveaway.prize_currency),
            date: formatShortDate(giveaway.winner_drawn_at || giveaway.end_date),
            verified: false,
          })),
        ...historyRaffles
          .filter((raffle) => raffle.winner_id)
          .map((raffle) => ({
            id: raffle.id,
            username: winnerMap.get(raffle.winner_id || '')?.username || 'winner',
            avatar: winnerMap.get(raffle.winner_id || '')?.avatar || profileData?.avatar_url || fallbackImage,
            prize: raffle.title || 'Raffle',
            value: formatCurrency(raffle.prize_value, raffle.prize_currency),
            date: formatShortDate(raffle.winner_drawn_at || raffle.created_at),
            verified: false,
          })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6);

      const { data: donations } = await supabase
        .from('donations')
        .select('fundraiser_id, amount, created_at')
        .eq('user_id', profileId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(100);

      const fundraiserIds = Array.from(
        new Set((donations || []).map((donation) => donation.fundraiser_id).filter(Boolean))
      );

      let fundraisers: FundraiserRecord[] = [];
      if (fundraiserIds.length > 0) {
        const { data: fundraiserRows } = await supabase
          .from('fundraisers')
          .select('id, title, cover_image, raised_amount, goal_amount, total_donors, created_at')
          .in('id', fundraiserIds);
        fundraisers = fundraiserRows || [];
      }

      const donationTotals = new Map<string, { total: number; lastDate: string }>();
      (donations || []).forEach((donation) => {
        if (!donation.fundraiser_id) return;
        const current = donationTotals.get(donation.fundraiser_id) || {
          total: 0,
          lastDate: donation.created_at,
        };
        const nextTotal = current.total + (Number(donation.amount) || 0);
        const lastDate = new Date(donation.created_at) > new Date(current.lastDate)
          ? donation.created_at
          : current.lastDate;
        donationTotals.set(donation.fundraiser_id, { total: nextTotal, lastDate });
      });

      const nextFundraises: FundraiseEntry[] = fundraisers.map((fundraiser) => {
        const contribution = donationTotals.get(fundraiser.id)?.total || 0;
        const lastDate = donationTotals.get(fundraiser.id)?.lastDate || fundraiser.created_at;
        return {
          id: fundraiser.id,
          title: fundraiser.title || 'Fundraiser',
          image: fundraiser.cover_image || profileData?.avatar_url || fallbackImage,
          raised: Number(fundraiser.raised_amount) || 0,
          goal: Number(fundraiser.goal_amount) || 0,
          donors: fundraiser.total_donors || 0,
          contribution,
          date: formatShortDate(lastDate),
        };
      });

        setLivePosts(nextLivePosts);
        setHistoryPosts(nextHistoryPosts);
        setPopularPosts(nextPopularPosts);
        setRecentWinners(nextWinners);
        setSupportedFundraises(nextFundraises);
      } catch (error) {
        console.error('Failed to load profile content', error);
      } finally {
        setContentLoading(false);
      }
    };

    loadProfileContent();
  }, [profileId, profileData]);

  const handleFollowToggle = async () => {
    if (!viewerId || !profileData || followLoading || viewerId === profileData.id) return;
    const supabase = createClient();
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('profile_followers')
          .delete()
          .eq('profile_id', profileData.id)
          .eq('follower_id', viewerId);
        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(prev - 1, 0));
      } else {
        const { error } = await supabase
          .from('profile_followers')
          .insert({ profile_id: profileData.id, follower_id: viewerId });
        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const profile = useMemo(() => {
    const fallback = {
      username: "Creator",
      displayName: "@Creator",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop",
      bio: "Welcome to my Onagui profile.",
      verified: false,
      joinDate: "New",
      location: "Onagui",
      stats: {
        totalGiveaways: 0,
        totalWinners: 0,
        totalValue: "0",
        followers: 0,
        credibilityScore: 0
      },
      social: {
        twitter: null as string | null,
        instagram: null as string | null,
        tiktok: null as string | null
      }
    };

    if (!profileData) return fallback;

    const joinDate = profileData.created_at
      ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : fallback.joinDate;

    const totalValueLabel = creatorStats.totalValue >= 1000000
      ? `${(creatorStats.totalValue / 1000000).toFixed(1)}M`
      : creatorStats.totalValue.toLocaleString();

    return {
      username: profileData.username || fallback.username,
      displayName: `@${profileData.username || fallback.username}`,
      avatar: profileData.avatar_url || fallback.avatar,
      bio: profileData.bio || fallback.bio,
      verified: true,
      joinDate,
      location: fallback.location,
      stats: {
        totalGiveaways: creatorStats.totalGiveaways,
        totalWinners: creatorStats.totalWinners,
        totalValue: totalValueLabel,
        followers: followersCount,
        credibilityScore: Math.min(99, 70 + Math.min(creatorStats.totalGiveaways, 20))
      },
      social: {
        twitter: profileData.twitter_url || null,
        instagram: profileData.instagram_url || null,
        tiktok: profileData.tiktok_url || null,
      }
    };
  }, [profileData, creatorStats, followersCount]);

const formatSocialLabel = (value: string) => value.replace(/^https?:[/][/]/, '').replace(/[/]$/, '')
  const formatFollowerCount = (count: number) =>
    count >= 1000 ? `${(count / 1000).toFixed(1)}K` : `${count}`

  const isOwnProfile = !!profileData && !!viewerId && viewerId === profileData.id
  const normalizedContentSearch = contentSearch.trim().toLowerCase()

  const postMatchesSearch = (title: string, prize: string) => {
    if (!normalizedContentSearch) return true
    return `${title} ${prize}`.toLowerCase().includes(normalizedContentSearch)
  }

  const filteredFollowers = followersList.filter((person) => {
    const label = `${person.full_name || ''} ${person.username || ''}`.toLowerCase()
    return label.includes(followerSearch.toLowerCase())
  })

  const filteredFollowing = followingList.filter((person) => {
    const label = `${person.full_name || ''} ${person.username || ''}`.toLowerCase()
    return label.includes(followingSearch.toLowerCase())
  })

  const filteredLivePosts = livePosts.filter((post) => postMatchesSearch(post.title, post.prize))
  const filteredHistoryPosts = historyPosts.filter((post) => postMatchesSearch(post.title, post.prize))
  const filteredPopularPosts = popularPosts.filter((post) => postMatchesSearch(post.title, post.prize))
  const filteredWinners = recentWinners.filter((winner) => {
    if (!normalizedContentSearch) return true
    return `${winner.username} ${winner.prize}`.toLowerCase().includes(normalizedContentSearch)
  })
  const filteredFundraises = supportedFundraises.filter((fundraise) => {
    if (!normalizedContentSearch) return true
    return fundraise.title.toLowerCase().includes(normalizedContentSearch)
  })

  const openPostEditor = (postId: string, postType: 'raffle' | 'giveaway') => {
    setEditingPostId(postId)
    setEditingPostType(postType)
  }

  const getPostHref = (postType: 'raffle' | 'giveaway', postId: string) =>
    postType === 'raffle' ? `/raffles/${postId}` : `/giveaways/${postId}`

  const handleContentSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setContentSearch('')
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      setContentSearch((prev) => prev.trim())
    }
  }

  return (
    <>
      <div className="profile-container">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .profile-container {
          min-height: 100vh;
          background: var(--primary-bg);
          background-image: 
            radial-gradient(circle at 20% 20%, rgba(59,130,246,0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 136, 0, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,130,246,0.04) 2px, rgba(59,130,246,0.04) 4px);
          font-family: 'Barlow', sans-serif;
          color: #fff;
          padding: 32px 24px;
        }

        .profile-wrapper { max-width: 1400px; margin: 0 auto; }

        .profile-hero {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.92) 100%);
          border: 1px solid rgba(59,130,246,0.24);
          border-radius: 24px; padding: 48px; margin-bottom: 32px;
          position: relative; overflow: hidden; backdrop-filter: blur(10px);
        }
        .profile-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(59,130,246,0.06) 0%, transparent 50%); pointer-events: none; }
        .hero-content { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: start; position: relative; z-index: 1; }
        .avatar-section { position: relative; }
        .avatar-wrapper { width: 160px; height: 160px; border-radius: 50%; border: 4px solid #3b82f6; padding: 6px; background: linear-gradient(135deg, rgba(59,130,246,0.24), rgba(37,99,235,0.22)); box-shadow: 0 0 40px rgba(59,130,246,0.42); animation: avatarGlow 3s ease-in-out infinite; }
        @keyframes avatarGlow { 0%, 100% { box-shadow: 0 0 40px rgba(59,130,246,0.42); } 50% { box-shadow: 0 0 60px rgba(59,130,246,0.55); } }
        .avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .verified-badge-large { position: absolute; bottom: 8px; right: 8px; width: 40px; height: 40px; background: #3b82f6; border: 3px solid #0f1419; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(59,130,246,0.55); }
        .profile-info { flex: 1; }
        .username-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .display-name { font-family: 'Rajdhani', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 1px; }
        .credibility-badge { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, rgba(59,130,246,0.24), rgba(37,99,235,0.22)); border: 2px solid #3b82f6; padding: 8px 16px; border-radius: 20px; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px; color: #3b82f6; box-shadow: 0 0 20px rgba(59,130,246,0.34); }
        .bio-text { font-size: 16px; color: #a0aec0; line-height: 1.6; margin-bottom: 20px; }
        .profile-meta { display: flex; gap: 24px; margin-bottom: 24px; font-size: 14px; color: #718096; }
        .meta-item { display: flex; align-items: center; gap: 6px; }
        .social-links { display: flex; gap: 12px; margin-bottom: 24px; }
        .social-btn { display: flex; align-items: center; gap: 8px; background: rgba(59,130,246,0.10); border: 1px solid rgba(59,130,246,0.34); padding: 10px 20px; border-radius: 10px; color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.3s ease; }
        .social-btn:hover { background: rgba(59,130,246,0.24); border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(59,130,246,0.34); }
        .social-btn.twitter { color: #1DA1F2; border-color: rgba(29, 161, 242, 0.3); }
        .social-btn.instagram { color: #E4405F; border-color: rgba(228, 64, 95, 0.3); }
        .social-btn.tiktok { color: #00f2ea; border-color: rgba(0, 242, 234, 0.3); }
        .follow-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; border: none; padding: 12px 24px; border-radius: 10px; font-family: 'Rajdhani', sans-serif; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; }
        .follow-btn.is-following { background: rgba(59,130,246,0.10); color: #3b82f6; border: 1px solid rgba(59,130,246,0.42); }
        .follow-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; }
        .stat-card { background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.24); border-radius: 12px; padding: 20px; text-align: center; }
        .stat-value { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; color: #3b82f6; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 1px; }
        .section-nav { display: flex; gap: 12px; margin-bottom: 32px; border-bottom: 2px solid rgba(59,130,246,0.10); padding-bottom: 0; overflow-x: auto; }
        .nav-tab { background: transparent; border: none; color: #718096; padding: 16px 24px; font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; border-bottom: 3px solid transparent; white-space: nowrap; }
        .nav-tab:hover { color: #3b82f6; }
        .nav-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; box-shadow: 0 2px 15px rgba(59,130,246,0.34); }
        .content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .content-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid rgba(59,130,246,0.16); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; cursor: pointer; position: relative; }
        .content-card:hover { transform: translateY(-4px); border-color: rgba(59,130,246,0.42); box-shadow: 0 12px 40px rgba(59,130,246,0.24); }
        .card-image { position: relative; width: 100%; height: 200px; overflow: hidden; }
        .card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
        .content-card:hover .card-image img { transform: scale(1.05); }
        .status-badge { position: absolute; top: 12px; left: 12px; display: flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 6px 12px; border-radius: 20px; font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(59,130,246,0.42); animation: badgePulse 2s ease-in-out infinite; }
        .status-badge.completed { background: linear-gradient(135deg, #718096 0%, #4a5568 100%); color: #fff; }
        @keyframes badgePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-stats-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(15, 20, 25, 0.95) 0%, transparent 100%); padding: 12px; display: flex; justify-content: space-between; }
        .overlay-stat { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #fff; font-weight: 600; }
        .card-body { padding: 20px; }
        .card-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; line-height: 1.3; }
        .card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .prize-display { display: flex; align-items: center; gap: 8px; color: #ff8800; font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; }
        .card-info { display: flex; gap: 16px; font-size: 13px; color: #718096; }
        .info-item { display: flex; align-items: center; gap: 6px; }
        .winner-info { background: rgba(59,130,246,0.10); border: 1px solid rgba(59,130,246,0.34); border-radius: 10px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
        .winner-name { color: #3b82f6; font-weight: 600; }
        .winners-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .winner-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid rgba(59,130,246,0.16); border-radius: 16px; padding: 20px; display: flex; gap: 16px; align-items: center; transition: all 0.3s ease; }
        .winner-card:hover { border-color: rgba(59,130,246,0.42); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.16); }
        .winner-avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid #3b82f6; object-fit: cover; }
        .winner-details { flex: 1; }
        .winner-username { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #3b82f6; margin-bottom: 4px; }
        .winner-prize { font-size: 14px; color: #a0aec0; margin-bottom: 4px; }
        .winner-value { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #ff8800; }
        .winner-date { font-size: 12px; color: #718096; }
        .fundraise-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid rgba(59,130,246,0.16); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; }
        .fundraise-card:hover { transform: translateY(-4px); border-color: rgba(59,130,246,0.42); box-shadow: 0 12px 40px rgba(59,130,246,0.24); }
        .fundraise-progress { padding: 20px; }
        .progress-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .raised-amount { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #3b82f6; }
        .goal-amount { font-size: 14px; color: #718096; }
        .progress-bar-container { width: 100%; height: 8px; background: rgba(59,130,246,0.10); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
        .progress-bar-inner { height: 100%; background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); border-radius: 10px; box-shadow: 0 0 15px rgba(59,130,246,0.55); transition: width 0.5s ease; }
        .contribution-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 136, 0, 0.1); border: 1px solid rgba(255, 136, 0, 0.3); padding: 8px 16px; border-radius: 20px; font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #ff8800; }
        .community-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
        .community-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid rgba(59,130,246,0.16); border-radius: 16px; padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px; transition: all 0.3s ease; }
        .community-card:hover { border-color: rgba(59,130,246,0.42); transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.16); }
        .community-card-main { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; min-width: 0; flex: 1; }
        .community-follow-slot { display: flex; align-items: center; justify-content: flex-end; }
        .community-search { display: flex; gap: 12px; margin-bottom: 20px; }
        .community-search input { flex: 1; background: rgba(15, 20, 25, 0.9); border: 1px solid rgba(59,130,246,0.24); border-radius: 10px; padding: 10px 14px; color: #ffffff; font-size: 14px; }
        .community-search input::placeholder { color: #718096; }
        .owner-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .owner-action-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(59,130,246,0.10); border: 1px solid rgba(59,130,246,0.38); color: #3b82f6; border-radius: 10px; padding: 10px 14px; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; }
        .section-tools { display: flex; gap: 12px; align-items: center; margin: 0 0 20px; }
        .content-search { display: flex; gap: 8px; align-items: center; flex: 1; max-width: 520px; }
        .content-search input { flex: 1; background: rgba(15, 20, 25, 0.9); border: 1px solid rgba(59,130,246,0.24); border-radius: 10px; padding: 10px 14px; color: #ffffff; font-size: 14px; }
        .content-search-icon-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(59,130,246,0.38); background: rgba(59,130,246,0.10); color: #3b82f6; display: inline-flex; align-items: center; justify-content: center; }
        .content-search-clear-btn { border: none; background: transparent; color: #718096; font-size: 12px; font-weight: 600; cursor: pointer; }
        .card-actions { display: flex; gap: 8px; margin-top: 10px; }
        .card-action-btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border-radius: 8px; padding: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #e2e8f0; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; font-family: 'Rajdhani', sans-serif; letter-spacing: 0.5px; }
        .card-action-btn.primary { background: rgba(59,130,246,0.10); border-color: rgba(59,130,246,0.24); color: #3b82f6; }
        .load-more-btn { background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.42); color: #3b82f6; padding: 10px 18px; border-radius: 10px; font-family: 'Rajdhani', sans-serif; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; }
        .load-more-btn:hover { background: rgba(59,130,246,0.24); }
        .mini-spinner { width: 14px; height: 14px; border-radius: 999px; border: 2px solid rgba(59,130,246,0.38); border-top-color: #3b82f6; animation: spin 0.8s linear infinite; }
        .community-avatar { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #3b82f6; object-fit: cover; }
        .community-name { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 2px; }
        .community-handle { font-size: 12px; color: #718096; }
        .empty-community { color: #718096; font-size: 14px; }
        .content-skeleton { height: 320px; border-radius: 16px; background: linear-gradient(90deg, rgba(30,41,59,0.55), rgba(51,65,85,0.65), rgba(30,41,59,0.55)); background-size: 200% 100%; animation: pulseSlide 1.2s linear infinite; border: 1px solid rgba(59,130,246,0.16); }
        @keyframes pulseSlide { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (max-width: 768px) {
          .profile-hero { padding: 24px; }
          .hero-content { grid-template-columns: 1fr; text-align: center; }
          .avatar-section { margin: 0 auto; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .content-grid { grid-template-columns: 1fr; }
          .section-nav { overflow-x: auto; }
        }
      `}</style>

      <div className="profile-wrapper">
        {/* Hero Section */}
        <div className="profile-hero">
          <div className="hero-content">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img
                  src={profile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop"}
                  alt={profile.username}
                  className="avatar-img"
                />
                {profile.verified && (
                  <div className="verified-badge-large">
                    <Zap size={20} fill="#0f1419" stroke="#0f1419" />
                  </div>
                )}
              </div>
            </div>

            <div className="profile-info">
              <div className="username-row">
                <h1 className="display-name">{profile.displayName}</h1>
                <div className="credibility-badge">
                  <Award size={18} />
                  <span>{profile.stats.credibilityScore}% CREDIBLE</span>
                </div>
              </div>

              <p className="bio-text">{profile.bio}</p>

              <div className="profile-meta">
                <div className="meta-item"><Calendar size={14} /><span>Joined {profile.joinDate}</span></div>
                <div className="meta-item"><Target size={14} /><span>{profile.location}</span></div>
              </div>

              <div className="social-links">
                {profile.social.twitter && (
                  <a href={profile.social.twitter} className="social-btn twitter" target="_blank" rel="noreferrer">
                    <Twitter size={16} /><span>{formatSocialLabel(profile.social.twitter)}</span>
                  </a>
                )}
                {profile.social.instagram && (
                  <a href={profile.social.instagram} className="social-btn instagram" target="_blank" rel="noreferrer">
                    <Instagram size={16} /><span>{formatSocialLabel(profile.social.instagram)}</span>
                  </a>
                )}
                {profile.social.tiktok && (
                  <a href={profile.social.tiktok} className="social-btn tiktok" target="_blank" rel="noreferrer">
                    <Music2 size={16} /><span>{formatSocialLabel(profile.social.tiktok)}</span>
                  </a>
                )}
                {profileData && viewerId && viewerId !== profileData.id && (
                  <button className={`follow-btn ${isFollowing ? 'is-following' : ''}`} onClick={handleFollowToggle} disabled={followLoading}>
                    {followLoading ? 'Working...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                {profileData && viewerId === profileData?.id && (
                  <button className="follow-btn" onClick={() => setShowEditModal(true)}>Edit Profile</button>
                )}
              </div>

              <div className="stats-grid">
                <div className="stat-card"><div className="stat-value">{profile.stats.totalGiveaways}</div><div className="stat-label">Giveaways</div></div>
                <div className="stat-card"><div className="stat-value">{profile.stats.totalWinners}</div><div className="stat-label">Winners</div></div>
                <div className="stat-card"><div className="stat-value">${profile.stats.totalValue}</div><div className="stat-label">Total Value</div></div>
                <div className="stat-card"><div className="stat-value">{formatFollowerCount(profile.stats.followers)}</div><div className="stat-label">Followers</div></div>
                <div className="stat-card"><div className="stat-value">{profile.stats.credibilityScore}%</div><div className="stat-label">Trust Score</div></div>
              </div>
            </div>
          </div>
        </div>

        {profileData && viewerId === profileData.id && (
          <div style={{ marginBottom: '32px' }}>
            <CreatorCommissionDisplay totals={commissionTotals} history={commissionHistory} />
          </div>
        )}

        {isOwnProfile && (
          <div className="owner-actions">
            <button className="owner-action-btn" onClick={() => setShowEditModal(true)}>
              <Pencil size={14} /> Edit Profile
            </button>
            <a className="owner-action-btn" href="/create-giveaway">
              <Plus size={14} /> New Giveaway
            </a>
            <a className="owner-action-btn" href="/raffles/create">
              <Plus size={14} /> New Raffle
            </a>
            <a className="owner-action-btn" href="/dashboard">
              <Eye size={14} /> Open Dashboard
            </a>
          </div>
        )}

        <div className="section-nav">
          <button className={`nav-tab ${activeSection === 'live' ? 'active' : ''}`} onClick={() => setActiveSection('live')}>\ud83d\udd34 Live Now</button>
          <button className={`nav-tab ${activeSection === 'history' ? 'active' : ''}`} onClick={() => setActiveSection('history')}>\ud83d\udcdc History</button>
          <button className={`nav-tab ${activeSection === 'popular' ? 'active' : ''}`} onClick={() => setActiveSection('popular')}>\ud83d\udd25 Most Popular</button>
          <button className={`nav-tab ${activeSection === 'winners' ? 'active' : ''}`} onClick={() => setActiveSection('winners')}>\ud83c\udfc6 Winners</button>
          <button className={`nav-tab ${activeSection === 'fundraise' ? 'active' : ''}`} onClick={() => setActiveSection('fundraise')}>\u2764\ufe0f Supported Causes</button>
          <button className={`nav-tab ${activeSection === 'followers' ? 'active' : ''}`} onClick={() => setActiveSection('followers')}>\ud83d\udc65 Followers</button>
          <button className={`nav-tab ${activeSection === 'following' ? 'active' : ''}`} onClick={() => setActiveSection('following')}>\u2795 Following</button>
        </div>

        {(activeSection === 'live' || activeSection === 'history' || activeSection === 'popular' || activeSection === 'winners' || activeSection === 'fundraise') && (
          <div className="section-tools">
            <div className="content-search">
              <input
                ref={contentSearchInputRef}
                type="text"
                placeholder="Search posts, prizes, or winners"
                value={contentSearch}
                onChange={(event) => setContentSearch(event.target.value)}
                onKeyDown={handleContentSearchKeyDown}
              />
              <button
                className="content-search-icon-btn"
                aria-label="Search content"
                type="button"
                onClick={() => {
                  setContentSearch((prev) => prev.trim())
                  contentSearchInputRef.current?.focus()
                }}
              >
                <Search size={16} />
              </button>
              {contentSearch.trim() && (
                <button className="content-search-clear-btn" type="button" onClick={() => setContentSearch('')}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {activeSection === 'live' && (
          <div className="content-grid">
            {contentLoading && Array.from({ length: 3 }).map((_, idx) => <div key={`live-skeleton-${idx}`} className="content-skeleton" />)}
            {filteredLivePosts.map(post => (
              <div key={post.id} className="content-card">
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="status-badge"><Flame size={12} /><span>LIVE</span></div>
                  <div className="card-stats-overlay">
                    <div className="overlay-stat"><Eye size={14} /><span>{(post.views / 1000).toFixed(1)}K</span></div>
                    <div className="overlay-stat"><Clock size={14} /><span>{post.timeLeft}</span></div>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{post.title}</h3>
                  <div className="card-meta"><div className="prize-display"><Trophy size={20} /><span>{post.prize}</span></div></div>
                  <div className="card-info">
                    {post.entries !== undefined && post.entries > 0 && (<div className="info-item"><Users size={14} /><span>{post.entries.toLocaleString()} entries</span></div>)}
                    {post.tickets !== undefined && post.tickets > 0 && (<div className="info-item"><Ticket size={14} /><span>{post.soldTickets}/{post.tickets}</span></div>)}
                  </div>
                  <div className="card-actions">
                    <a className="card-action-btn" href={getPostHref(post.type, post.id)}>
                      <ExternalLink size={14} /> View
                    </a>
                    {isOwnProfile && (
                      <button className="card-action-btn primary" onClick={() => openPostEditor(post.id, post.type)}>
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredLivePosts.length === 0 && <div className="empty-community">No live posts match this search.</div>}
          </div>
        )}

        {activeSection === 'history' && (
          <div className="content-grid">
            {contentLoading && Array.from({ length: 3 }).map((_, idx) => <div key={`history-skeleton-${idx}`} className="content-skeleton" />)}
            {filteredHistoryPosts.map(post => (
              <div key={post.id} className="content-card">
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="status-badge completed"><Check size={12} /><span>COMPLETED</span></div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{post.title}</h3>
                  <div className="card-meta"><div className="prize-display"><Trophy size={20} /><span>{post.prize}</span></div></div>
                  <div className="card-info">
                    {post.entries !== undefined && post.entries > 0 && (<div className="info-item"><Users size={14} /><span>{post.entries.toLocaleString()} entries</span></div>)}
                    <div className="info-item"><Calendar size={14} /><span>{post.endDate}</span></div>
                  </div>
                  <div className="winner-info"><span className="winner-name">Winner: {post.winner}</span><Check size={16} color="#3b82f6" /></div>
                  <div className="card-actions">
                    <a className="card-action-btn" href={getPostHref(post.type, post.id)}>
                      <ExternalLink size={14} /> View
                    </a>
                    {isOwnProfile && (
                      <button className="card-action-btn primary" onClick={() => openPostEditor(post.id, post.type)}>
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredHistoryPosts.length === 0 && <div className="empty-community">No history posts match this search.</div>}
          </div>
        )}

        {activeSection === 'popular' && (
          <div className="content-grid">
            {contentLoading && Array.from({ length: 3 }).map((_, idx) => <div key={`popular-skeleton-${idx}`} className="content-skeleton" />)}
            {filteredPopularPosts.map(post => (
              <div key={post.id} className="content-card">
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="status-badge completed"><TrendingUp size={12} /><span>TOP POST</span></div>
                  <div className="card-stats-overlay">
                    <div className="overlay-stat"><DollarSign size={14} /><span>{post.subs.toLocaleString()} subs</span></div>
                    <div className="overlay-stat"><Users size={14} /><span>{post.entries ? `${post.entries.toLocaleString()} entries` : '0 entries'}</span></div>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{post.title}</h3>
                  <div className="card-meta"><div className="prize-display"><Trophy size={20} /><span>{post.prize}</span></div></div>
                  <div className="card-info">
                    {post.entries !== undefined && post.entries > 0 && (<div className="info-item"><Users size={14} /><span>{post.entries.toLocaleString()} entries</span></div>)}
                    {post.tickets !== undefined && post.tickets > 0 && (<div className="info-item"><Ticket size={14} /><span>{post.tickets.toLocaleString()} tickets</span></div>)}
                  </div>
                  <div className="card-actions">
                    <a className="card-action-btn" href={getPostHref(post.type, post.id)}>
                      <ExternalLink size={14} /> View
                    </a>
                    {isOwnProfile && (
                      <button className="card-action-btn primary" onClick={() => openPostEditor(post.id, post.type)}>
                        <Pencil size={14} /> Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredPopularPosts.length === 0 && <div className="empty-community">No popular posts match this search.</div>}
          </div>
        )}

        {activeSection === 'winners' && (
          <div className="winners-grid">
            {contentLoading && Array.from({ length: 3 }).map((_, idx) => <div key={`winners-skeleton-${idx}`} className="content-skeleton" />)}
            {filteredWinners.map(winner => (
              <div key={winner.id} className="winner-card">
                <img src={winner.avatar} alt={winner.username} className="winner-avatar" />
                <div className="winner-details">
                  <div className="winner-username">@{winner.username}{winner.verified && <Zap size={14} fill="#3b82f6" stroke="#3b82f6" style={{ marginLeft: '6px' }} />}</div>
                  <div className="winner-prize">{winner.prize}</div>
                  <div className="winner-value">{winner.value}</div>
                  <div className="winner-date">{winner.date}</div>
                </div>
              </div>
            ))}
            {filteredWinners.length === 0 && <div className="empty-community">No winners match this search.</div>}
          </div>
        )}

        {activeSection === 'fundraise' && (
          <div className="content-grid">
            {contentLoading && Array.from({ length: 3 }).map((_, idx) => <div key={`fundraise-skeleton-${idx}`} className="content-skeleton" />)}
            {filteredFundraises.map(fundraise => {
              const progress = fundraise.goal > 0 ? Math.min((fundraise.raised / fundraise.goal) * 100, 100) : 0;
              return (
                <div key={fundraise.id} className="fundraise-card">
                  <div className="card-image"><img src={fundraise.image} alt={fundraise.title} /></div>
                  <div className="fundraise-progress">
                    <h3 className="card-title">{fundraise.title}</h3>
                    <div className="progress-header">
                      <div><div className="raised-amount">${fundraise.raised.toLocaleString()}</div><div className="goal-amount">of ${fundraise.goal.toLocaleString()} goal</div></div>
                    </div>
                    <div className="progress-bar-container"><div className="progress-bar-inner" style={{ width: `${progress}%` }}></div></div>
                    <div className="card-info">
                      <div className="info-item"><Users size={14} /><span>{fundraise.donors.toLocaleString()} donors</span></div>
                      <div className="info-item"><Calendar size={14} /><span>{fundraise.date}</span></div>
                    </div>
                    <div style={{ marginTop: '16px' }}><div className="contribution-badge"><Heart size={16} /><span>Contributed ${fundraise.contribution.toLocaleString()}</span></div></div>
                  </div>
                </div>
              );
            })}
            {filteredFundraises.length === 0 && <div className="empty-community">No supported causes match this search.</div>}
          </div>
        )}

        {activeSection === 'followers' && (
          <div>
            <div className="community-search">
              <input type="text" placeholder="Search followers" value={followerSearch} onChange={(event) => setFollowerSearch(event.target.value)} />
              <button className="load-more-btn" onClick={() => { setFollowersLoading(true); setFollowerPage((prev) => prev + 1); }} disabled={followersList.length >= followersCount}>
                {followersList.length >= followersCount ? 'All loaded' : (<>{followersLoading && <span className="mini-spinner" />}<span>{followersLoading ? 'Loading...' : 'Load more'}</span></>)}
              </button>
            </div>
            <div className="empty-community" style={{ marginBottom: '12px' }}>Showing {filteredFollowers.length} of {followersCount} followers</div>
            <div className="community-grid">
              {filteredFollowers.length === 0 ? (
                <div className="empty-community">{followersLoading ? 'Loading followers...' : 'No followers found.'}</div>
              ) : (
                filteredFollowers.map((person) => (
                  <div key={person.id} className="community-card">
                    <a href={`/profiles/${person.id}`} className="community-card-main">
                      <img src={person.avatar_url || profile.avatar} alt={person.full_name || person.username || 'Profile'} className="community-avatar" />
                      <div><div className="community-name">{person.full_name || person.username || 'Onagui Member'}</div><div className="community-handle">@{person.username || 'onagui'}</div></div>
                    </a>
                    <div className="community-follow-slot">
                      <ProfileFollowButton targetProfileId={person.id} viewerIdOverride={viewerId} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {followersList.length >= followersCount && followersCount > 0 && (<div className="empty-community" style={{ marginTop: '16px' }}>End of followers list</div>)}
          </div>
        )}

        {activeSection === 'following' && (
          <div>
            <div className="community-search">
              <input type="text" placeholder="Search following" value={followingSearch} onChange={(event) => setFollowingSearch(event.target.value)} />
              <button className="load-more-btn" onClick={() => { setFollowingLoading(true); setFollowingPage((prev) => prev + 1); }} disabled={followingList.length >= followingCount}>
                {followingList.length >= followingCount ? 'All loaded' : (<>{followingLoading && <span className="mini-spinner" />}<span>{followingLoading ? 'Loading...' : 'Load more'}</span></>)}
              </button>
            </div>
            <div className="empty-community" style={{ marginBottom: '12px' }}>Showing {filteredFollowing.length} of {followingCount} following</div>
            <div className="community-grid">
              {filteredFollowing.length === 0 ? (
                <div className="empty-community">{followingLoading ? 'Loading following...' : 'No following found.'}</div>
              ) : (
                filteredFollowing.map((person) => (
                  <div key={person.id} className="community-card">
                    <a href={`/profiles/${person.id}`} className="community-card-main">
                      <img src={person.avatar_url || profile.avatar} alt={person.full_name || person.username || 'Profile'} className="community-avatar" />
                      <div><div className="community-name">{person.full_name || person.username || 'Onagui Member'}</div><div className="community-handle">@{person.username || 'onagui'}</div></div>
                    </a>
                    <div className="community-follow-slot">
                      <ProfileFollowButton targetProfileId={person.id} viewerIdOverride={viewerId} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {followingList.length >= followingCount && followingCount > 0 && (<div className="empty-community" style={{ marginTop: '16px' }}>End of following list</div>)}
          </div>
        )}
      </div>
    </div>
    <EditProfileModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      userId={profileData?.id || ''}
      onSaved={() => window.location.reload()}
    />
    {editingPostId && (
      <EditPostModal
        isOpen={!!editingPostId}
        onClose={() => setEditingPostId(null)}
        postId={editingPostId}
        postType={editingPostType}
        onSaved={() => window.location.reload()}
      />
    )}
    </>
  );
};

export default ONAGUIProfilePage;
