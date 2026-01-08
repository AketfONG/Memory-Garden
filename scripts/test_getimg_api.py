#!/usr/bin/env python3
"""
Test GetImg API to understand the response structure
"""

import os
import requests
import json

def test_getimg_api():
    api_key = "key-251hxZsfCYtHWAIlILw5ycGWFvWe6UGeBqYhbcghbGouNBrD0tBECdfS1a5P1tF9zPZj54m8bLCYBIdQYMCwIssLqmnhVjBe"
    base_url = "https://api.getimg.ai/v1"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test different models
    models = [
        "stable-diffusion-xl",
        "essential-v2", 
        "flux-schnell",
        "stable-diffusion",
        "realistic-vision-v5"
    ]
    
    for model in models:
        try:
            url = f"{base_url}/{model}/text-to-image"
            payload = {
                "prompt": "a beautiful garden",
                "width": 512,
                "height": 512
            }
            
            print(f"\nTesting model: {model}")
            print(f"URL: {url}")
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Success! Response keys: {list(result.keys())}")
                if 'image' in result:
                    print(f"Image data length: {len(result['image'])}")
                break
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"Exception for {model}: {e}")

if __name__ == "__main__":
    test_getimg_api()







