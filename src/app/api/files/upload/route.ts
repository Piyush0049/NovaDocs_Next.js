import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthRequest } from '../../middleware/auth';
import connectToDatabase from '@/lib/mongodb';
import File from '../../models/file';
import User from '../../models/user';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `files/${fileName}`);
    
    // Upload file to Firebase Storage
    const uploadTask = uploadBytesResumable(storageRef, buffer, {
      contentType: file.type,
    });
    
    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress monitoring if needed
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          // Handle errors
          reject(error);
        },
        () => {
          // Upload completed successfully
          resolve(null);
        }
      );
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
    // Connect to database
    await connectToDatabase();
    
    // Save file information to database
    const user = (req as AuthRequest).user;
    const fileDoc = await File.create({
      name: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: downloadURL,
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