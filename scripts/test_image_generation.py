#!/usr/bin/env python3
"""
Test script to check Google AI Studio image generation capabilities
"""

import os
import sys
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

def test_available_models():
    """Test what models are available"""
    print("🔍 Testing available models...")
    
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY not found")
        return False
    
    try:
        # Set the API key
        os.environ['GEMINI_API_KEY'] = api_key
        client = genai.Client()
        
        # Try to list available models
        print("✅ Client initialized successfully")
        
        # Test basic text generation first
        print("\n📝 Testing basic text generation...")
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Hello, can you help me generate an image?"
        )
        
        print(f"✅ Text generation works: {response.text[:100]}...")
        
        # Try different models for image generation
        models_to_try = [
            "gemini-2.0-flash-preview-image-generation",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "imagen-4.0-generate-001"
        ]
        
        for model in models_to_try:
            print(f"\n🎨 Testing model: {model}")
            try:
                response = client.models.generate_content(
                    model=model,
                    contents="Create a simple image of a flower",
                    config={
                        "responseModalities": ["TEXT", "IMAGE"]
                    }
                )
                
                print(f"✅ Model {model} responded")
                print(f"Response type: {type(response)}")
                print(f"Response attributes: {dir(response)}")
                
                if hasattr(response, 'candidates'):
                    print(f"Candidates: {len(response.candidates) if response.candidates else 0}")
                    if response.candidates:
                        candidate = response.candidates[0]
                        print(f"Candidate attributes: {dir(candidate)}")
                        if hasattr(candidate, 'content'):
                            print(f"Content attributes: {dir(candidate.content)}")
                            if hasattr(candidate.content, 'parts'):
                                print(f"Parts: {len(candidate.content.parts) if candidate.content.parts else 0}")
                                for i, part in enumerate(candidate.content.parts):
                                    print(f"Part {i} attributes: {dir(part)}")
                                    if hasattr(part, 'text'):
                                        print(f"Part {i} text: {part.text[:100] if part.text else 'None'}...")
                                    if hasattr(part, 'inlineData'):
                                        print(f"Part {i} inlineData: {part.inlineData if part.inlineData else 'None'}")
                
            except Exception as e:
                print(f"❌ Model {model} failed: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_simple_image_generation():
    """Test simple image generation"""
    print("\n🎨 Testing simple image generation...")
    
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY not found")
        return False
    
    try:
        os.environ['GEMINI_API_KEY'] = api_key
        client = genai.Client()
        
        # Try the most likely model for image generation
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview-image-generation",
            contents="A simple red flower in a garden",
            config={
                "responseModalities": ["IMAGE"]
            }
        )
        
        print(f"✅ Image generation response received")
        print(f"Response: {response}")
        
        return True
        
    except Exception as e:
        print(f"❌ Image generation failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🧪 Google AI Studio Image Generation Test")
    print("=" * 50)
    
    # Test 1: Available models
    test_available_models()
    
    # Test 2: Simple image generation
    test_simple_image_generation()
    
    print("\n" + "=" * 50)
    print("🎉 Tests completed!")
    print("\n💡 Note: Image generation might not be available in all regions")
    print("   or might require special permissions. Check the Google AI Studio")
    print("   documentation for the latest information.")

if __name__ == "__main__":
    main()







