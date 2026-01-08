#!/usr/bin/env python3
"""
Debug script to understand the image generation response structure
"""

import os
import json
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

def debug_image_response():
    """Debug the actual response structure from image generation"""
    print("🔍 Debugging image generation response...")
    
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
        print(f"Response type: {type(response)}")
        
        # Debug the response structure
        print("\n📋 Response structure:")
        print(f"Has candidates: {hasattr(response, 'candidates')}")
        if hasattr(response, 'candidates') and response.candidates:
            print(f"Number of candidates: {len(response.candidates)}")
            
            candidate = response.candidates[0]
            print(f"\n📋 Candidate structure:")
            print(f"Has content: {hasattr(candidate, 'content')}")
            
            if hasattr(candidate, 'content'):
                content = candidate.content
                print(f"Has parts: {hasattr(content, 'parts')}")
                print(f"Number of parts: {len(content.parts) if hasattr(content, 'parts') and content.parts else 0}")
                
                if hasattr(content, 'parts') and content.parts:
                    for i, part in enumerate(content.parts):
                        print(f"\n📋 Part {i}:")
                        print(f"  Type: {type(part)}")
                        print(f"  Has text: {hasattr(part, 'text')}")
                        print(f"  Has inlineData: {hasattr(part, 'inlineData')}")
                        print(f"  Has fileData: {hasattr(part, 'fileData')}")
                        
                        if hasattr(part, 'text') and part.text:
                            print(f"  Text: {part.text[:200]}...")
                        
                        if hasattr(part, 'inlineData') and part.inlineData:
                            print(f"  InlineData type: {type(part.inlineData)}")
                            print(f"  InlineData attributes: {dir(part.inlineData)}")
                            if hasattr(part.inlineData, 'data'):
                                print(f"  InlineData data length: {len(part.inlineData.data) if part.inlineData.data else 0}")
                        
                        if hasattr(part, 'fileData') and part.fileData:
                            print(f"  FileData type: {type(part.fileData)}")
                            print(f"  FileData attributes: {dir(part.fileData)}")
                            if hasattr(part.fileData, 'data'):
                                print(f"  FileData data length: {len(part.fileData.data) if part.fileData.data else 0}")
        
        # Try to extract image data
        print("\n🎨 Attempting to extract image data...")
        image_data = None
        
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                for part in candidate.content.parts:
                    if hasattr(part, 'inlineData') and part.inlineData and hasattr(part.inlineData, 'data'):
                        image_data = part.inlineData.data
                        print("✅ Found image data in inlineData")
                        break
                    elif hasattr(part, 'fileData') and part.fileData and hasattr(part.fileData, 'data'):
                        image_data = part.fileData.data
                        print("✅ Found image data in fileData")
                        break
        
        if image_data:
            print(f"✅ Image data extracted: {len(image_data)} characters")
            # Save the image
            import base64
            with open("debug_generated_image.png", "wb") as f:
                f.write(base64.b64decode(image_data))
            print("✅ Image saved as debug_generated_image.png")
        else:
            print("❌ No image data found")
            
            # Print all available attributes for debugging
            print("\n🔍 All response attributes:")
            for attr in dir(response):
                if not attr.startswith('_'):
                    try:
                        value = getattr(response, attr)
                        print(f"  {attr}: {type(value)}")
                    except:
                        print(f"  {attr}: <error accessing>")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    debug_image_response()







