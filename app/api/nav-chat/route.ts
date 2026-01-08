import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Processing navigation chat with:', { message, conversationHistory });

    // Execute Python script for Google AI
    const pythonScript = path.join(process.cwd(), 'scripts', 'nav_chat_google_ai.py');
    
    // Use cross-platform Python detection
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    const pythonProcess = spawn(pythonCommand, [pythonScript, message, JSON.stringify(conversationHistory)], {
      env: {
        ...process.env,
        PYTHONPATH: path.join(process.cwd(), 'scripts'),
        PYTHONUNBUFFERED: '1'
      },
      cwd: path.join(process.cwd(), 'scripts')
    });

    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
      console.log('Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
      console.log('Python stderr:', data.toString());
    });

    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        console.log('Python process closed with code:', code);
        console.log('Python output:', pythonOutput);
        console.log('Python error output:', pythonError);

        try {
          // Try to parse the JSON response
          const lines = pythonOutput.split('\n');
          let jsonLine = '';
          
          for (const line of lines) {
            if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
              jsonLine = line.trim();
              break;
            }
          }

          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            console.log('Navigation chat result:', result);
            resolve(NextResponse.json(result));
          } else {
            console.log('No valid JSON found in Python output');
            resolve(NextResponse.json(
              { 
                success: false, 
                error: 'Failed to parse Python output',
                raw_output: pythonOutput,
                timestamp: new Date().toISOString()
              },
              { status: 500 }
            ));
          }
        } catch (error) {
          console.log('Failed to parse Python output:', error);
          resolve(NextResponse.json(
            { 
              success: false, 
              error: 'Failed to parse Python output',
              raw_output: pythonOutput,
              timestamp: new Date().toISOString()
            },
            { status: 500 }
          ));
        }
      });
    });

  } catch (error) {
    console.error('Error processing navigation chat:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process navigation chat',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 