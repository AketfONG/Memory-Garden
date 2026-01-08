#!/usr/bin/env python3
"""
Test GetImg integration with the hybrid API
"""

import os
import json
import sys

# Set the API key
os.environ['GETIMG_API_KEY'] = 'key-251hxZsfCYtHWAIlILw5ycGWFvWe6UGeBqYhbcghbGouNBrD0tBECdfS1a5P1tF9zPZj54m8bLCYBIdQYMCwIssLqmnhVjBe'

# Test data
test_data = {
    "type": "memory_visualization",
    "memoryTitle": "Beach Sunset",
    "memoryDescription": "Watching the sun dip below the horizon, painting the sky in shades of orange and pink. The sound of gentle waves and the feeling of warm sand.",
    "style": "realistic",
    "emotion": "peaceful",
    "category": "nature"
}

print("Testing GetImg integration...")
print(f"Test data: {json.dumps(test_data, indent=2)}")

# Import and test the GetImg script
try:
    from getimg_ai import GetImgAIGenerator
    
    ai = GetImgAIGenerator()
    result = ai.generate_memory_visualization(
        test_data['memoryTitle'],
        test_data['memoryDescription'],
        test_data['style']
    )
    
    print(f"\nResult: {json.dumps(result, indent=2)}")
    
    if result['success']:
        print("✅ GetImg integration test successful!")
        print(f"Image data length: {len(result['image_data'])}")
    else:
        print("❌ GetImg integration test failed!")
        print(f"Error: {result['error']}")
        
except Exception as e:
    print(f"❌ Test failed with error: {e}")







