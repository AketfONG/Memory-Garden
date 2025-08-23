import os
import base64
import json
import requests
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from ai_config_manager import config_manager

# Load environment variables - try multiple paths
from pathlib import Path

# Try to find .env.local in various locations
env_paths = [
    Path('../.env.local'),
    Path('../../.env.local'),
    Path('.env.local'),
    Path('../env.local'),
]

env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded environment from: {env_path}")
        env_loaded = True
        break

if not env_loaded:
    print("Warning: No .env.local file found. Using system environment variables.")

class LMStudioAITester:
    def __init__(self, model: str = "local-model"):
        self.model = model
        self.base_url = "http://localhost:1234/v1"
        print(f"LM Studio client initialized with model: {self.model}")
        print(f"Base URL: {self.base_url}")
        
        # Check if LM Studio is running
        try:
            response = requests.get(f"{self.base_url}/models", timeout=5)
            if response.status_code == 200:
                print("✅ LM Studio is running and accessible")
                models = response.json()
                print(f"Available models: {[m['id'] for m in models.get('data', [])]}")
            else:
                print("⚠️ LM Studio responded but with unexpected status")
        except requests.exceptions.RequestException as e:
            print(f"❌ LM Studio is not running: {e}")
            print("Please install and start LM Studio: https://lmstudio.ai")
            print("Make sure to enable 'Local Server' in LM Studio settings")
            raise Exception("LM Studio is not running. Please install and start LM Studio first.")
    
    def process_test_inputs(self, test_title: str, test_description: str, media_files: List[str] = None) -> Dict[str, Any]:
        """Process test inputs and create context for DeepSeek AI chat"""
        
        # Get personality prompt from configuration
        personality_prompt = config_manager.get_personality_prompt()
        
        system_prompt = f"""{personality_prompt}

You're having a natural conversation with someone who shared a story with you.

Story: {test_title} - {test_description}

Be genuinely curious, warm, and conversational. Ask natural questions and respond as a caring friend would. Avoid therapeutic jargon or structured responses."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"I want to share a memory with you. The title is '{test_title}' and here's what happened: {test_description}"}
        ]
        
        try:
            response = self.call_lmstudio_api(messages)
            return {
                "success": True,
                "context": {
                    "test_title": test_title,
                    "test_description": test_description,
                    "timestamp": datetime.now().isoformat()
                },
                "ai_response": response.get("content", "")
            }
        except Exception as e:
            print(f"Error in process_test_inputs: {e}")
            print(f"Error type: {type(e)}")
            # Get custom fallback response from configuration
            fallback_response = config_manager.get_custom_response("fallback")
            if "{test_title}" in fallback_response:
                fallback_response = fallback_response.replace("{test_title}", test_title)
            
            # Add personalized touch if response is too generic
            if fallback_response == config_manager.get_custom_response("fallback"):
                fallback_response = f"""That's a really interesting story about {test_title}. 🌱

What made you want to share this with me? I'd love to hear more about what this memory means to you."""
            
            return {
                "success": True,  # Mark as success to show the fallback response
                "context": {
                    "test_title": test_title,
                    "test_description": test_description,
                    "timestamp": datetime.now().isoformat()
                },
                "ai_response": fallback_response,
                "fallback_mode": True
            }
    
    def call_lmstudio_api(self, messages: List[Dict]) -> Dict[str, Any]:
        """Make API call to LM Studio using OpenAI-compatible API"""
        print(f"Making API call to LM Studio with messages: {messages}")
        
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                response_data = response.json()
                print(f"✅ LM Studio response received successfully")
                print(f"Response content: {response_data['choices'][0]['message']['content']}")
                
                return {
                    "role": "assistant",
                    "content": response_data['choices'][0]['message']['content']
                }
            else:
                error_text = response.text if response.text else "No error details"
                print(f"❌ LM Studio API error: {response.status_code} - {error_text}")
                raise Exception(f"LM Studio API error: {response.status_code} - {error_text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {e}")
            raise Exception(f"Network error: {e}")
        except Exception as e:
            print(f"❌ General error: {e}")
            raise
    
    def continue_conversation(self, user_message: str, conversation_history: List[Dict] = None, test_context: Dict = None) -> Dict[str, Any]:
        """Continue an existing conversation with DeepSeek"""
        
        messages = []
        
        # Get personality prompt from configuration
        personality_prompt = config_manager.get_personality_prompt()
        
        # Add system prompt with test context if available
        if test_context:
            system_prompt = f"""{personality_prompt}

You're continuing a natural conversation with someone who shared a story with you.

Story: {test_context.get('test_title', 'N/A')} - {test_context.get('test_description', 'N/A')}

Be genuinely curious, warm, and conversational. Respond naturally as a caring friend would."""
        else:
            system_prompt = f"""{personality_prompt}

You're having a natural conversation. Be genuinely curious and warm. Respond as a caring friend would."""
        
        messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        try:
            response = self.call_lmstudio_api(messages)
            return {
                "success": True,
                "ai_response": response.get("content", ""),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error in continue_conversation: {e}")
            print(f"Error type: {type(e)}")
            # Get custom fallback response from configuration
            fallback_response = config_manager.get_custom_response("reflection")
            if "{user_message}" in fallback_response:
                fallback_response = fallback_response.replace("{user_message}", user_message)
            
            # Add personalized touch if response is too generic
            if fallback_response == config_manager.get_custom_response("reflection"):
                # Include context if available
                context_reference = ""
                if test_context and test_context.get('test_title'):
                    context_reference = f" I remember you shared about '{test_context.get('test_title')}' earlier. "
                
                fallback_response = f"""That's really interesting{context_reference}

What's on your mind about that? I'm curious to hear more."""
            
            return {
                "success": True,  # Mark as success to show the fallback response
                "ai_response": fallback_response,
                "timestamp": datetime.now().isoformat(),
                "fallback_mode": True
            }

def process_memory_garden_test(test_title: str, test_description: str, api_key: str = None) -> Dict[str, Any]:
    """Main function to process Memory Garden test inputs"""
    try:
        ai_tester = LMStudioAITester()
        return ai_tester.process_test_inputs(test_title, test_description)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "context": {
                "test_title": test_title,
                "test_description": test_description,
                "timestamp": datetime.now().isoformat()
            }
        } 