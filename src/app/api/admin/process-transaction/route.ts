import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { decryptPlatformKey } from '../../../../utils/keyStorage';
import { updateTransactionStatus } from '../../../../utils/transactionLedger';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { transactionId, adminPassphrase, secondApprover } = await request.json();
    
    if (!transactionId || !adminPassphrase) {
      return NextResponse.json(
        { error: 'Transaction ID and admin passphrase are required' },
        { status: 400 }
      );
    }
    
    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (txError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Check if transaction is already processed
    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { error: 'Transaction is already being processed or completed' },
        { status: 400 }
      );
    }
    
    // For large withdrawals, require second approver
    const isLargeWithdrawal = 
      transaction.type === 'withdrawal' && 
      transaction.amount > 1000; // Threshold for "large" withdrawal
    
    if (isLargeWithdrawal && !secondApprover) {
      return NextResponse.json(
        { error: 'Second approver is required for large withdrawals' },
        { status: 400 }
      );
    }
    
    // Verify second approver if required
    if (isLargeWithdrawal) {
      const { data: approver, error: approverError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', secondApprover)
        .single();
      
      if (approverError || !approver || approver.role !== 'admin' || approver.id === user.id) {
        return NextResponse.json(
          { error: 'Invalid second approver' },
          { status: 400 }
        );
      }
    }
    
    try {
      // Try to decrypt platform key to verify admin passphrase
      const platformKey = decryptPlatformKey(adminPassphrase);
      
      // Update transaction status to processing
      await updateTransactionStatus(transactionId, 'processing');
      
      // For withdrawals, initiate blockchain transaction
      if (transaction.type === 'withdrawal') {
        // In a real implementation, this would call a blockchain service
        // to send the funds using the platform key
        console.log(`Processing withdrawal of ${transaction.amount} ${transaction.currency}`);
        console.log(`Using platform key: ${platformKey.substring(0, 5)}...`);
        console.log(`Sending to address: ${transaction.metadata.address}`);
        
        // For demo purposes, we'll just update the status after a delay
        // In production, you would listen for blockchain confirmation
        setTimeout(async () => {
          await updateTransactionStatus(transactionId, 'completed', {
            txHash: `0x${Math.random().toString(16).substring(2, 42)}` // Mock tx hash
          });
        }, 5000);
      } else {
        // For other transaction types, just mark as completed
        await updateTransactionStatus(transactionId, 'completed');
      }
      
      // Create audit log
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'transaction_processed',
          details: {
            transaction_id: transactionId,
            type: transaction.type,
            amount: transaction.amount,
            currency: transaction.currency,
            second_approver: secondApprover || null
          }
        });
      
      return NextResponse.json({
        success: true,
        message: 'Transaction is being processed'
      });
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      
      // Create audit log for failed attempt
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'transaction_process_failed',
          details: {
            transaction_id: transactionId,
            error: error.message
          }
        });
      
      return NextResponse.json(
        { error: 'Invalid admin passphrase or processing error' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in process-transaction API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}