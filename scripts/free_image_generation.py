#!/usr/bin/env python3
"""
Free Image Generation Fallback for Memory Garden
Uses Hugging Face's free inference API as a fallback
"""

import os
import json
import requests
import base64
from datetime import datetime
from typing import Dict, Any

class FreeImageGenerator:
    def __init__(self):
        self.api_key = os.getenv('HUGGINGFACE_API_KEY')
        self.base_url = "https://api-inference.huggingface.co/models"
        
        if self.api_key:
            self.headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        else:
            self.headers = {"Content-Type": "application/json"}

    def generate_image(self, prompt: str, model: str = "stabilityai/stable-diffusion-xl-base-1.0") -> Dict[str, Any]:
        """Generate a single image using Hugging Face API"""
        try:
            url = f"{self.base_url}/{model}"
            
            payload = {
                "inputs": prompt,
                "parameters": {
                    "num_inference_steps": 20,
                    "guidance_scale": 7.5,
                    "width": 1024,
                    "height": 1024
                }
            }
            
            response = requests.post(url, headers=self.headers, json=payload, timeout=60)
            
            if response.status_code == 200:
                # Hugging Face returns image bytes
                image_data = base64.b64encode(response.content).decode('utf-8')
                
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
                    "error": f"Hugging Face API request failed: {response.status_code} - {response.text}",
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
        prompt = f"""A beautiful, realistic photograph of: {memory_title}. 
        
        Scene description: {memory_description}
        
        Style: High-quality, professional photography, realistic, detailed, warm lighting, natural colors, cinematic composition, photorealistic, sharp focus, beautiful natural lighting.
        
        The image should capture the essence and emotion of this memory in a realistic, photographic style that feels personal and meaningful."""
        
        return self.generate_image(prompt)

def handle_api_request():
    """Handle API request from Next.js"""
    try:
        import sys
        input_data = json.loads(sys.stdin.read())
        
        ai = FreeImageGenerator()
        
        prompt = input_data.get('prompt', '')
        memory_title = input_data.get('memoryTitle', '')
        memory_description = input_data.get('memoryDescription', '')
        category = input_data.get('category', '')
        emotion = input_data.get('emotion', '')
        style = input_data.get('style', 'realistic')
        type_param = input_data.get('type', 'custom')
        
        if type_param == "memory_visualization":
            result = ai.generate_memory_visualization(memory_title, memory_description, style)
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
        ai = FreeImageGenerator()
        result = ai.generate_image("A beautiful realistic garden with flowers and sunlight")
        
        if result['success']:
            print("✅ Free Image Generation test successful!")
            print(f"Generated image with prompt: {result['prompt']}")
            print(f"Model: {result.get('model', 'unknown')}")
            print(f"Timestamp: {result['timestamp']}")
        else:
            print("❌ Free Image Generation test failed!")
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







