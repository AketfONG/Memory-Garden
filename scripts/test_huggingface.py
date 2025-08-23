#!/usr/bin/env python3
"""
Test script for Hugging Face AI integration
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from huggingface_ai import HuggingFaceAI

def test_huggingface():
    """Test the Hugging Face AI integration"""
    print("🧪 Testing Hugging Face AI Integration...")
    
    # Check if API key is set
    api_key = os.getenv('HUGGINGFACE_API_KEY')
    if not api_key:
        print("❌ HUGGINGFACE_API_KEY not found in environment variables")
        print("💡 Please set it in your .env.local file")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Initialize AI
    ai = HuggingFaceAI()
    
    # Test 1: Simple text generation
    print("\n📝 Testing text generation...")
    result = ai.call_huggingface_api("Hello, how are you?")
    print(f"Result: {result}")
    
    # Test 2: Memory garden test
    print("\n🌱 Testing memory garden functionality...")
    test_result = ai.process_memory_garden_test(
        "Sunset Walk", 
        "A beautiful evening walk watching the sun set over the mountains"
    )
    print(f"Memory test result: {test_result}")
    
    # Test 3: Conversation
    print("\n💬 Testing conversation...")
    conv_result = ai.continue_conversation(
        "What is the Memory Garden?",
        [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello! I'm Sprout!"}],
        {"website_name": "Memory Garden"}
    )
    print(f"Conversation result: {conv_result}")
    
    return True

if __name__ == "__main__":
    success = test_huggingface()
    if success:
        print("\n🎉 All tests completed!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)

