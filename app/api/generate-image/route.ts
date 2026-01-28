import { NextRequest, NextResponse } from 'next/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_KEY;
const IMAGEN_MODEL = 'google/imagen-4-fast';

// Helper: use GPT-4o-mini (via Replicate) to turn a Cantonese description
// into a concise, vivid English visual description for Imagen 4.
async function ensureEnglishDescription(
  originalDescription: string | undefined,
  memoryTitle?: string | null
): Promise<string | undefined> {
  if (!originalDescription || !REPLICATE_API_TOKEN) return originalDescription;

  // Only bother if we see CJK characters (likely Cantonese/Chinese)
  if (!/[\u3400-\u9FFF]/.test(originalDescription)) {
    return originalDescription;
  }

  try {
    const translatePrompt = `
You help generate accurate images from Cantonese memory descriptions.

Title (may be empty): ${memoryTitle || "N/A"}

Here is the memory description in Cantonese:
"""${originalDescription}"""

Task:
- Rewrite this as a concise, vivid ENGLISH description that focuses on what should appear in the image
- Mention key people, objects, setting, time of day, and overall mood if known
- Use at most 2 sentences
- Do NOT explain the task, just return the final English description text
`.trim();

    const createRes = await fetch(
      "https://api.replicate.com/v1/models/openai/gpt-4o-mini/predictions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          input: {
            prompt: translatePrompt,
          },
        }),
      }
    );

    const prediction = await createRes.json();
    if (!createRes.ok) {
      console.error("[imagen] translate create error:", prediction);
      return originalDescription;
    }

    let result = prediction;
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const pollRes = await fetch(result.urls.get, {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
      });
      result = await pollRes.json();
    }

    if (result.status !== "succeeded" || !result.output) {
      console.error("[imagen] translate prediction failed:", result);
      return originalDescription;
    }

    let textOutput: string;
    if (Array.isArray(result.output)) {
      textOutput = result.output.join("\n");
    } else if (typeof result.output === "string") {
      textOutput = result.output;
    } else {
      textOutput = JSON.stringify(result.output);
    }

    const cleaned = textOutput.replace(/\s+/g, " ").trim();
    return cleaned || originalDescription;
  } catch (err) {
    console.error("[imagen] translate error:", err);
    return originalDescription;
  }
}

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

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'REPLICATE_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Build the image generation prompt
    let imagePrompt = '';
    
    if (type === "custom" && prompt) {
      imagePrompt = prompt;
    } else if (type === "memory_visualization") {
      // If the description is Cantonese/Chinese, translate to English first for better Imagen 4 accuracy
      const englishDescription = await ensureEnglishDescription(
        memoryDescription,
        memoryTitle
      );

      imagePrompt = `A beautiful, warm, and emotional visualization of a memory: ${
        memoryTitle || 'A precious moment'
      }. ${englishDescription || ''} ${category ? `Category: ${category}.` : ''} ${
        emotion ? `Emotion: ${emotion}.` : ''
      } Style: ${style}. Create an image that captures the essence and feeling of this memory with warmth and nostalgia.`;
    } else if (type === "category_icon") {
      imagePrompt = `A simple, elegant icon representing the category "${category}". Minimalist design, clean lines, suitable for a memory garden app.`;
    } else if (type === "garden_background") {
      imagePrompt = `A peaceful, serene background for a memory garden. Soft colors, gentle atmosphere, ${style} style. Perfect for displaying memories.`;
    } else if (type === "ai_artwork") {
      imagePrompt = `Create beautiful AI artwork inspired by: ${memoryTitle || 'a memory'}. ${memoryDescription || ''} Style: ${style}. Emotion: ${emotion || 'peaceful'}.`;
    } else {
      imagePrompt = `A beautiful image: ${prompt || memoryTitle || 'a memory'}. Style: ${style}.`;
    }

    if (!imagePrompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required for image generation' },
        { status: 400 }
      );
    }

    try {
      // Call Replicate's non-streaming HTTP API to create a prediction
      const createRes = await fetch(`https://api.replicate.com/v1/models/${IMAGEN_MODEL}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          input: {
            prompt: imagePrompt,
          },
        }),
      });

      const prediction = await createRes.json();

      if (!createRes.ok) {
        console.error('Replicate create prediction error:', prediction);
        return NextResponse.json(
          {
            success: false,
            error: prediction?.error || 'Failed to create image prediction',
          },
          { status: 500 }
        );
      }

      // Poll until the prediction is finished
      let result = prediction;
      while (result.status === 'starting' || result.status === 'processing') {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const pollRes = await fetch(result.urls.get, {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        });
        const polled = await pollRes.json();
        result = polled;
      }

      if (result.status !== 'succeeded' || !result.output) {
        console.error('Replicate prediction did not succeed:', result);
        return NextResponse.json(
          { success: false, error: 'No image URL returned from Replicate' },
          { status: 500 }
        );
      }

      // result.output is either a URL string or an array of URLs
      let imageUrl: string | null = null;
      if (Array.isArray(result.output) && typeof result.output[0] === 'string') {
        imageUrl = result.output[0] as string;
      } else if (typeof result.output === 'string') {
        imageUrl = result.output as string;
      }

      if (!imageUrl) {
        console.error('Unexpected Replicate prediction output format:', result.output);
        return NextResponse.json(
          { success: false, error: 'No image URL returned from Replicate' },
          { status: 500 }
        );
      }

      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        const errorText = await imageResponse.text().catch(() => '');
        return NextResponse.json(
          { success: false, error: `Failed to fetch image URL: ${errorText || imageResponse.statusText}` },
          { status: 500 }
        );
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const dataUrl = `data:image/png;base64,${base64Image}`;

      return NextResponse.json({
        success: true,
        imageData: dataUrl,
        textResponse: `Generated ${type} image using google/imagen-4-fast on Replicate`,
        prompt: imagePrompt,
        type: type,
        provider: 'google/imagen-4-fast',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Replicate image generation error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate image with Replicate',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

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

export async function GET() {
  return NextResponse.json({
    message: 'Image Generation API (Replicate - google/imagen-4-fast)',
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
    ],
    model: 'google/imagen-4-fast',
    size: '1024x1024'
  });
}
