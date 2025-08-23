#!/usr/bin/env python3
"""
Simple chat API script for Memory Garden with LM Studio
Called directly by the Next.js API route for chat continuation
"""

import sys
import json
import os

# Suppress debug output for API calls
os.environ['SUPPRESS_DEBUG'] = 'true'

from lmstudio_ai import LMStudioAITester

def main():
    if len(sys.argv) < 4:
        print(json.dumps({
            "success": False,
            "error": "Missing arguments: message, conversationHistory, and testContext required"
        }))
        return
    
    message = sys.argv[1]
    conversation_history_str = sys.argv[2]
    test_context_str = sys.argv[3]
    
    try:
        conversation_history = json.loads(conversation_history_str) if conversation_history_str != 'null' else []
        test_context = json.loads(test_context_str) if test_context_str != 'null' else None
        
        ai_tester = LMStudioAITester()
        result = ai_tester.continue_conversation(message, conversation_history, test_context)
        
        # Only print the JSON result, no debug output
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    main() 