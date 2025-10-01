import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import File from '../../models/file';
import connectToDatabase from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await context.params;
        // Verify authentication
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        // Find file and verify ownership
        const file = await File.findOne({
            _id: id,
            userId: decoded.id
        });

        if (!file) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            file: {
                id: file._id.toString(),
                name: file.name,
                url: file.url,
                size: file.size,
                pageCount: file.pageCount || 1,
                status: file.status,
                uploadDate: file.uploadDate,
            }
        });

    } catch (error: any) {
        console.error('File fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file' },
            { status: 500 }
        );
    }
}
