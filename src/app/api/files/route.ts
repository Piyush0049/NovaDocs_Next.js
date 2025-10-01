import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import connectToDatabase from '@/lib/mongodb';
import File from '../models/file';

export async function GET(req: NextRequest) {
  // Check authentication
  const authResponse = await authMiddleware(req as AuthRequest);
  if (authResponse) return authResponse;

  try {
    // Connect to database
    await connectToDatabase();
    
    // Get user files
    const user = (req as AuthRequest).user;
    const files = await File.find({ userId: user._id }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error: any) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}