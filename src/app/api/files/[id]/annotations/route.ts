import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Annotation from '@/app/api/models/annotation';
import File from '@/app/api/models/file';
import connectToDatabase from '@/lib/mongodb';

// GET annotations for a file
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ params is now async
) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    // Await params
    const { id } = await context.params;

    // Verify file ownership
    const file = await File.findOne({ _id: id, userId: decoded.id });
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const annotations = await Annotation.find({ fileId: id }).sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      annotations: annotations.map(ann => ({
        id: ann._id.toString(),
        type: ann.type,
        page: ann.page,
        x: ann.x,
        y: ann.y,
        width: ann.width,
        height: ann.height,
        color: ann.color,
        content: ann.content,
        fontSize: ann.fontSize,
        fontFamily: ann.fontFamily,
        opacity: ann.opacity,
        strokeWidth: ann.strokeWidth,
        points: ann.points,
        createdAt: ann.createdAt,
        updatedAt: ann.updatedAt,
      }))
    });

  } catch (error: any) {
    console.error('Annotations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch annotations' }, { status: 500 });
  }
}

// POST annotations for a file
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ params is async here too
) {
  try {
    await connectToDatabase();

    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    // Await params
    const { id } = await context.params;

    // Verify file ownership
    const file = await File.findOne({ _id: id, userId: decoded.id });
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { annotations } = await request.json();

    // Delete existing annotations for this file
    await Annotation.deleteMany({ fileId: id });

    // Insert new annotations
    const annotationDocs = annotations.map((ann: any) => ({
      fileId: id,
      type: ann.type,
      page: ann.page,
      x: ann.x,
      y: ann.y,
      width: ann.width,
      height: ann.height,
      color: ann.color,
      content: ann.content,
      fontSize: ann.fontSize,
      fontFamily: ann.fontFamily,
      opacity: ann.opacity,
      strokeWidth: ann.strokeWidth,
      points: ann.points,
    }));

    if (annotationDocs.length > 0) {
      await Annotation.insertMany(annotationDocs);
    }

    return NextResponse.json({
      success: true,
      message: 'Annotations saved successfully'
    });

  } catch (error: any) {
    console.error('Annotations save error:', error);
    return NextResponse.json({ error: 'Failed to save annotations' }, { status: 500 });
  }
}
