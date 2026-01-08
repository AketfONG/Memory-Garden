# GetImg API Setup for Memory Garden

## Overview
Memory Garden now uses GetImg API for generating realistic, high-quality images for memory visualizations. GetImg provides excellent realistic image generation with models like Essential V2 and Stable Diffusion XL.

## Setup Instructions

### 1. Get Your API Key
1. Visit [GetImg.ai](https://getimg.ai)
2. Sign up or log in to your account
3. Navigate to the "API Keys" section in your dashboard
4. Create a new API key
5. Copy the API key (it starts with `key-`)

### 2. Add Credits to Your Account
- GetImg uses a pay-as-you-go model
- Essential V2: $0.015 per 1 million pixelsteps
- For a 1024x1024 image: approximately $0.035 per image
- Add credits to your account to start generating images

### 3. Configure Environment Variables
Add your GetImg API key to your `.env.local` file:

```bash
# GetImg AI (for realistic image generation)
GETIMG_API_KEY=your-getimg-api-key-here
```

### 4. Test the Integration
Once you've added credits and configured the API key, test the integration:

```bash
# Test GetImg API directly
GETIMG_API_KEY=your-key-here python3 scripts/getimg_ai.py

# Test the hybrid API (tries GetImg first, falls back to free alternative)
curl -X POST http://localhost:3000/api/generate-image-hybrid \
  -H "Content-Type: application/json" \
  -d '{
    "type": "memory_visualization",
    "memoryTitle": "Beach Sunset",
    "memoryDescription": "A beautiful sunset over the ocean",
    "style": "realistic"
  }'
```

## Features

### Available Models
- **Essential V2**: Highest quality, recommended for realistic images
- **Stable Diffusion XL**: High quality at lower cost
- **FLUX [schnell]**: Fast generation

### Image Types
- Memory visualizations
- Category icons
- Garden backgrounds
- Custom AI artwork

### Fallback System
If GetImg quota is exceeded, the system will:
1. Try GetImg first (for realistic images)
2. Fall back to free alternatives if available
3. Show appropriate error messages

## Pricing
- Essential V2: $0.015 per 1M pixelsteps
- Stable Diffusion XL: Lower cost option
- Pay only for what you use
- No monthly subscriptions

## Troubleshooting

### "Quota Exceeded" Error
- Add credits to your GetImg account
- Check your account balance in the GetImg dashboard

### "Invalid API Key" Error
- Verify your API key is correct
- Make sure it's properly set in `.env.local`
- Restart your development server after adding the key

### Image Generation Fails
- Check your internet connection
- Verify GetImg service status
- Check the console for detailed error messages

## Support
- GetImg Documentation: https://docs.getimg.ai
- GetImg Support: Contact through their website
- Memory Garden Issues: Check the project repository







