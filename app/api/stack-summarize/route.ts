import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'REPLICATE_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt } = body as { prompt?: string };

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call Replicate non-streaming for a clean JSON response
    const rawOutput = await replicate.run('openai/gpt-4o-mini', {
      input: { prompt },
    });

    let textOutput: string;
    if (Array.isArray(rawOutput)) {
      textOutput = rawOutput.join('\n');
    } else if (typeof rawOutput === 'string') {
      textOutput = rawOutput;
    } else {
      textOutput = JSON.stringify(rawOutput);
    }

    // Clean and extract JSON object
    let jsonCandidate = textOutput
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const firstBrace = jsonCandidate.indexOf('{');
    const lastBrace = jsonCandidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonCandidate = jsonCandidate.slice(firstBrace, lastBrace + 1);
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonCandidate);
    } catch {
      parsed = {};
    }

    // Regex fallbacks for explicit JSON fields – allow spaces inside the key name, e.g. " title "
    // Use non-greedy match and only take the first occurrence
    const titleMatch = textOutput.match(/"\s*title\s*"\s*:\s*"([^"]*?)"/i);
    const summaryMatch = textOutput.match(/"\s*summary\s*"\s*:\s*"([^"]*?)"/i);
    const emojiMatch = textOutput.match(/"\s*emoji\s*"\s*:\s*"([^"]*?)"/i);

    if (titleMatch && titleMatch[1]) {
      parsed.title = titleMatch[1];
    }
    if (summaryMatch && summaryMatch[1]) {
      parsed.summary = summaryMatch[1];
    }
    if (emojiMatch && emojiMatch[1]) {
      parsed.emoji = emojiMatch[1];
    }

    // Helper: fix spacing inside CJK (Chinese/Japanese/Korean) text, e.g. "藝 廊 開 幕" -> "藝廊開幕"
    const fixCJKSpacing = (value: string): string => {
      if (!value) return value;
      // Only bother if there is at least one CJK character
      if (!/[\u3400-\u9FFF]/.test(value)) {
        return value;
      }
      let cleaned = value;
      const cjkGap = /([\u3400-\u9FFF])\s+([\u3400-\u9FFF])/g;
      // Repeatedly remove spaces between CJK characters
      while (cjkGap.test(cleaned)) {
        cleaned = cleaned.replace(cjkGap, "$1$2");
      }
      return cleaned;
    };

    // Enhanced normalization: clean up spacing and limit title length
    const normalize = (value: unknown): string => {
      if (typeof value !== 'string') return '';
      // Collapse multiple spaces to single space, trim
      let cleaned = value.replace(/\s+/g, ' ').trim();
      // Fix weird spacing in Chinese/CJK output
      cleaned = fixCJKSpacing(cleaned);
      return cleaned;
    };

    // Special normalization for titles: fix split words, limit length and clean up
    const normalizeTitle = (value: unknown): string => {
      if (typeof value !== 'string') return '';
      // Collapse multiple spaces to single space, trim
      let cleaned = value.replace(/\s+/g, ' ').trim();
      // Fix weird spacing in Chinese/CJK output
      cleaned = fixCJKSpacing(cleaned);

      // Heuristic fix for words that were split by the model, e.g. "Celebr Ation" -> "Celebration"
      const rawWords = cleaned.split(/\s+/).filter(Boolean);
      const mergedWords: string[] = [];
      // Common suffixes that sometimes get split into their own “word”
      const suffixes = ['ation', 'ative', 'antic', 'iversary', 'iking', 'ing', 'tion', 'sion', 'ment', 'ness'];

      let i = 0;
      while (i < rawWords.length) {
        const current = rawWords[i];
        const next = rawWords[i + 1];

        if (next) {
          const currentLower = current.toLowerCase();
          const nextLower = next.toLowerCase();

          // Case 1: common suffixes accidentally split, e.g. "Celebr Ation"
          if (suffixes.includes(nextLower)) {
            mergedWords.push(currentLower + nextLower);
            i += 2;
            continue;
          }

          // Case 2: single-letter prefix split from the rest, e.g. "H iking"
          if (currentLower.length === 1 && nextLower.length >= 3) {
            mergedWords.push((currentLower + nextLower).toLowerCase());
            i += 2;
            continue;
          }
        }

        mergedWords.push(current.toLowerCase());
        i += 1;
      }

      // Limit to first 8 words to prevent overly long titles
      let finalWords = mergedWords;
      if (finalWords.length > 8) {
        finalWords = finalWords.slice(0, 8);
      }

      return finalWords.join(' ');
    };

    let title = normalizeTitle(parsed.title);
    let summary = normalize(parsed.summary);
    let emoji = normalize(parsed.emoji);

    // Extract tags if present (array or comma-separated string)
    let tags: string[] = [];
    try {
      if (Array.isArray(parsed.tags)) {
        tags = parsed.tags
          .filter((t: unknown) => typeof t === 'string' && t.trim().length > 0)
          .map((t: string) => t.trim().toLowerCase());
      } else if (typeof parsed.tags === 'string') {
        tags = parsed.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
          .map((t) => t.toLowerCase());
      } else {
        // Regex fallback if `tags` was not parsed into `parsed`
        const tagsMatch = textOutput.match(/"\s*tags\s*"\s*:\s*\[(.*?)\]/is);
        if (tagsMatch && tagsMatch[1]) {
          const raw = `[${tagsMatch[1]}]`;
          const parsedArray = JSON.parse(raw);
          if (Array.isArray(parsedArray)) {
            tags = parsedArray
              .filter((t: unknown) => typeof t === 'string' && t.trim().length > 0)
              .map((t: string) => t.trim().toLowerCase());
          }
        }
      }
    } catch {
      tags = [];
    }

    // If summary is still empty, be less strict: use the whole model output
    if (!summary && textOutput.trim()) {
      summary = textOutput.trim();
    }

    // If title is empty or just a generic fallback like "New Memory Stack",
    // derive a short title from the summary instead (first 6–8 words).
    if (
      !title ||
      /^new memory stack$/i.test(title.trim())
    ) {
      const source = summary || textOutput;
      const firstLine = source.split('\n')[0];
      const words = firstLine.split(/\s+/).filter(Boolean);
      title = words.slice(0, 8).join(' ');
      // Normalize the derived title as well
      title = normalizeTitle(title);
    }

    // If emoji is empty, derive a meaningful one from the summary/text (do NOT grab braces, etc.)
    if (!emoji) {
      const source = `${title} ${summary} ${textOutput}`.toLowerCase();

      if (source.includes('birthday') || source.includes('cake')) {
        emoji = '🎂';
      } else if (source.includes('beach') || source.includes('ocean') || source.includes('sea')) {
        emoji = '🏖️';
      } else if (source.includes('hike') || source.includes('hiking') || source.includes('mountain')) {
        emoji = '🏔️';
      } else if (source.includes('family')) {
        emoji = '👨‍👩‍👧‍👦';
      } else if (source.includes('friends')) {
        emoji = '👥';
      } else if (source.includes('dinner') || source.includes('restaurant') || source.includes('meal')) {
        emoji = '🍽️';
      } else if (source.includes('sunset') || source.includes('sunrise') || source.includes('sun')) {
        emoji = '🌅';
      } else if (source.includes('work') || source.includes('project') || source.includes('achievement')) {
        emoji = '🏆';
      } else {
        // Generic fallback
        emoji = '📸';
      }
    }

    return NextResponse.json({
      success: true,
      raw: textOutput,
      title,
      summary,
      emoji,
      tags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[stack-summarize] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to summarize stack',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stack Summarization API (Replicate - openai/gpt-4o-mini)',
    expectedOutputShape:
      '{"title": "<short warm title>", "summary": "<1-2 sentence summary>", "emoji": "<single emoji>"}',
  });
}

