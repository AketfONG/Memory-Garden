import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const memoryContext = (formData.get('memoryContext') as string) || '';
    const memoryTitle = (formData.get('memoryTitle') as string) || '';
    const memoryDescription = (formData.get('memoryDescription') as string) || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'REPLICATE_API_KEY not configured' },
        { status: 500 }
      );
    }

    const fileType = file.type;
    const fileName = file.name;
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!supportedImageTypes.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file type. Please upload an image (JPEG, PNG, GIF, WebP). Video analysis is not supported yet.',
        },
        { status: 400 }
      );
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Please upload files smaller than 20MB' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL for Replicate vision API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageDataUrl = `data:${fileType};base64,${base64}`;

    console.log('[analyze-media] Starting BLIP call...');
    console.log('[analyze-media] File name:', fileName);
    console.log('[analyze-media] File type:', fileType);
    console.log('[analyze-media] File size:', file.size);
    console.log('[analyze-media] Image data URL length:', imageDataUrl.length);

    // Use Salesforce BLIP on Replicate to understand image context
    let blipOutput;
    try {
      blipOutput = await replicate.run(
        'salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746',
        {
          input: {
            image: imageDataUrl,
            task: 'image_captioning',
          },
        }
      );
      console.log('[analyze-media] BLIP API call succeeded, output type:', typeof blipOutput);
    } catch (replicateError: any) {
      console.error('[analyze-media] BLIP API error:', replicateError);
      const errorMessage = replicateError?.message || replicateError?.toString() || 'Unknown BLIP error';
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to analyze image with BLIP',
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    // Normalize BLIP output to a caption string
    let caption =
      Array.isArray(blipOutput) && blipOutput.length > 0
        ? String(blipOutput.join('\n'))
        : typeof blipOutput === 'string'
        ? blipOutput
        : JSON.stringify(blipOutput);

    caption = caption.trim();

    // Combine BLIP caption with any provided user context for downstream use
    let analysis = caption || 'Could not analyze the image.';
    if (memoryTitle || memoryDescription || memoryContext) {
      analysis += '\n\nAdditional context:';
      if (memoryTitle) analysis += `\n- Title: ${memoryTitle}`;
      if (memoryDescription) analysis += `\n- Description: ${memoryDescription}`;
      if (memoryContext) analysis += `\n- User note: ${memoryContext}`;
    }

    console.log('[analyze-media] BLIP caption:', caption.substring(0, 200));

    const insights = `Based on the BLIP image analysis: ${analysis}`;

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      mediaType: 'image',
      fileName,
      fileSize: file.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Media analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze media file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Media Analysis API (Replicate - salesforce/blip)',
    supportedTypes: {
      images: ['JPEG', 'PNG', 'GIF', 'WebP'],
    },
    maxFileSize: '20MB',
    model: 'salesforce/blip via Replicate',
    endpoints: {
      POST: 'Upload an image file for AI analysis',
    },
  });
}
