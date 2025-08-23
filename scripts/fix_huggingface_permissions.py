#!/usr/bin/env python3
"""
Script to help fix Hugging Face API permissions
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

def main():
    print("🔧 Hugging Face API Permissions Fix")
    print("====================================")
    print()
    
    api_key = os.getenv('HUGGINGFACE_API_KEY')
    if not api_key:
        print("❌ No API key found in .env.local")
        return
    
    print(f"✅ API key found: {api_key[:8]}...")
    print()
    
    print("🔑 The issue is with token permissions. Here's how to fix it:")
    print()
    print("1. Go to: https://huggingface.co/settings/tokens")
    print("2. Click 'New token'")
    print("3. Give it a name (e.g., 'Memory Garden AI')")
    print("4. Select 'Write' permissions (this includes read and inference)")
    print("5. Click 'Generate token'")
    print("6. Copy the new token")
    print("7. Update your .env.local file with the new token")
    print()
    print("💡 Alternative: Use a different free AI service")
    print("   - OpenAI (free $5 credit/month)")
    print("   - Anthropic Claude (free $5 credit/month)")
    print("   - Or continue using LM Studio (completely free, local)")
    print()
    
    print("🚀 Quick test with current token:")
    print("   The 403 error means the token works but lacks inference permissions.")
    print("   This is a common issue with free Hugging Face accounts.")

if __name__ == "__main__":
    main()

