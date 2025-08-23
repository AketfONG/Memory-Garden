#!/usr/bin/env python3
"""
LM Studio Interface Guide
Helps identify the current LM Studio interface and find server options
"""

import requests
import json
import time

def check_lmstudio_interface():
    """Check what's available in LM Studio"""
    
    print("🔍 LM Studio Interface Guide")
    print("=" * 40)
    
    print("\n📋 Current LM Studio Interface Options:")
    print("1. Look for these in the sidebar:")
    print("   - 'Local Server'")
    print("   - 'Server'")
    print("   - 'API Server'")
    print("   - 'Local API'")
    print("   - 'Chat' (might have server options)")
    
    print("\n2. Check the top menu bar for:")
    print("   - 'Server' menu")
    print("   - 'API' menu")
    print("   - 'Tools' menu")
    print("   - 'Settings' or 'Preferences'")
    
    print("\n3. Look for these buttons/icons:")
    print("   - Server icon (🌐 or 🔌)")
    print("   - 'Start Server' button")
    print("   - 'Enable API' button")
    print("   - Network/server status indicator")
    
    print("\n4. Check the bottom status bar for:")
    print("   - Server status")
    print("   - API status")
    print("   - Connection indicators")
    
    print("\n🔧 If you can't find Local Server:")
    print("1. Go to Settings/Preferences")
    print("2. Look for 'Server' or 'API' section")
    print("3. Enable 'Local Server' or 'API Server'")
    print("4. Set port to 1234 (default)")
    
    print("\n🌐 Test if server is already running:")
    
    # Test common ports
    ports = [1234, 8080, 8000, 3000]
    for port in ports:
        try:
            response = requests.get(f"http://localhost:{port}/v1/models", timeout=2)
            if response.status_code == 200:
                print(f"✅ Found LM Studio server on port {port}!")
                models = response.json()
                print(f"📋 Available models: {[m['id'] for m in models.get('data', [])]}")
                return port
        except:
            continue
    
    print("❌ No LM Studio server found on common ports")
    print("\n💡 Try these steps:")
    print("1. Open LM Studio")
    print("2. Look for any server/API options")
    print("3. Enable local server if found")
    print("4. Try the test again")
    
    return None

def test_common_endpoints():
    """Test common LM Studio endpoints"""
    print("\n🧪 Testing Common LM Studio Endpoints...")
    
    base_urls = [
        "http://localhost:1234/v1",
        "http://localhost:8080/v1", 
        "http://localhost:8000/v1",
        "http://localhost:3000/v1"
    ]
    
    for base_url in base_urls:
        try:
            print(f"\nTesting {base_url}...")
            response = requests.get(f"{base_url}/models", timeout=3)
            if response.status_code == 200:
                print(f"✅ Found working server at {base_url}")
                models = response.json()
                print(f"📋 Models: {[m['id'] for m in models.get('data', [])]}")
                return base_url
        except Exception as e:
            print(f"❌ {base_url} - {e}")
    
    return None

if __name__ == "__main__":
    print("🚀 LM Studio Interface Detection")
    print("=" * 40)
    
    # Check interface options
    check_lmstudio_interface()
    
    # Test for running servers
    working_url = test_common_endpoints()
    
    if working_url:
        print(f"\n🎉 LM Studio is running at {working_url}")
        print("You can now test the Memory Garden AI functions!")
    else:
        print("\n❌ No LM Studio server found")
        print("Please start LM Studio and enable the local server first.") 