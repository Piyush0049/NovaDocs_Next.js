import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import connectToDatabase from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends NextRequest {
  user?: any;
}

// For API routes, do not return NextResponse.next()
export async function authMiddleware(req: AuthRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    await connectToDatabase();

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    req.user = user; // attach user to request
    return null; // indicate success
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
