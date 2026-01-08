import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const memoryContext = formData.get('memoryContext') as string || '';
    const memoryTitle = formData.get('memoryTitle') as string || '';
    const memoryDescription = formData.get('memoryDescription') as string || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.type;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Validate file types
    const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const supportedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    
    if (!supportedImageTypes.includes(fileType) && !supportedVideoTypes.includes(fileType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unsupported file type. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, MOV, AVI, WebM)' 
        },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Please upload files smaller than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // Determine media type
    const isImage = supportedImageTypes.includes(fileType);
    const mediaType = isImage ? 'image' : 'video';
    const mimeType = fileType;

    // Create temporary file path for analysis
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `${Date.now()}_${fileName}`);
    
    // Write file to temporary location
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    try {
      // Call Python script for media analysis
      const pythonScript = path.join(process.cwd(), 'scripts', 'google_ai_multimodal.py');
      const scriptDir = path.join(process.cwd(), 'scripts');
      
      // Escape paths and strings for safe shell execution
      const escapedScriptDir = scriptDir.replace(/'/g, "'\\''");
      const escapedTempFilePath = tempFilePath.replace(/'/g, "'\\''");
      const escapedMemoryContext = memoryContext.replace(/'/g, "'\\''");
      
      // Use cross-platform Python detection
      const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
      
      const pythonProcess = spawn(pythonCommand, [
        '-c',
        `import sys; sys.path.insert(0, '${escapedScriptDir}'); from google_ai_multimodal import GoogleAIMultimodal; import json; ai = GoogleAIMultimodal(); result = ai.analyze_memory_media('${escapedTempFilePath}', '${mediaType}', '${escapedMemoryContext}'); print(json.dumps(result))`
      ], {
        env: {
          ...process.env,
          PYTHONPATH: scriptDir,
          PYTHONUNBUFFERED: '1'
        },
        cwd: scriptDir
      });

      let pythonOutput = '';
      let pythonError = '';

      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
      });

      const analysisResult = await new Promise<any>((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Python script failed: ${pythonError}`));
            return;
          }
          try {
            const result = JSON.parse(pythonOutput);
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${pythonOutput}`));
          }
        });
      });

      // Clean up temporary file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }

      if (!analysisResult.success) {
        return NextResponse.json(
          { success: false, error: analysisResult.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        analysis: analysisResult.response,
        insights: analysisResult.insights || null,
        mediaType: mediaType,
        fileName: fileName,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      });

    } catch (analysisError) {
      // Clean up temporary file on error
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }
      
      throw analysisError;
    }

  } catch (error) {
    console.error('Media analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze media file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Media Analysis API',
    supportedTypes: {
      images: ['JPEG', 'PNG', 'GIF', 'WebP'],
      videos: ['MP4', 'MOV', 'AVI', 'WebM']
    },
    maxFileSize: '10MB',
    endpoints: {
      POST: 'Upload a file for AI analysis'
    }
  });
}







