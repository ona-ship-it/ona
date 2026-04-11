import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

interface SearchQuery {
  search?: string
  filter?: 'active' | 'completed' | 'cancelled' | 'all'
  sort?: 'newest' | 'popular' | 'ending-soon'
  limit: number
  offset: number
  isFree?: boolean
  minPrice?: number
  maxPrice?: number
}

interface GiveawaySearchResult {
  id: string
  title: string
  description?: string
  emoji?: string
  image_url?: string
  prize_value: number
  prize_currency: string
  is_free: boolean
  ticket_price?: number
  tickets_sold: number
  total_tickets: number
  status: string
  end_date: string
  creator_id?: string
  creator_name?: string
  creator_avatar_url?: string
}

interface SearchResponse {
  giveaways: GiveawaySearchResult[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

type CreatorJoin = {
  full_name?: string | null
  avatar_url?: string | null
}

type GiveawayRow = {
  id: string
  title: string
  description?: string | null
  emoji?: string | null
  image_url?: string | null
  prize_value: number
  prize_currency: string
  is_free: boolean
  ticket_price?: number | null
  tickets_sold?: number | null
  total_tickets: number
  status: string
  end_date: string
  creator_id?: string | null
  creator?: CreatorJoin | null
}

/**
 * GET /api/search/giveaways
 * Search and filter giveaways with full-text search capability
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const query: SearchQuery = {
      search: searchParams.get('search') || undefined,
      filter: (searchParams.get('filter') || 'active') as SearchQuery['filter'],
      sort: (searchParams.get('sort') || 'newest') as SearchQuery['sort'],
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      offset: parseInt(searchParams.get('offset') || '0'),
      isFree: searchParams.get('isFree') === 'true' ? true : searchParams.get('isFree') === 'false' ? false : undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    }

    // Validate query
    if (query.limit < 1) query.limit = 20
    if (query.offset < 0) query.offset = 0

    // Get Supabase client
    const supabase = await createClient()

    // Build base query
    let giveawayQuery = supabase
      .from('giveaways')
      .select(
        `
        id,
        title,
        description,
        emoji,
        image_url,
        prize_value,
        prize_currency,
        is_free,
        ticket_price,
        tickets_sold,
        total_tickets,
        status,
        end_date,
        creator_id,
        creator:onagui_profiles(full_name, avatar_url)
      `,
        { count: 'exact' }
      )

    // Apply status filter
    if (query.filter !== 'all') {
      giveawayQuery = giveawayQuery.eq('status', query.filter)
    } else {
      giveawayQuery = giveawayQuery.in('status', ['active', 'completed', 'cancelled'])
    }

    // Apply free/paid filter
    if (query.isFree !== undefined) {
      giveawayQuery = giveawayQuery.eq('is_free', query.isFree)
    }

    // Apply text search if provided
    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim().toLowerCase()
      giveawayQuery = giveawayQuery.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
    }

    // Apply prize value filter
    if (query.minPrice !== undefined) {
      giveawayQuery = giveawayQuery.gte('prize_value', query.minPrice)
    }
    if (query.maxPrice !== undefined) {
      giveawayQuery = giveawayQuery.lte('prize_value', query.maxPrice)
    }

    // Apply sorting
    switch (query.sort) {
      case 'popular':
        giveawayQuery = giveawayQuery.order('tickets_sold', { ascending: false })
        break
      case 'ending-soon':
        giveawayQuery = giveawayQuery.order('end_date', { ascending: true })
        break
      case 'newest':
      default:
        giveawayQuery = giveawayQuery.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    giveawayQuery = giveawayQuery.range(query.offset, query.offset + query.limit - 1)

    // Execute query
    const { data, error, count } = await giveawayQuery

    if (error) {
      console.error('Giveaway search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    // Format response
    const giveaways = (data || []).map((giveaway: GiveawayRow) => ({
      id: giveaway.id,
      title: giveaway.title,
      description: giveaway.description,
      emoji: giveaway.emoji,
      image_url: giveaway.image_url,
      prize_value: giveaway.prize_value,
      prize_currency: giveaway.prize_currency,
      is_free: giveaway.is_free,
      ticket_price: giveaway.ticket_price,
      tickets_sold: giveaway.tickets_sold || 0,
      total_tickets: giveaway.total_tickets,
      status: giveaway.status,
      end_date: giveaway.end_date,
      creator_id: giveaway.creator_id,
      creator_name: giveaway.creator?.full_name,
      creator_avatar_url: giveaway.creator?.avatar_url,
    }))

    const response: SearchResponse = {
      giveaways,
      total: count || 0,
      limit: query.limit,
      offset: query.offset,
      hasMore: (query.offset + query.limit) < (count || 0),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: unknown) {
    console.error('Giveaway search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
