import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Prepare messages for Google AI
    const messages = conversationHistory || [];
    
    // Add system message if not present
    if (!messages.some((msg: any) => msg.role === 'system')) {
      messages.unshift({
        role: 'system',
        content: 'You are Sprout, a compassionate and nurturing AI companion in Memory Garden. You help users reflect on their memories with empathy and understanding. Be warm, natural, and genuinely curious about their experiences. Keep responses conversational and concise (under 200 words).'
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Create a streaming response using Python script
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Execute Python script for Google AI streaming
          const pythonScript = path.join(process.cwd(), 'scripts', 'google_ai_stream.py');
          const scriptDir = path.join(process.cwd(), 'scripts');
          
          // Use cross-platform Python detection
          const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
          
          const pythonProcess = spawn(pythonCommand, [
            pythonScript,
            message,
            JSON.stringify(messages)
          ], {
            env: {
              ...process.env,
              PYTHONPATH: scriptDir,
              PYTHONUNBUFFERED: '1'
            },
            cwd: scriptDir
          });

          let buffer = '';
          
          pythonProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.trim()) {
                try {
                  const parsed = JSON.parse(line.trim());
                  if (parsed.type === 'chunk' && parsed.content) {
                    const data = JSON.stringify({
                      type: 'chunk',
                      content: parsed.content,
                    }) + '\n';
                    controller.enqueue(encoder.encode(data));
                  } else if (parsed.type === 'complete' && parsed.content) {
                    const finalData = JSON.stringify({
                      type: 'complete',
                      content: parsed.content,
                    }) + '\n';
                    controller.enqueue(encoder.encode(finalData));
                    controller.close();
                  } else if (parsed.type === 'error') {
                    const errorData = JSON.stringify({
                      type: 'error',
                      error: parsed.error || 'Unknown error',
                    }) + '\n';
                    controller.enqueue(encoder.encode(errorData));
                    controller.close();
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          });

          pythonProcess.stderr.on('data', (data) => {
            console.error('Python stderr:', data.toString());
          });

          pythonProcess.on('close', (code) => {
            if (code !== 0) {
              const errorData = JSON.stringify({
                type: 'error',
                error: `Python process exited with code ${code}`,
              }) + '\n';
              controller.enqueue(encoder.encode(errorData));
            }
            controller.close();
          });

          pythonProcess.on('error', (error) => {
            console.error('Python process error:', error);
            const errorData = JSON.stringify({
              type: 'error',
              error: error.message,
            }) + '\n';
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          });
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : String(error),
          }) + '\n';
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Google AI chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get AI response',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

