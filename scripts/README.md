# AI Testing with DeepSeek Integration

This directory contains Python scripts for integrating DeepSeek AI with Memory Garden's testing functionality.

## Files

- `deepseek_ai.py` - Main Python module for DeepSeek AI integration
- `requirements.txt` - Python dependencies
- `README.md` - This file

## Setup

1. **Install Python dependencies:**
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

2. **Set up DeepSeek API key:**
   - Get your API key from [DeepSeek](https://platform.deepseek.com/)
   - Add it to your `.env.local` file:
     ```
     DEEPSEEK_API_KEY="your-deepseek-api-key"
     ```

## Usage

### Python Function

```python
from deepseek_ai import process_memory_garden_test

# Process test inputs
result = process_memory_garden_test(
    test_title="AI Image Generation Test",
    test_description="Testing the AI image generation feature with memory descriptions"
)

print(result)
```

### API Endpoints

The integration provides two API endpoints:

1. **POST /api/ai-test** - Process test inputs and get AI response
   ```json
   {
     "testTitle": "Test Title",
     "testDescription": "Test Description",
     "mediaFiles": ["file1.jpg", "file2.mp4"]
   }
   ```

2. **POST /api/ai-chat** - Continue conversation with AI
   ```json
   {
     "message": "User message",
     "conversationHistory": [...],
     "testContext": {...}
   }
   ```

## Features

- **Test Context Processing**: Analyzes test title and description
- **Conversation Continuity**: Maintains conversation history
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Media Support**: Ready for future media file integration

## Error Handling

The system includes comprehensive error handling:
- API connection failures
- Invalid API keys
- Network timeouts
- Malformed responses

All errors are logged and user-friendly fallback responses are provided. 