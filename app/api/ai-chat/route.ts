import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, testContext } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Processing chat message:', { message, conversationHistory: conversationHistory?.length, testContext });

    // Call Python script for chat continuation
    const result = await callPythonChat(message, conversationHistory, testContext);
    
    console.log('Chat result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

async function callPythonChat(message: string, conversationHistory: any[] = [], testContext: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptsDir = path.join(process.cwd(), 'scripts');
    const pythonScript = path.join(scriptsDir, 'chat_api_simple.py');
    
    console.log('Executing chat Python script:', pythonScript);
    console.log('With message:', message);
    
    const pythonProcess = spawn('python3', [
      pythonScript,
      message,
      JSON.stringify(conversationHistory),
      JSON.stringify(testContext)
    ], {
      env: {
        ...process.env,
        PYTHONPATH: scriptsDir,
        PYTHONUNBUFFERED: '1'
      },
      cwd: scriptsDir
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const dataStr = data.toString();
      console.log('Python stdout:', dataStr);
      output += dataStr;
    });

    pythonProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      console.log('Python stderr:', dataStr);
      errorOutput += dataStr;
    });

    pythonProcess.on('close', (code) => {
      console.log('Python process closed with code:', code);
      console.log('Python output:', output);
      console.log('Python error output:', errorOutput);
      
      if (code === 0) {
        try {
          // Find the JSON in the output (it might be mixed with debug text)
          const lines = output.split('\n');
          let jsonLine = '';
          for (const line of lines) {
            if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
              jsonLine = line.trim();
              break;
            }
          }
          
          if (jsonLine) {
            const result = JSON.parse(jsonLine);
            resolve(result);
          } else {
            console.error('No JSON found in output:', output);
            reject(new Error(`No JSON found in Python output`));
          }
        } catch (e) {
          console.error('Failed to parse Python output:', output);
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      } else {
        console.error('Python script failed with code:', code);
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
} 