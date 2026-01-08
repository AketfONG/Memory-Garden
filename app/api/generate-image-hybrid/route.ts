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

    // Try Google AI Studio first (free tier available)
    let result = await tryGoogleAIImageGeneration(body);
    
    // If Google AI Studio fails, try GetImg as fallback
    if (!result.success) {
      console.log('Google AI Studio failed, trying GetImg fallback:', result.error);
      result = await tryGetImgGeneration(body);
    }

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
      provider: result.provider || 'unknown',
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

async function tryGetImgGeneration(inputData: any): Promise<any> {
  return new Promise((resolve) => {
    const pythonScript = path.join(process.cwd(), 'scripts', 'getimg_ai.py');
    const pythonProcess = spawn('python3', [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GETIMG_API_KEY: process.env.GETIMG_API_KEY }
    });

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const parsedOutput = JSON.parse(output);
          parsedOutput.provider = 'getimg';
          resolve(parsedOutput);
        } catch (parseError) {
          resolve({ success: false, error: `Failed to parse GetImg output: ${output}` });
        }
      } else {
        resolve({ success: false, error: `GetImg script failed with code ${code}: ${errorOutput}` });
      }
    });
  });
}

async function tryGoogleAIImageGeneration(inputData: any): Promise<any> {
  return new Promise((resolve) => {
    const pythonScript = path.join(process.cwd(), 'scripts', 'google_ai_image_generation.py');
    // Use cross-platform Python detection
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    const pythonProcess = spawn(pythonCommand, [pythonScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY },
      cwd: path.join(process.cwd(), 'scripts')
    });

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const parsedOutput = JSON.parse(output);
          parsedOutput.provider = 'google-ai-studio';
          resolve(parsedOutput);
        } catch (parseError) {
          resolve({ success: false, error: `Failed to parse Google AI output: ${output}` });
        }
      } else {
        resolve({ success: false, error: `Google AI image generation failed with code ${code}: ${errorOutput}` });
      }
    });
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Hybrid Image Generation API',
    providers: {
      primary: 'Google AI Studio (Imagen - free tier)',
      fallback: 'GetImg (realistic images)'
    },
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
    ]
  });
}







