import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

// Lazily-initialised Deepgram client so build doesn't fail when no API key is set
let deepgram: ReturnType<typeof createClient> | null = null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // If no API key is configured, gracefully return an error instead of crashing build/runtime
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deepgram transcription is not configured on this deployment.',
        },
        { status: 503 }
      );
    }

    // Initialise client only when needed and only when key exists
    if (!deepgram) {
      deepgram = createClient(apiKey);
    }

    // Convert File to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe with Deepgram
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: 'nova-2',
        language: 'en-US',
        punctuate: true,
        interim_results: false,
      }
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Transcription failed' },
        { status: 500 }
      );
    }

    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}



