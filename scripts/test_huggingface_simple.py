#!/usr/bin/env python3
"""
Simple script for AI test API route using Hugging Face
"""

import os
import sys
import json
from datetime import datetime

# Add the scripts directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from huggingface_ai import HuggingFaceAI

def main():
    """Main function to process AI test"""
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python3 test_huggingface_simple.py <testTitle> <testDescription>",
            "timestamp": datetime.now().isoformat()
        }))
        sys.exit(1)
    
    test_title = sys.argv[1]
    test_description = sys.argv[2]
    
    # Initialize Hugging Face AI
    ai = HuggingFaceAI()
    
    # Process the memory garden test
    result = ai.process_memory_garden_test(test_title, test_description)
    
    # Print only the JSON result (no debug output)
    print(json.dumps(result))

if __name__ == "__main__":
    main()

