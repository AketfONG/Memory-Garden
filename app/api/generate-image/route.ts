import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      memoryTitle, 
      memoryDescription, 
      category, 
      emotion, 
      style = "realistic",
      type = "custom" 
    } = body;

    if (!prompt && type === "custom") {
      return NextResponse.json(
        { success: false, error: 'Prompt is required for custom image generation' },
        { status: 400 }
      );
    }

    // Call Python script for image generation (Google AI Studio)
    const pythonScript = path.join(process.cwd(), 'scripts', 'google_ai_image_generation.py');
    
    // Use cross-platform Python detection
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    const pythonProcess = spawn(pythonCommand, [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY },
      cwd: path.join(process.cwd(), 'scripts')
    });

    // Send input data to Python script
    const inputData = JSON.stringify({
      prompt,
      memoryTitle,
      memoryDescription,
      category,
      emotion,
      style,
      type
    });

    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    // Collect output
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Wait for process to complete
    const result = await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const parsedOutput = JSON.parse(output);
            resolve(parsedOutput);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${output}`));
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        }
      });
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageData: result.image_data,
      textResponse: result.text_response,
      prompt: result.prompt,
      type: type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image Generation API',
    types: {
      custom: 'Generate image from custom prompt',
      memory_visualization: 'Generate visualization of a memory',
      category_icon: 'Generate icon for memory category',
      garden_background: 'Generate background for memory garden',
      ai_artwork: 'Generate AI artwork from memory data'
    },
    styles: [
      'realistic',
      'artistic', 
      'dreamy',
      'minimalist',
      'watercolor',
      'sketch'
    ],
    themes: [
      'peaceful',
      'magical',
      'nostalgic',
      'minimalist',
      'tropical',
      'zen'
    ]
  });
}
