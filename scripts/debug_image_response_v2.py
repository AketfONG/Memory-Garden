#!/usr/bin/env python3
"""
Debug script to understand the image generation response structure - Version 2
"""

import os
import json
import base64
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

def debug_image_response_v2():
    """Debug the actual response structure from image generation - Version 2"""
    print("🔍 Debugging image generation response - Version 2...")
    
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY not found")
        return False
    
    try:
        os.environ['GEMINI_API_KEY'] = api_key
        client = genai.Client()
        
        # Generate an image
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents="A simple red flower",
            config={
                "responseModalities": ["TEXT", "IMAGE"]
            }
        )
        
        print("✅ Response received")
        
        # Check the raw response
        print(f"\n📋 Raw response type: {type(response)}")
        print(f"Response dict: {response.dict()}")
        
        # Check candidates
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            print(f"\n📋 Candidate dict: {candidate.dict()}")
            
            if hasattr(candidate, 'content'):
                content = candidate.content
                print(f"\n📋 Content dict: {content.dict()}")
                
                if hasattr(content, 'parts') and content.parts:
                    for i, part in enumerate(content.parts):
                        print(f"\n📋 Part {i} dict: {part.dict()}")
                        
                        # Check for inline_data specifically
                        part_dict = part.dict()
                        if 'inline_data' in part_dict:
                            inline_data = part_dict['inline_data']
                            print(f"  Found inline_data: {type(inline_data)}")
                            print(f"  Inline_data keys: {inline_data.keys() if isinstance(inline_data, dict) else 'Not a dict'}")
                            
                            if isinstance(inline_data, dict) and 'data' in inline_data:
                                image_data = inline_data['data']
                                print(f"  Image data length: {len(image_data)}")
                                
                                # Try to save the image
                                try:
                                    with open("debug_generated_image_v2.png", "wb") as f:
                                        f.write(base64.b64decode(image_data))
                                    print("✅ Image saved as debug_generated_image_v2.png")
                                except Exception as e:
                                    print(f"❌ Failed to save image: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    debug_image_response_v2()







