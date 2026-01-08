import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

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

    if (!process.env.DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Deepgram API key not configured' },
        { status: 500 }
      );
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



