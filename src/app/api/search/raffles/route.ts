import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

interface SearchQuery {
  search?: string
  filter?: 'active' | 'completed' | 'cancelled' | 'all'
  sort?: 'newest' | 'popular' | 'ending-soon'
  limit: number
  offset: number
  categoryId?: string
  minPrice?: number
  maxPrice?: number
}

interface RaffleSearchResult {
  id: string
  title: string
  description?: string
  image_urls?: string[]
  prize_value: number
  prize_currency: string
  base_ticket_price: number
  total_tickets: number
  tickets_sold: number
  status: string
  end_date: string
  creator_id?: string
  creator_name?: string
  creator_avatar_url?: string
}

interface SearchResponse {
  raffles: RaffleSearchResult[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

type CreatorJoin = {
  full_name?: string | null
  avatar_url?: string | null
}

type RaffleRow = {
  id: string
  title: string
  description?: string | null
  image_urls?: string[] | null
  prize_value: number
  prize_currency: string
  base_ticket_price: number
  total_tickets: number
  tickets_sold?: number | null
  status: string
  end_date: string
  creator_id?: string | null
  creator?: CreatorJoin | null
}

/**
 * GET /api/search/raffles
 * Search and filter raffles with full-text search capability
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
      categoryId: searchParams.get('categoryId') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    }

    // Validate query
    if (query.limit < 1) query.limit = 20
    if (query.offset < 0) query.offset = 0

    const limit = query.limit ?? 20
    const offset = query.offset ?? 0

    // Get Supabase client
    const supabase = await createClient()

    // Build base query
    let raffleQuery = supabase
      .from('raffles')
      .select(
        `
        id,
        title,
        description,
        image_urls,
        prize_value,
        prize_currency,
        base_ticket_price,
        total_tickets,
        tickets_sold,
        status,
        end_date,
        creator_id,
        creator:onagui_profiles(full_name, avatar_url)
      `,
        { count: 'exact' }
      )

    // Apply status filter
    if (query.filter !== 'all') {
      raffleQuery = raffleQuery.eq('status', query.filter)
    } else {
      raffleQuery = raffleQuery.in('status', ['active', 'completed', 'cancelled'])
    }

    // Apply text search if provided
    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim().toLowerCase()
      // Supabase full-text search using ilike (case-insensitive like)
      raffleQuery = raffleQuery.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
    }

    // Apply price range filter
    if (query.minPrice !== undefined) {
      raffleQuery = raffleQuery.gte('prize_value', query.minPrice)
    }
    if (query.maxPrice !== undefined) {
      raffleQuery = raffleQuery.lte('prize_value', query.maxPrice)
    }

    // Apply category filter if provided
    if (query.categoryId) {
      raffleQuery = raffleQuery.eq('category_id', query.categoryId)
    }

    // Apply sorting
    switch (query.sort) {
      case 'popular':
        raffleQuery = raffleQuery.order('tickets_sold', { ascending: false })
        break
      case 'ending-soon':
        raffleQuery = raffleQuery.order('end_date', { ascending: true })
        break
      case 'newest':
      default:
        raffleQuery = raffleQuery.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    raffleQuery = raffleQuery.range(offset, offset + limit - 1)

    // Execute query
    const { data, error, count } = await raffleQuery

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }

    // Format response
    const raffles = (data || []).map((raffle: RaffleRow) => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      image_urls: raffle.image_urls,
      prize_value: raffle.prize_value,
      prize_currency: raffle.prize_currency,
      base_ticket_price: raffle.base_ticket_price,
      total_tickets: raffle.total_tickets,
      tickets_sold: raffle.tickets_sold || 0,
      status: raffle.status,
      end_date: raffle.end_date,
      creator_id: raffle.creator_id,
      creator_name: raffle.creator?.full_name,
      creator_avatar_url: raffle.creator?.avatar_url,
    }))

    const response: SearchResponse = {
      raffles,
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: unknown) {
    console.error('Search endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
