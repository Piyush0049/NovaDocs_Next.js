import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthRequest } from '../../middleware/auth';
import connectToDatabase from '@/lib/mongodb';
import File from '../../models/file';
import User from '../../models/user';
import cloudinary from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  // Check authentication
  const authResponse = await authMiddleware(req as AuthRequest);
  if (authResponse) return authResponse;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert buffer to base64
    const base64File = buffer.toString('base64');
    const base64Data = `data:${file.type};base64,${base64File}`;
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        {
          resource_type: 'auto',
          folder: 'novadocs',
          public_id: uuidv4(),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // Connect to database
    await connectToDatabase();
    
    // Save file information to database
    const user = (req as AuthRequest).user;
    const fileDoc = await File.create({
      name: (result as any).public_id,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: (result as any).secure_url,
      userId: user._id,
    });
    
    // Update user's files array
    await User.findByIdAndUpdate(
      user._id,
      { $push: { files: fileDoc._id } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      file: fileDoc,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}