import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

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

    // Build a single prompt including system instruction and history
    const systemInstruction =
      'You are Sprout, a compassionate and nurturing AI companion in Memory Garden. You help users reflect on their memories with empathy and understanding. Be warm, natural, and genuinely curious about their experiences. Keep responses conversational and concise (under 200 words).';

    let prompt = systemInstruction + '\n\n';

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (!msg || !msg.content) continue;
        const roleLabel = msg.role === 'assistant' ? 'Sprout' : 'User';
        prompt += `${roleLabel}: ${msg.content}\n`;
      }
    }

    prompt += `User: ${message}\nSprout:`;

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          // Use Replicate SDK streaming, but only accumulate on the server
          // and send ONE final message to the client to avoid duplicated text.
          for await (const event of replicate.stream('openai/gpt-4o-mini', {
            input: {
              prompt,
            },
          })) {
            const chunk = String(event);
            fullResponse += chunk;
          }

          const finalData = JSON.stringify({
            type: 'complete',
            content: fullResponse,
          }) + '\n';
          controller.enqueue(encoder.encode(finalData));
          controller.close();
        } catch (error) {
          console.error('Replicate chat streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
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
    console.error('Replicate chat API error:', error);
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
