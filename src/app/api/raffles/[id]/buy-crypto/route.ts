import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { validateWalletAddress, validatePositiveNumber } from '@/utils/validators'

type PaymentMethod = 'solana' | 'bitcoin' | 'ethereum'

interface CryptoPaymentRequest {
  quantity: number
  paymentMethod: PaymentMethod
  walletAddress: string
  transactionHash: string
  amountPaid?: number
}

interface TicketPurchaseResponse {
  ticketId: string
  raffleId: string
  quantity: number
  totalPrice: number
  currency: string
  paymentMethod: PaymentMethod
  status: 'pending' | 'confirmed'
  ticketNumbers: number[]
  transactionHash: string
  confirmedAt: string
}

/**
 * POST /api/raffles/{id}/buy-crypto
 * Purchase raffle tickets using cryptocurrency
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: raffleId } = await context.params

    // Parse request body
    let body: CryptoPaymentRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate input
    const validationErrors = validateCryptoPaymentInput(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = await createClient()

    // Fetch raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single()

    if (raffleError || !raffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      )
    }

    // Check raffle status
    if (raffle.status !== 'active') {
      return NextResponse.json(
        { error: `Raffle is no longer active (status: ${raffle.status})` },
        { status: 409 }
      )
    }

    // Check if raffle has ended
    if (new Date(raffle.end_date) < new Date()) {
      return NextResponse.json(
        { error: 'Raffle has ended' },
        { status: 409 }
      )
    }

    // Check ticket availability
    const availableTickets = raffle.total_tickets - (raffle.tickets_sold || 0)
    if (body.quantity > availableTickets) {
      return NextResponse.json(
        { error: `Not enough tickets available. Only ${availableTickets} left.` },
        { status: 400 }
      )
    }

    // Verify transaction (mock verification - in production, query blockchain)
    const transactionVerified = await verifyTransaction(
      body.transactionHash,
      body.paymentMethod,
      body.walletAddress,
      calculateTotalPrice(raffle.base_ticket_price, body.quantity)
    )

    if (!transactionVerified) {
      return NextResponse.json(
        { error: 'Transaction verification failed' },
        { status: 400 }
      )
    }

    // Get current user (for authenticated endpoints)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Calculate ticket numbers (sequential starting from next available)
    const startTicketNumber = (raffle.tickets_sold || 0) + 1
    const ticketNumbers = Array.from(
      { length: body.quantity },
      (_, i) => startTicketNumber + i
    )

    // Create ticket record
    const { data: ticket, error: ticketError } = await supabase
      .from('raffle_tickets')
      .insert({
        raffle_id: raffleId,
        user_id: user?.id || body.walletAddress, // Use wallet address as anonymous user ID
        quantity: body.quantity,
        ticket_numbers: ticketNumbers,
        payment_method: body.paymentMethod,
        transaction_hash: body.transactionHash,
        wallet_address: body.walletAddress,
        amount_paid: calculateTotalPrice(raffle.base_ticket_price, body.quantity),
        status: 'confirmed',
        verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return NextResponse.json(
        { error: 'Failed to create ticket record' },
        { status: 500 }
      )
    }

    // Update raffle ticket count
    const newTicketsSold = (raffle.tickets_sold || 0) + body.quantity
    const { error: updateError } = await supabase
      .from('raffles')
      .update({ tickets_sold: newTicketsSold })
      .eq('id', raffleId)

    if (updateError) {
      console.error('Error updating raffle:', updateError)
      // Rollback ticket creation
      await supabase.from('raffle_tickets').delete().eq('id', ticket.id)
      return NextResponse.json(
        { error: 'Failed to update raffle' },
        { status: 500 }
      )
    }

    // Create activity log
    const { error: activityError } = await supabase.from('activity_logs').insert({
      user_id: user?.id || body.walletAddress,
      action: 'ticket_purchased',
      resource_type: 'raffle',
      resource_id: raffleId,
      metadata: {
        quantity: body.quantity,
        paymentMethod: body.paymentMethod,
        transactionHash: body.transactionHash,
      },
    })

    if (activityError) {
      console.error('Failed to log activity:', activityError)
    }

    // Return success response
    const response: TicketPurchaseResponse = {
      ticketId: ticket.id,
      raffleId,
      quantity: body.quantity,
      totalPrice: calculateTotalPrice(raffle.base_ticket_price, body.quantity),
      currency: getCurrencyForPaymentMethod(body.paymentMethod),
      paymentMethod: body.paymentMethod,
      status: 'confirmed',
      ticketNumbers,
      transactionHash: body.transactionHash,
      confirmedAt: new Date().toISOString(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? error.message : 'Unknown error'
    console.error('Crypto payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: errorDetails },
      { status: 500 }
    )
  }
}

/**
 * Validate crypto payment input
 */
function validateCryptoPaymentInput(body: CryptoPaymentRequest): string[] {
  const errors: string[] = []

  if (!body.quantity || !validatePositiveNumber(body.quantity, 1, 100)) {
    errors.push('Quantity must be between 1 and 100')
  }

  if (!body.paymentMethod || !['solana', 'bitcoin', 'ethereum'].includes(body.paymentMethod)) {
    errors.push('Invalid payment method. Must be: solana, bitcoin, or ethereum')
  }

  if (!body.walletAddress) {
    errors.push('Wallet address is required')
  } else if (!validateWalletAddress(body.walletAddress, body.paymentMethod)) {
    errors.push(`Invalid wallet address for ${body.paymentMethod} network`)
  }

  if (!body.transactionHash || body.transactionHash.length < 20) {
    errors.push('Invalid transaction hash')
  }

  return errors
}

/**
 * Verify transaction on blockchain (mock implementation)
 * In production, this would query the actual blockchain RPC
 */
async function verifyTransaction(
  transactionHash: string,
  _paymentMethod: PaymentMethod,
  _walletAddress: string,
  _expectedAmount: number
): Promise<boolean> {
  try {
    // Mock verification - in production, implement proper blockchain verification
    // Check transaction length and format
    if (!transactionHash || transactionHash.length < 20) {
      return false
    }

    // Simulate blockchain verification delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    // For now, allow all valid-looking transactions
    // TODO: Implement actual blockchain verification using:
    // - Solana: web3.js getSignatureStatus()
    // - Ethereum: etherscan API or web3.js getTransactionReceipt()
    // - Bitcoin: blockchain.com API

    return true
  } catch (error) {
    console.error('Transaction verification error:', error)
    return false
  }
}

/**
 * Calculate total price for tickets
 */
function calculateTotalPrice(basePrice: number, quantity: number): number {
  return basePrice * quantity
}

/**
 * Get currency symbol for payment method
 */
function getCurrencyForPaymentMethod(method: PaymentMethod): string {
  switch (method) {
    case 'solana':
      return 'SOL'
    case 'bitcoin':
      return 'BTC'
    case 'ethereum':
      return 'ETH'
    default:
      return 'CRYPTO'
  }
}
