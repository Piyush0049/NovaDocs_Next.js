import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthRequest } from '../../middleware/auth';
import connectToDatabase from '@/lib/mongodb';
import File from '../../models/file';
import User from '../../models/user';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  // Authentication
  const authResponse = await authMiddleware(req as AuthRequest);
  if (authResponse) return authResponse;

  try {
    const formData = await req.formData();
    const uploadedFile = formData.get('file');

    if (!uploadedFile || !(uploadedFile instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await uploadedFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // handles pdfs too
          folder: 'pdfs',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Save to DB
    await connectToDatabase();
    const user = (req as AuthRequest).user;

    const fileDoc = await File.create({
      name: result.public_id,
      originalName: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      url: result.secure_url,
      userId: user._id,
    });

    await User.findByIdAndUpdate(user._id, { $push: { files: fileDoc._id } });

    return NextResponse.json({ success: true, file: fileDoc });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}
