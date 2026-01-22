import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

// POST upload file
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya türü. Sadece JPEG, PNG, GIF ve WebP dosyaları kabul edilir.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB - increased for larger images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.' },
        { status: 400 }
      );
    }

    // Create uploads directory if not exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomString}.jpg`; // Always save as JPEG

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with Sharp
    const MIN_WIDTH = 2000;
    const image = sharp(buffer);
    const metadata = await image.metadata();

    let processedImage = image;

    // If image width is less than 2000px, resize to 2000px (upscale)
    // If image width is more than 2000px, resize to 2000px (downscale)
    if (metadata.width !== MIN_WIDTH) {
      processedImage = image.resize(MIN_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: false, // Allow upscaling
      });
    }

    // Convert to JPEG with quality optimization
    const optimizedBuffer = await processedImage
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, optimizedBuffer);

    // Build full URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`).replace(/\/+$/, '');
    const fullUrl = `${baseUrl}/uploads/${filename}`;

    // Get final image metadata
    const finalMetadata = await sharp(optimizedBuffer).metadata();

    return NextResponse.json({
      success: true,
      url: fullUrl,
      filename,
      size: optimizedBuffer.length,
      type: 'image/jpeg',
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      processedWidth: finalMetadata.width,
      processedHeight: finalMetadata.height,
      wasResized: metadata.width !== MIN_WIDTH,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 });
  }
}
