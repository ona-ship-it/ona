import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from '@/utils/adminAuth';

export const GET = withAdminAuth(async (req: NextRequest, user: any) => {
  return NextResponse.json({ 
    ok: true, 
    user: {
      id: user.id,
      email: user.email,
      role: 'admin'
    }
  });
});

export const POST = withAdminAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    return NextResponse.json({ 
      ok: true, 
      message: 'Admin action processed',
      data: body,
      admin: {
        id: user.id,
        email: user.email,
        role: 'admin'
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
