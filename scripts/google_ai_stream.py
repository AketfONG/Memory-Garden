#!/usr/bin/env python3
"""
Streaming Google AI script for voice memory interaction
"""

import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Add the scripts directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from google import genai

def main():
    """Main function to process streaming Google AI chat"""
    if len(sys.argv) != 3:
        error_result = {
            "type": "error",
            "error": "Usage: python3 google_ai_stream.py <message> <messages_json>"
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    message = sys.argv[1]
    messages_json = sys.argv[2]
    
    try:
        messages = json.loads(messages_json)
    except json.JSONDecodeError:
        error_result = {
            "type": "error",
            "error": "Invalid messages JSON"
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        error_result = {
            "type": "error",
            "error": "GOOGLE_AI_API_KEY not found in environment variables"
        }
        print(json.dumps(error_result))
        sys.exit(1)
    
    try:
        # Set the API key as environment variable for the client
        os.environ['GEMINI_API_KEY'] = api_key
        client = genai.Client()
        
        # Build conversation history properly for Google AI
        # Google AI expects alternating user/model messages with proper role information
        from google.genai import types
        
        conversation_history = []
        system_instruction = None
        
        for msg in messages:
            role = msg.get('role', '')
            content = msg.get('content', '')
            
            if role == 'system':
                # System messages become system instructions
                system_instruction = content
            elif role == 'user':
                # User messages
                conversation_history.append(types.Content(role='user', parts=[types.Part(text=content)]))
            elif role == 'assistant':
                # Assistant messages (model responses) - Google AI uses 'model' role
                conversation_history.append(types.Content(role='model', parts=[types.Part(text=content)]))
        
        # Add current user message
        current_message = types.Content(role='user', parts=[types.Part(text=message)])
        
        # Combine history with current message
        all_contents = conversation_history + [current_message] if conversation_history else [current_message]
        
        # Add system instruction
        system_instruction_text = system_instruction or "You are Sprout, a compassionate and nurturing AI companion in Memory Garden. You help users reflect on their memories with empathy and understanding. Be warm, natural, and genuinely curious about their experiences. Keep responses conversational and concise (under 200 words)."
        
        # Generate content with streaming
        try:
            # Use generate_content_stream for streaming
            # Pass properly formatted Content objects with role information preserved
            response = client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=all_contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction_text
                )
            )
            
            full_response = ''
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    content = chunk.text
                    full_response += content
                    # Send chunk
                    chunk_data = {
                        "type": "chunk",
                        "content": content
                    }
                    print(json.dumps(chunk_data))
                    sys.stdout.flush()
            
            # Send complete response
            complete_data = {
                "type": "complete",
                "content": full_response
            }
            print(json.dumps(complete_data))
            sys.stdout.flush()
            
        except Exception as e:
            error_result = {
                "type": "error",
                "error": f"API call failed: {str(e)}"
            }
            print(json.dumps(error_result))
            sys.exit(1)
            
    except Exception as e:
        error_result = {
            "type": "error",
            "error": f"Failed to initialize Google AI: {str(e)}"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()

