import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { testTitle, testDescription } = await request.json();

    if (!testTitle || !testDescription) {
      return NextResponse.json(
        { error: 'Missing testTitle or testDescription' },
        { status: 400 }
      );
    }

    console.log('Processing AI test with:', { testTitle, testDescription });

    // Execute Python script for Google AI
    const pythonScript = path.join(process.cwd(), 'scripts', 'test_google_ai_simple.py');
    const scriptDir = path.join(process.cwd(), 'scripts');
    
    console.log('Python script path:', pythonScript);
    console.log('Script directory:', scriptDir);
    console.log('Current working directory:', process.cwd());
    
    // Use cross-platform Python detection
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    const pythonProcess = spawn(pythonCommand, [pythonScript, testTitle, testDescription], {
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
            console.log('AI test result:', result);
            resolve(NextResponse.json(result));
          } else {
            console.log('No valid JSON found in Python output');
            resolve(NextResponse.json(
              { 
                success: false, 
                error: 'Failed to parse Python output',
                raw_output: pythonOutput,
                raw_error: pythonError,
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
              raw_error: pythonError,
              timestamp: new Date().toISOString()
            },
            { status: 500 }
          ));
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error('Python process error:', error);
        resolve(NextResponse.json(
          { 
            success: false, 
            error: 'Python process failed to start',
            details: error.message,
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        ));
      });
    });

  } catch (error) {
    console.error('Error processing AI test:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process AI test',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 