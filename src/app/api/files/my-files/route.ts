import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthRequest } from '../../middleware/auth';
import connectToDatabase from '@/lib/mongodb';
import File from '../../models/file';

export async function GET(req: NextRequest) {
  // Auth
  const authResponse = await authMiddleware(req as AuthRequest);
  if (authResponse) return authResponse;

  try {
    await connectToDatabase();
    const user = (req as AuthRequest).user;

    const files = await File.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ files });
  } catch (err) {
    console.error("Fetching files error:", err);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
