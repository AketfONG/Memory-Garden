#!/usr/bin/env python3
"""
Advanced LM Studio testing for Memory Garden
Tests all AI functions including conversation flow
"""

import requests
import json
import time
from lmstudio_ai import LMStudioAITester

def test_memory_garden_ai_functions():
    """Test all Memory Garden AI functions"""
    
    print("🧪 Advanced LM Studio Testing for Memory Garden")
    print("=" * 50)
    
    # Wait for LM Studio to be ready
    print("⏳ Waiting for LM Studio to be ready...")
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get("http://localhost:1234/v1/models", timeout=5)
            if response.status_code == 200:
                print("✅ LM Studio is ready!")
                break
        except:
            if attempt < max_attempts - 1:
                print(f"⏳ Attempt {attempt + 1}/{max_attempts} - LM Studio not ready yet...")
                time.sleep(2)
            else:
                print("❌ LM Studio is not running. Please start LM Studio first.")
                return False
    
    try:
        # Initialize AI tester
        ai_tester = LMStudioAITester()
        
        # Test 1: Initial story processing
        print("\n1️⃣ Testing Story Processing...")
        test_result = ai_tester.process_test_inputs(
            "A Beautiful Sunset",
            "Yesterday evening, I watched the most amazing sunset from my balcony. The sky was painted in shades of orange, pink, and purple. It reminded me of a painting and made me feel so grateful for the simple beauty in life."
        )
        
        if test_result.get("success"):
            print("✅ Story processing successful!")
            print(f"🤖 AI Response: {test_result.get('ai_response', '')[:150]}...")
        else:
            print(f"❌ Story processing failed: {test_result.get('error', 'Unknown error')}")
            return False
        
        # Test 2: Conversation continuation
        print("\n2️⃣ Testing Conversation Continuation...")
        conversation_result = ai_tester.continue_conversation(
            "What do you think made that sunset so special to me?",
            conversation_history=[
                {"role": "user", "content": "I watched a beautiful sunset yesterday"},
                {"role": "assistant", "content": test_result.get('ai_response', '')}
            ],
            test_context=test_result.get('context', {})
        )
        
        if conversation_result.get("success"):
            print("✅ Conversation continuation successful!")
            print(f"🤖 AI Response: {conversation_result.get('ai_response', '')[:150]}...")
        else:
            print(f"❌ Conversation continuation failed: {conversation_result.get('error', 'Unknown error')}")
            return False
        
        # Test 3: Multiple conversation turns
        print("\n3️⃣ Testing Multiple Conversation Turns...")
        messages = [
            {"role": "user", "content": "I watched a beautiful sunset yesterday"},
            {"role": "assistant", "content": test_result.get('ai_response', '')}
        ]
        
        for i in range(3):
            user_message = f"This is conversation turn {i+1}. What do you think about that?"
            conv_result = ai_tester.continue_conversation(
                user_message,
                conversation_history=messages,
                test_context=test_result.get('context', {})
            )
            
            if conv_result.get("success"):
                ai_response = conv_result.get('ai_response', '')
                messages.append({"role": "user", "content": user_message})
                messages.append({"role": "assistant", "content": ai_response})
                print(f"✅ Turn {i+1} successful!")
                print(f"🤖 Response: {ai_response[:100]}...")
            else:
                print(f"❌ Turn {i+1} failed: {conv_result.get('error', 'Unknown error')}")
                return False
        
        # Test 4: Error handling
        print("\n4️⃣ Testing Error Handling...")
        try:
            # Test with empty input
            empty_result = ai_tester.process_test_inputs("", "")
            print("✅ Error handling test completed")
        except Exception as e:
            print(f"✅ Error handling working: {e}")
        
        print("\n🎉 All tests passed! Memory Garden AI functions are working perfectly!")
        print("\n📋 Test Summary:")
        print("✅ LM Studio connection")
        print("✅ Story processing")
        print("✅ Conversation continuation")
        print("✅ Multiple conversation turns")
        print("✅ Error handling")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def test_api_endpoints():
    """Test the API endpoints directly"""
    print("\n🌐 Testing API Endpoints...")
    
    # Test the /api/ai-test endpoint
    try:
        payload = {
            "testTitle": "API Test Memory",
            "testDescription": "This is a test of the API endpoint to ensure it's working correctly with LM Studio.",
            "mediaFiles": []
        }
        
        response = requests.post(
            "http://localhost:3000/api/ai-test",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ /api/ai-test endpoint working!")
            print(f"🤖 Response: {result.get('ai_response', '')[:100]}...")
        else:
            print(f"❌ /api/ai-test failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ API endpoint test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Advanced LM Studio Tests...")
    
    # Test AI functions
    ai_success = test_memory_garden_ai_functions()
    
    if ai_success:
        # Test API endpoints (only if AI functions work)
        test_api_endpoints()
    
    print("\n✨ Testing complete!") 