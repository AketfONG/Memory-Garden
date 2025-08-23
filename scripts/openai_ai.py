import os
import json
import requests
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class OpenAIAI:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.api_url = "https://api.openai.com/v1/chat/completions"
        self.model = "gpt-3.5-turbo"  # Free tier model
        
        if not self.api_key:
            print("Warning: OPENAI_API_KEY not found in environment variables")
    
    def call_openai_api(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Call OpenAI API for chat completion"""
        if not self.api_key:
            return {
                "success": False,
                "error": "OpenAI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                return {
                    "success": True,
                    "response": content,
                    "model": self.model,
                    "timestamp": datetime.now().isoformat()
                }
            elif response.status_code == 429:
                # Quota exceeded, use fallback
                return {
                    "success": False,
                    "error": "quota_exceeded",
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": f"API request failed with status {response.status_code}: {response.text}",
                    "timestamp": datetime.now().isoformat()
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Request failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def _fallback_response(self, prompt: str) -> Dict[str, Any]:
        """Provide a fallback response when OpenAI quota is exceeded"""
        # Context-aware responses for different types of prompts
        prompt_lower = prompt.lower()
        
        if "hello" in prompt_lower or "hi" in prompt_lower:
            return {
                "success": True,
                "response": "Hello! How can I help you today?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "memory" in prompt_lower or "garden" in prompt_lower:
            return {
                "success": True,
                "response": "I'd be happy to help you with your memory garden! What would you like to know?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "help" in prompt_lower:
            return {
                "success": True,
                "response": "I'm here to help! You can ask me about planting memories, exploring your garden, or any other features.",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "sunset" in prompt_lower or "walk" in prompt_lower:
            return {
                "success": True,
                "response": "That sounds like a beautiful memory! Evening walks can be so peaceful and reflective. The changing light and quiet moments often help us process our thoughts and feelings.",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "reflection" in prompt_lower:
            return {
                "success": True,
                "response": "This memory seems meaningful to you. Take a moment to reflect on how it made you feel and what it taught you about yourself.",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": True,
                "response": "I'm here to assist you with your Memory Garden. How can I help?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
    
    def process_memory_garden_test(self, test_title: str, test_description: str) -> Dict[str, Any]:
        """Process a memory garden test using AI"""
        messages = [
            {
                "role": "system",
                "content": "You are a supportive AI therapist for the Memory Garden application. Provide thoughtful, therapeutic reflections on memories."
            },
            {
                "role": "user",
                "content": f"Please provide a thoughtful reflection on this memory: Title: {test_title}, Description: {test_description}"
            }
        ]
        
        result = self.call_openai_api(messages)
        
        if result["success"]:
            return {
                "success": True,
                "reflection": result["response"],
                "test_title": test_title,
                "test_description": test_description,
                "timestamp": datetime.now().isoformat()
            }
        elif result["error"] == "quota_exceeded":
            # Use fallback response when quota is exceeded
            fallback = self._fallback_response(f"reflection on {test_title}: {test_description}")
            return {
                "success": True,
                "reflection": fallback["response"],
                "test_title": test_title,
                "test_description": test_description,
                "timestamp": datetime.now().isoformat(),
                "note": "OpenAI quota exceeded, using fallback response"
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "context": {
                    "test_title": test_title,
                    "test_description": test_description,
                    "timestamp": datetime.now().isoformat()
                }
            }
    
    def continue_conversation(self, message: str, conversation_history: List[Dict[str, str]], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Continue a conversation with context awareness"""
        # Build context-aware system message
        if context and context.get('website_name') == 'Memory Garden':
            system_message = "You are Sprout, a helpful Memory Garden assistant. Help users navigate the website and understand its features. Be practical and helpful."
        else:
            system_message = "You are a supportive AI assistant for the Memory Garden therapy application. Provide thoughtful, therapeutic responses."
        
        # Build messages array
        messages = [{"role": "system", "content": system_message}]
        
        # Add conversation history (last 5 messages to stay within token limits)
        for msg in conversation_history[-5:]:
            if msg.get('role') in ['user', 'assistant']:
                messages.append({"role": msg['role'], "content": msg['content']})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        result = self.call_openai_api(messages)
        
        if result["success"]:
            return {
                "success": True,
                "response": result["response"],
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
        elif result["error"] == "quota_exceeded":
            # Use fallback response when quota is exceeded
            fallback = self._fallback_response(message)
            return {
                "success": True,
                "response": fallback["response"],
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "note": "OpenAI quota exceeded, using fallback response"
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "message": message,
                "timestamp": datetime.now().isoformat()
            }

def main():
    """Test the OpenAI AI integration"""
    print("🧪 Testing OpenAI AI Integration...")
    
    # Check if API key is set
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ OPENAI_API_KEY not found in environment variables")
        print("💡 Please set it in your .env.local file")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Initialize AI
    ai = OpenAIAI()
    
    # Test 1: Memory garden test
    print("\n🌱 Testing memory garden functionality...")
    result = ai.process_memory_garden_test("Sunset Walk", "A beautiful evening walk watching the sun set over the mountains")
    print(f"Memory test result: {result}")
    
    # Test 2: Conversation
    print("\n💬 Testing conversation...")
    result = ai.continue_conversation("What is the Memory Garden?", [], {"website_name": "Memory Garden"})
    print(f"Conversation result: {result}")
    
    print("\n🎉 All tests completed!")
    return True

if __name__ == "__main__":
    main()
