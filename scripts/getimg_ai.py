#!/usr/bin/env python3
"""
GetImg AI Image Generation Script for Memory Garden
Generates realistic images using GetImg's API
"""

import os
import json
import requests
import base64
from datetime import datetime
from typing import Dict, Any, Optional

class GetImgAIGenerator:
    def __init__(self):
        self.api_key = os.getenv('GETIMG_API_KEY')
        if not self.api_key:
            raise ValueError("GETIMG_API_KEY environment variable is required")
        
        self.base_url = "https://api.getimg.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def generate_image(self, prompt: str, model: str = "stable-diffusion-xl", width: int = 1024, height: int = 1024) -> Dict[str, Any]:
        """Generate a single image using GetImg API"""
        try:
            url = f"{self.base_url}/{model}/text-to-image"
            
            payload = {
                "prompt": prompt,
                "width": width,
                "height": height
            }
            
            response = requests.post(url, headers=self.headers, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            
            if 'image' in result:
                # GetImg returns base64 encoded image
                image_data = result['image']
                
                return {
                    "success": True,
                    "image_data": image_data,
                    "text_response": f"Generated realistic image: {prompt[:50]}...",
                    "prompt": prompt,
                    "model": model,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": "No image data received from GetImg API",
                    "timestamp": datetime.now().isoformat()
                }
                
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            if "402" in error_msg or "quota_exceeded" in error_msg:
                return {
                    "success": False,
                    "error": "GetImg API quota exceeded. Please add credits to your account.",
                    "timestamp": datetime.now().isoformat()
                }
            return {
                "success": False,
                "error": f"GetImg API request failed: {error_msg}",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Image generation failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

    def generate_memory_visualization(self, memory_title: str, memory_description: str, style: str = "realistic") -> Dict[str, Any]:
        """Generate a realistic visualization for a memory"""
        # Create a detailed, realistic prompt
        prompt = f"""A beautiful, realistic photograph of: {memory_title}. 
        
        Scene description: {memory_description}
        
        Style: High-quality, professional photography, realistic, detailed, warm lighting, natural colors, cinematic composition, 8K resolution, photorealistic, sharp focus, beautiful natural lighting.
        
        The image should capture the essence and emotion of this memory in a realistic, photographic style that feels personal and meaningful."""
        
        return self.generate_image(prompt, model="stable-diffusion-xl")

    def generate_memory_icon(self, category: str, emotion: str = "neutral") -> Dict[str, Any]:
        """Generate a realistic icon for a memory category"""
        prompt = f"""A realistic, detailed icon representing {category} with {emotion} mood. 
        
        Style: Clean, realistic, professional, high-quality, detailed, warm colors, natural lighting, minimalist but detailed, 3D rendered style, photorealistic."""
        
        return self.generate_image(prompt, model="realistic-vision-v5", width=512, height=512)

    def generate_garden_background(self, style: str = "realistic") -> Dict[str, Any]:
        """Generate a realistic background for the memory garden"""
        prompt = f"""A beautiful, realistic garden background with soft natural lighting, lush green plants, gentle sunlight filtering through leaves, peaceful atmosphere, warm and inviting, high-quality photography, natural colors, detailed textures, cinematic composition."""
        
        return self.generate_image(prompt, model="stable-diffusion-xl")

    def generate_ai_artwork(self, memory_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate realistic artwork from memory data"""
        title = memory_data.get('title', 'Memory')
        description = memory_data.get('description', '')
        categories = memory_data.get('categories', [])
        emotions = memory_data.get('emotions', [])
        tags = memory_data.get('tags', '')
        
        category_text = ', '.join(categories) if categories else 'general'
        emotion_text = ', '.join(emotions) if emotions else 'peaceful'
        
        prompt = f"""A beautiful, realistic artwork representing: {title}
        
        Description: {description}
        Categories: {category_text}
        Mood: {emotion_text}
        Tags: {tags}
        
        Style: High-quality, realistic, professional photography, detailed, natural lighting, warm colors, cinematic composition, photorealistic, sharp focus, beautiful natural lighting, emotionally evocative."""
        
        return self.generate_image(prompt, model="stable-diffusion-xl")

def handle_api_request():
    """Handle API request from Next.js"""
    try:
        import sys
        input_data = json.loads(sys.stdin.read())
        
        ai = GetImgAIGenerator()
        
        prompt = input_data.get('prompt', '')
        memory_title = input_data.get('memoryTitle', '')
        memory_description = input_data.get('memoryDescription', '')
        category = input_data.get('category', '')
        emotion = input_data.get('emotion', '')
        style = input_data.get('style', 'realistic')
        type_param = input_data.get('type', 'custom')
        
        if type_param == "memory_visualization":
            result = ai.generate_memory_visualization(memory_title, memory_description, style)
        elif type_param == "category_icon":
            result = ai.generate_memory_icon(category, emotion or "neutral")
        elif type_param == "garden_background":
            result = ai.generate_garden_background(style)
        elif type_param == "ai_artwork":
            memory_data = {
                "title": memory_title,
                "description": memory_description,
                "categories": [category] if category else [],
                "emotions": [emotion] if emotion else [],
                "tags": input_data.get('tags', '')
            }
            result = ai.generate_ai_artwork(memory_data)
        else:  # custom
            result = ai.generate_image(prompt)
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result))

def main():
    """Test function for direct execution"""
    try:
        # Test with a simple prompt
        ai = GetImgAIGenerator()
        result = ai.generate_image("A beautiful realistic garden with flowers and sunlight")
        
        if result['success']:
            print("✅ GetImg API test successful!")
            print(f"Generated image with prompt: {result['prompt']}")
            print(f"Model: {result.get('model', 'unknown')}")
            print(f"Timestamp: {result['timestamp']}")
        else:
            print("❌ GetImg API test failed!")
            print(f"Error: {result['error']}")
            
        return result['success']
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    import sys
    if not sys.stdin.isatty():
        handle_api_request()
    else:
        success = main()
        exit(0 if success else 1)
