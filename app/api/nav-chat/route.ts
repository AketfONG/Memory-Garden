import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemInstruction =
      'You are Sprout, the Memory Garden assistant. Help users navigate the app, understand features, and answer questions about planting memories, viewing their garden, taking tours, and other features. Be friendly, helpful, and concise.';

    let prompt = systemInstruction + '\n\n';

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        if (!msg || !msg.content) continue;
        const roleLabel = msg.role === 'assistant' ? 'Sprout' : 'User';
        prompt += `${roleLabel}: ${msg.content}\n`;
      }
    }

    prompt += `User: ${message}\nSprout:`;

    try {
      // Use Replicate SDK
      const output = await replicate.run('openai/gpt-4o-mini', {
        input: {
          prompt,
        },
      });

      const aiText = Array.isArray(output) ? output.join('\n') : String(output);

      return NextResponse.json({
        success: true,
        ai_response: aiText,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Replicate navigation chat API error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to get AI response',
          details: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

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
