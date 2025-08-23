#!/usr/bin/env python3
"""
Direct API test for Memory Garden with LM Studio
"""

import requests
import json
from lmstudio_ai import process_memory_garden_test

def test_api_direct():
    """Test the API directly"""
    
    print("🧪 Testing Memory Garden API with LM Studio")
    print("=" * 50)
    
    # Test 1: Direct Python function call
    print("\n1️⃣ Testing direct Python function...")
    try:
        result = process_memory_garden_test(
            "API Test Memory",
            "This is a test of the Memory Garden API integration with LM Studio. The AI should respond warmly and empathetically."
        )
        
        if result.get("success"):
            print("✅ Direct Python function successful!")
            print(f"🤖 AI Response: {result.get('ai_response', '')[:200]}...")
        else:
            print(f"❌ Direct Python function failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Direct Python function error: {e}")
        return False
    
    # Test 2: Test the web API endpoint
    print("\n2️⃣ Testing web API endpoint...")
    try:
        payload = {
            "testTitle": "Web API Test",
            "testDescription": "Testing the web API endpoint with LM Studio integration.",
            "mediaFiles": []
        }
        
        response = requests.post(
            "http://localhost:3000/api/ai-test",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Web API endpoint successful!")
            print(f"🤖 AI Response: {result.get('ai_response', '')[:200]}...")
        else:
            print(f"❌ Web API failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Web API error: {e}")
        return False
    
    print("\n🎉 All API tests passed!")
    return True

if __name__ == "__main__":
    test_api_direct() 