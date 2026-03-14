import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { Connection } from '@solana/web3.js'
import { createAdminSupabaseClient } from '@/utils/supabase/server-admin'
import { getCryptoById } from '@/lib/cryptoConfig'

type DonationPayload = {
  fundraiserId: string
  userId?: string | null
  amount: number
  currency: string
  transactionHash: string
  walletAddress: string
  blockchain: string
  donorName?: string | null
  message?: string | null
  isAnonymous?: boolean
}

type VerificationResult = {
  verified: boolean
  reason?: string
}

const TRANSFER_EVENT_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]

const normalizeAddress = (address: string) => address.toLowerCase()

const calculatePlatformFee = (amount: number) => (amount * 0.029) + 0.30

const calculateNetAmount = (amount: number) => amount - calculatePlatformFee(amount)

const verifyEvmTransaction = async (payload: DonationPayload): Promise<VerificationResult> => {
  const crypto = getCryptoById(payload.blockchain)
  if (!crypto?.rpcUrl || !crypto.platformWallet) {
    return { verified: false, reason: 'Missing RPC or platform wallet' }
  }

  const provider = new ethers.providers.JsonRpcProvider(crypto.rpcUrl)
  const receipt = await provider.getTransactionReceipt(payload.transactionHash)

  if (!receipt || receipt.status !== 1) {
    return { verified: false, reason: 'Transaction not confirmed' }
  }

  const platformWallet = normalizeAddress(crypto.platformWallet)
  const expectedAmount = ethers.utils.parseUnits(
    payload.amount.toString(),
    crypto.decimals
  )

  if (crypto.tokenAddress) {
    const iface = new ethers.utils.Interface(TRANSFER_EVENT_ABI)
    const tokenAddress = normalizeAddress(crypto.tokenAddress)
    let received = ethers.BigNumber.from(0)

    for (const log of receipt.logs) {
      if (normalizeAddress(log.address) !== tokenAddress) continue
      try {
        const parsed = iface.parseLog(log)
        if (normalizeAddress(parsed.args.to) === platformWallet) {
          received = received.add(parsed.args.value)
        }
      } catch (error) {
        continue
      }
    }

    if (received.gte(expectedAmount)) {
      return { verified: true }
    }

    return { verified: false, reason: 'Token transfer not found' }
  }

  const tx = await provider.getTransaction(payload.transactionHash)
  if (!tx || !tx.to || normalizeAddress(tx.to) !== platformWallet) {
    return { verified: false, reason: 'Transaction destination mismatch' }
  }

  if (tx.value.gte(expectedAmount)) {
    return { verified: true }
  }

  return { verified: false, reason: 'Transaction amount too low' }
}

const verifySolanaTransaction = async (payload: DonationPayload): Promise<VerificationResult> => {
  const crypto = getCryptoById(payload.blockchain)
  const rpcUrl = crypto?.rpcUrl || 'https://api.mainnet-beta.solana.com'
  const connection = new Connection(rpcUrl, 'confirmed')

  const parsedTx = await connection.getParsedTransaction(payload.transactionHash, {
    maxSupportedTransactionVersion: 0,
  })

  if (!parsedTx) {
    return { verified: false, reason: 'Transaction not found' }
  }

  const platformWallet = crypto?.platformWallet
  if (!platformWallet) {
    return { verified: false, reason: 'Missing platform wallet' }
  }

  const expectedLamports = payload.amount * Math.pow(10, crypto?.decimals || 9)
  let receivedLamports = 0

  for (const instruction of parsedTx.transaction.message.instructions) {
    if ('parsed' in instruction && instruction.parsed?.type === 'transfer') {
      const info = instruction.parsed.info as { destination?: string; lamports?: number }
      if (info.destination === platformWallet && typeof info.lamports === 'number') {
        receivedLamports += info.lamports
      }
    }
  }

  if (receivedLamports >= expectedLamports) {
    return { verified: true }
  }

  return { verified: false, reason: 'Transfer not found' }
}

const isAmountReasonable = (amount: number) => amount > 0 && amount < 1000000

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DonationPayload

    if (!body.fundraiserId || !body.transactionHash || !body.blockchain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isAmountReasonable(body.amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const crypto = getCryptoById(body.blockchain)
    if (!crypto) {
      return NextResponse.json({ error: 'Unsupported blockchain' }, { status: 400 })
    }

    let verification: VerificationResult = { verified: false, reason: 'Pending verification' }

    if (crypto.chainId) {
      verification = await verifyEvmTransaction(body)
    } else if (crypto.id === 'solana') {
      verification = await verifySolanaTransaction(body)
    }

    const status = verification.verified ? 'confirmed' : 'pending'
    const supabase = await createAdminSupabaseClient() as any

    const { data: existingDonation, error: lookupError } = await supabase
      .from('donations')
      .select('id, status')
      .eq('transaction_hash', body.transactionHash)
      .maybeSingle()

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 })
    }

    if (existingDonation) {
      if (verification.verified && existingDonation.status !== 'confirmed') {
        await supabase
          .from('donations')
          .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('id', existingDonation.id)
      }

      return NextResponse.json({
        verified: verification.verified,
        status: verification.verified ? 'confirmed' : existingDonation.status,
      })
    }

    const platformFee = calculatePlatformFee(body.amount)
    const netAmount = calculateNetAmount(body.amount)

    const { error: insertError } = await supabase
      .from('donations')
      .insert({
        fundraiser_id: body.fundraiserId,
        user_id: body.userId || null,
        amount: body.amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        currency: body.currency,
        donor_name: body.isAnonymous ? null : body.donorName || 'Anonymous',
        message: body.message || null,
        is_anonymous: body.isAnonymous || false,
        transaction_hash: body.transactionHash,
        wallet_address: body.walletAddress,
        blockchain: body.blockchain,
        status,
        confirmed_at: verification.verified ? new Date().toISOString() : null,
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      verified: verification.verified,
      status,
      reason: verification.reason,
    })
  } catch (error: any) {
    console.error('Donation verification error:', error)
    return NextResponse.json({ error: 'Failed to verify donation' }, { status: 500 })
  }
}
