import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get token from request cookies to verify it exists
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      console.log('Token found, deleting...');
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
      tokenExisted: !!token
    });

    // Delete the token cookie using NextResponse
    response.cookies.delete('token');

    // Alternative method for better compatibility
    response.cookies.set('token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed' 
      },
      { status: 500 }
    );
  }
}
