import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from '@/utils/adminAuth';

export const GET = withAdminAuth(async (req: NextRequest, user: any) => {
  // If we reach here, authentication and admin checks have passed
  return NextResponse.json({ 
    ok: true, 
    user: {
      id: user.id,
      email: user.email,
      role: 'admin' // User is confirmed admin if they reach this point
    }
  });
});

// Handle POST requests for admin actions
export const POST = withAdminAuth(async (req: NextRequest, user: any) => {
  try {
    // Handle admin actions here
    const body = await req.json();
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Admin action processed',
      data: body,
      admin: {
        id: user.id,
        email: user.email,
        role: 'admin' // User is confirmed admin if they reach this point
      }
    });

  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
});