import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

// Default AI configuration
const defaultConfig = {
  personality: {
    role: "compassionate_therapist",
    tone: "warm_and_empathetic",
    style: "gentle_and_supportive",
    approach: "listening_and_reflecting"
  },
  responses: {
    greeting: "I'm here to listen and support you. What's on your heart today? 💚",
    fallback: "I hear you. Take your time - I'm here with you. 💚",
    encouragement: "You're doing great. Keep sharing what feels right for you.",
    reflection: "That sounds like it's bringing up some real feelings for you.",
    closing: "Thank you for sharing with me. I'm here whenever you need to talk."
  },
  therapeutic_techniques: {
    active_listening: true,
    reflective_responses: true,
    emotional_validation: true,
    gentle_questioning: true,
    mindfulness_prompts: true
  },
  conversation_flow: {
    max_response_length: 200,
    use_emojis: true,
    ask_follow_up_questions: true,
    acknowledge_emotions: true,
    provide_safe_space: true
  },
  custom_prompts: {
    memory_sharing: "Tell me more about this memory. What makes it special to you?",
    emotional_exploration: "What feelings come up when you think about this?",
    support_offering: "How can I best support you right now?",
    reflection_request: "Would you like to explore this further?"
  }
};

function getConfigPath() {
  return path.join(process.cwd(), 'scripts', 'ai_config.json');
}

function loadConfig() {
  try {
    const configPath = getConfigPath();
    if (existsSync(configPath)) {
      const configData = readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
    return defaultConfig;
  } catch (error) {
    console.error('Error loading config:', error);
    return defaultConfig;
  }
}

function saveConfig(config: any) {
  try {
    const configPath = getConfigPath();
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

export async function GET() {
  try {
    const config = loadConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('AI Config GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config: newConfig } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'update_config':
        const currentConfig = loadConfig();
        const updatedConfig = { ...currentConfig, ...newConfig };
        const success = saveConfig(updatedConfig);
        result = { success, config: updatedConfig };
        break;
      case 'reset_config':
        const resetSuccess = saveConfig(defaultConfig);
        result = { success: resetSuccess, config: defaultConfig };
        break;
      case 'export_config':
        const config = loadConfig();
        result = { success: true, config_json: JSON.stringify(config, null, 2) };
        break;
      case 'import_config':
        const importSuccess = saveConfig(newConfig);
        result = { success: importSuccess, config: newConfig };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Config POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}

 