#!/usr/bin/env python3
"""
Test LM Studio on different ports
Helps find the correct port when LM Studio is running
"""

import requests
import json

def test_lmstudio_ports():
    """Test LM Studio on various ports"""
    
    print("🔍 Testing LM Studio on Different Ports...")
    print("=" * 40)
    
    # Common ports LM Studio might use
    ports = [1234, 41343, 8080, 8000, 3000, 5000, 7000]
    
    for port in ports:
        try:
            print(f"\nTesting port {port}...")
            response = requests.get(f"http://localhost:{port}/v1/models", timeout=3)
            
            if response.status_code == 200:
                print(f"✅ Found LM Studio server on port {port}!")
                models = response.json()
                print(f"📋 Available models: {[m['id'] for m in models.get('data', [])]}")
                
                # Test a simple chat completion
                print(f"🧪 Testing chat completion on port {port}...")
                chat_response = requests.post(
                    f"http://localhost:{port}/v1/chat/completions",
                    json={
                        "model": "local-model",
                        "messages": [{"role": "user", "content": "Hello! Say 'LM Studio is working!'"}],
                        "max_tokens": 50,
                        "temperature": 0.7
                    },
                    timeout=10
                )
                
                if chat_response.status_code == 200:
                    result = chat_response.json()
                    ai_response = result['choices'][0]['message']['content']
                    print(f"✅ Chat completion successful!")
                    print(f"🤖 Response: {ai_response}")
                    
                    print(f"\n🎉 LM Studio is fully working on port {port}!")
                    print(f"Update your configuration to use: http://localhost:{port}/v1")
                    return port
                else:
                    print(f"❌ Chat completion failed: {chat_response.status_code}")
                    
            else:
                print(f"❌ Port {port} responded with status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Port {port} - Connection failed")
        except Exception as e:
            print(f"❌ Port {port} - Error: {e}")
    
    print("\n❌ No working LM Studio server found")
    print("\n💡 Next steps:")
    print("1. Make sure LM Studio is open")
    print("2. Look for 'Local Server' or 'API Server' option")
    print("3. Enable the server and select a model")
    print("4. Try this test again")
    
    return None

if __name__ == "__main__":
    test_lmstudio_ports() 