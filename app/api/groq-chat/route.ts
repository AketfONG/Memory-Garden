import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Prepare messages for Groq
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

    // Get Groq client
    const groq = getGroqClient();

    // Call Groq API with streaming
    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile', // Free tier model
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    // Create a ReadableStream to send chunked responses
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              // Send each chunk as JSON
              const data = JSON.stringify({
                type: 'chunk',
                content: content,
              }) + '\n';
              controller.enqueue(encoder.encode(data));
            }
          }

          // Send final complete response
          const finalData = JSON.stringify({
            type: 'complete',
            content: fullResponse,
          }) + '\n';
          controller.enqueue(encoder.encode(finalData));
          controller.close();
        } catch (error) {
          console.error('Groq streaming error:', error);
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
    console.error('Groq chat API error:', error);
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

