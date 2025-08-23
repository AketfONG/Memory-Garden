#!/usr/bin/env python3
"""
Simple API test script for Memory Garden with LM Studio
Called directly by the Next.js API route
"""

import sys
import json
import os

# Suppress debug output for API calls
os.environ['SUPPRESS_DEBUG'] = 'true'

from lmstudio_ai import process_memory_garden_test

def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Missing arguments: testTitle and testDescription required"
        }))
        return
    
    test_title = sys.argv[1]
    test_description = sys.argv[2]
    
    try:
        result = process_memory_garden_test(test_title, test_description)
        # Only print the JSON result, no debug output
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    main() 