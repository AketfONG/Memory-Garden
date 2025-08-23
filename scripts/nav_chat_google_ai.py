#!/usr/bin/env python3
"""
Simple script for navigation chat API route using Google AI Studio
"""

import os
import sys
import json
from datetime import datetime

# Add the scripts directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from google_ai import GoogleAI

def main():
    """Main function to process navigation chat"""
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python3 nav_chat_google_ai.py <message> <conversationHistory>",
            "timestamp": datetime.now().isoformat()
        }))
        sys.exit(1)
    
    message = sys.argv[1]
    conversation_history_json = sys.argv[2]
    
    try:
        conversation_history = json.loads(conversation_history_json)
    except json.JSONDecodeError:
        print(json.dumps({
            "success": False,
            "error": "Invalid conversation history JSON",
            "timestamp": datetime.now().isoformat()
        }))
        sys.exit(1)
    
    # Initialize Google AI
    ai = GoogleAI()
    
    # Continue the conversation with website context
    result = ai.continue_conversation(
        message, 
        conversation_history,
        {"website_name": "Memory Garden"}
    )
    
    # Print only the JSON result (no debug output)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
