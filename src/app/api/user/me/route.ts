import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../models/user';
import connectToDatabase from '@/lib/mongodb';
import {authMiddleware} from '../../middleware/auth';
import { AuthRequest } from '../../middleware/auth';



export async function GET(request: NextRequest) {
  const authResponse = await authMiddleware(request as AuthRequest);
  if (authResponse) return authResponse;
  try {
    // Connect to database
    await connectToDatabase();

    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    // Find user by ID and populate files
    const user = await User.findById(decoded.id)
      .populate({
        path: 'files',
        select: 'name size pageCount uploadDate status url',
        options: { sort: { uploadDate: -1 } } // Sort files by upload date
      })
      .select('-password -googleId'); // Exclude sensitive fields

    if (!user) {
      console.log('User not found:', decoded.id);
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    // Format response data
    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      filesCount: user.files?.length || 0,
      files: user.files || [],
      memberSince: user.createdAt,
      lastUpdated: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      user: profileData
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Invalid authentication token' }, 
        { status: 401 }
      );
    }

    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Authentication token expired' }, 
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch profile' }, 
      { status: 500 }
    );
  }
}
