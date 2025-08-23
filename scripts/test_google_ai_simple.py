#!/usr/bin/env python3
"""
Simple script for AI test API route using Google AI Studio
"""

import os
import sys
import json
from datetime import datetime

# Add the scripts directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from google_ai import GoogleAI

def main():
    """Main function to process AI test"""
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python3 test_google_ai_simple.py <testTitle> <testDescription>",
            "timestamp": datetime.now().isoformat()
        }))
        sys.exit(1)
    
    test_title = sys.argv[1]
    test_description = sys.argv[2]
    
    # Initialize Google AI
    ai = GoogleAI()
    
    # Process the memory garden test
    result = ai.process_memory_garden_test(test_title, test_description)
    
    # Print only the JSON result (no debug output)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
