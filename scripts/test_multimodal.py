#!/usr/bin/env python3
"""
Test script for Google AI Studio multimodal capabilities
This script demonstrates image and video analysis for Memory Garden
"""

import os
import sys
import json
from datetime import datetime

# Add the scripts directory to the path so we can import our modules
sys.path.append(os.path.dirname(__file__))

from google_ai_multimodal import GoogleAIMultimodal

def test_text_generation():
    """Test basic text generation"""
    print("📝 Testing text generation...")
    
    ai = GoogleAIMultimodal()
    
    result = ai.call_google_ai_api(
        "Write a beautiful, poetic description of what makes memories special in a garden setting."
    )
    
    if result["success"]:
        print("✅ Text generation successful!")
        print(f"Response: {result['response'][:200]}...")
    else:
        print(f"❌ Text generation failed: {result['error']}")
    
    return result["success"]

def test_image_analysis(image_path: str):
    """Test image analysis capabilities"""
    print(f"🖼️ Testing image analysis with: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    ai = GoogleAIMultimodal()
    
    # Test basic image analysis
    result = ai.analyze_image(
        image_path, 
        "Describe this image in detail, focusing on the mood, colors, and what makes it special for a memory garden."
    )
    
    if result["success"]:
        print("✅ Image analysis successful!")
        print(f"Analysis: {result['response'][:300]}...")
        
        # Test memory-specific analysis
        memory_result = ai.analyze_memory_media(
            image_path, 
            "image", 
            "A family gathering at the beach during sunset"
        )
        
        if memory_result["success"]:
            print("✅ Memory-specific analysis successful!")
            print(f"Memory Analysis: {memory_result['response'][:300]}...")
            
            # Generate insights
            insights_result = ai.generate_memory_insights(
                memory_result['response'],
                "Beach Family Gathering",
                "A beautiful evening with family watching the sunset"
            )
            
            if insights_result["success"]:
                print("✅ Memory insights generated!")
                print(f"Insights: {insights_result['insights'][:300]}...")
            else:
                print(f"❌ Insights generation failed: {insights_result['error']}")
        else:
            print(f"❌ Memory analysis failed: {memory_result['error']}")
    else:
        print(f"❌ Image analysis failed: {result['error']}")
    
    return result["success"]

def test_video_analysis(video_path: str):
    """Test video analysis capabilities"""
    print(f"🎥 Testing video analysis with: {video_path}")
    
    if not os.path.exists(video_path):
        print(f"❌ Video file not found: {video_path}")
        return False
    
    ai = GoogleAIMultimodal()
    
    # Test basic video analysis
    result = ai.analyze_video(
        video_path, 
        "Describe what happens in this video, focusing on the key moments and emotions captured."
    )
    
    if result["success"]:
        print("✅ Video analysis successful!")
        print(f"Analysis: {result['response'][:300]}...")
        
        # Test memory-specific analysis
        memory_result = ai.analyze_memory_media(
            video_path, 
            "video", 
            "A graduation ceremony celebration"
        )
        
        if memory_result["success"]:
            print("✅ Memory-specific video analysis successful!")
            print(f"Memory Analysis: {memory_result['response'][:300]}...")
        else:
            print(f"❌ Memory video analysis failed: {memory_result['error']}")
    else:
        print(f"❌ Video analysis failed: {result['error']}")
    
    return result["success"]

def create_sample_media_info():
    """Create sample media files info for testing"""
    print("\n📋 Sample Media Files for Testing:")
    print("=" * 50)
    print("To test image analysis, place one of these in the scripts folder:")
    print("  - test_image.jpg (family photo)")
    print("  - test_image.png (nature scene)")
    print("  - test_image.gif (animated moment)")
    print()
    print("To test video analysis, place one of these in the scripts folder:")
    print("  - test_video.mp4 (family gathering)")
    print("  - test_video.mov (travel moment)")
    print("  - test_video.avi (celebration)")
    print()
    print("Supported formats:")
    print("  Images: JPEG, PNG, GIF, WebP")
    print("  Videos: MP4, MOV, AVI, WebM")
    print("  Max size: 10MB per file")

def main():
    """Main test function"""
    print("🧪 Google AI Studio Multimodal Test Suite")
    print("=" * 50)
    
    # Check API key
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY not found in environment variables")
        print("💡 Please set it in your .env.local file")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Test 1: Text generation
    print("\n" + "="*50)
    text_success = test_text_generation()
    
    # Test 2: Image analysis (if test image exists)
    print("\n" + "="*50)
    test_images = ['test_image.jpg', 'test_image.png', 'test_image.gif']
    image_success = False
    
    for img in test_images:
        if os.path.exists(os.path.join(os.path.dirname(__file__), img)):
            image_success = test_image_analysis(os.path.join(os.path.dirname(__file__), img))
            break
    
    if not image_success:
        print("ℹ️ No test images found. Skipping image analysis test.")
        create_sample_media_info()
    
    # Test 3: Video analysis (if test video exists)
    print("\n" + "="*50)
    test_videos = ['test_video.mp4', 'test_video.mov', 'test_video.avi']
    video_success = False
    
    for vid in test_videos:
        if os.path.exists(os.path.join(os.path.dirname(__file__), vid)):
            video_success = test_video_analysis(os.path.join(os.path.dirname(__file__), vid))
            break
    
    if not video_success:
        print("ℹ️ No test videos found. Skipping video analysis test.")
    
    # Summary
    print("\n" + "="*50)
    print("🎉 Test Summary:")
    print(f"  Text Generation: {'✅' if text_success else '❌'}")
    print(f"  Image Analysis: {'✅' if image_success else 'ℹ️ (no test files)'}")
    print(f"  Video Analysis: {'✅' if video_success else 'ℹ️ (no test files)'}")
    
    print("\n💡 Capabilities Available:")
    print("  - Analyze images for memory context")
    print("  - Analyze videos for memory context")
    print("  - Generate AI insights from media")
    print("  - Suggest categories and tags")
    print("  - Create therapeutic reflections")
    print("  - Extract emotional content")
    
    return text_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)







