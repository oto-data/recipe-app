import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Uploaded photos live in public/uploads/, but a production server does not
// serve files added to public/ after it started. This route serves them
// dynamically so a photo is visible immediately after upload.
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

export async function GET(request: Request, context: any) {
  const { params } = context;
  const filename = path.basename(String(params.filename ?? ''));
  const contentType = CONTENT_TYPE_BY_EXTENSION[path.extname(filename).toLowerCase()];

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
