#!/usr/bin/env python3
"""
Simple test script for LM Studio API
Run this to verify your LM Studio setup is working
"""

import requests
import json

def test_lmstudio_connection():
    """Test if LM Studio is running and accessible"""
    base_url = "http://localhost:1234/v1"
    
    print("🧪 Testing LM Studio Connection...")
    print(f"Base URL: {base_url}")
    
    try:
        # Test 1: Check if server is running
        print("\n1️⃣ Testing server availability...")
        response = requests.get(f"{base_url}/models", timeout=5)
        
        if response.status_code == 200:
            print("✅ Server is running!")
            models = response.json()
            print(f"📋 Available models: {[m['id'] for m in models.get('data', [])]}")
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to LM Studio: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure LM Studio is open")
        print("2. Go to 'Local Server' in LM Studio")
        print("3. Select a model and click 'Start Server'")
        print("4. Check that status shows 'Running'")
        return False
    
    # Test 2: Test a simple chat completion
    print("\n2️⃣ Testing chat completion...")
    try:
        payload = {
            "model": "local-model",  # LM Studio uses this as default
            "messages": [
                {"role": "user", "content": "Hello! Can you say 'LM Studio is working!' in a friendly way?"}
            ],
            "max_tokens": 100,
            "temperature": 0.7,
            "stream": False
        }
        
        response = requests.post(
            f"{base_url}/chat/completions",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            print(f"✅ Chat completion successful!")
            print(f"🤖 AI Response: {ai_response}")
        else:
            print(f"❌ Chat completion failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat completion error: {e}")
        return False
    
    # Test 3: Test Memory Garden specific functionality
    print("\n3️⃣ Testing Memory Garden integration...")
    try:
        from lmstudio_ai import LMStudioAITester
        
        ai_tester = LMStudioAITester()
        test_result = ai_tester.process_test_inputs(
            "My First Memory",
            "Today I went for a walk in the park and saw beautiful flowers blooming. It reminded me of spring and made me feel peaceful."
        )
        
        if test_result.get("success"):
            print("✅ Memory Garden integration successful!")
            print(f"🤖 AI Response: {test_result.get('ai_response', '')[:100]}...")
        else:
            print(f"❌ Memory Garden integration failed: {test_result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Memory Garden integration error: {e}")
        return False
    
    print("\n🎉 All tests passed! LM Studio is ready to use with Memory Garden!")
    return True

if __name__ == "__main__":
    test_lmstudio_connection() 