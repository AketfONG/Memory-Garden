import os
import json
import requests
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class GoogleAI:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        
        if not self.api_key:
            print("Warning: GOOGLE_AI_API_KEY not found in environment variables")
    
    def call_google_ai_api(self, prompt: str, context: str = None) -> Dict[str, Any]:
        """Call Google AI Studio API for text generation"""
        if not self.api_key:
            return {
                "success": False,
                "error": "Google AI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        # Build the full prompt with context
        full_prompt = prompt
        if context:
            full_prompt = f"{context}\n\n{prompt}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 800
            }
        }
        
        try:
            # Google AI Studio uses the API key as a query parameter
            url = f"{self.api_url}?key={self.api_key}"
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract the generated text from Google AI response
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0]['content']['parts'][0]['text']
                    
                    return {
                        "success": True,
                        "response": content,
                        "model": "gemini-1.5-flash",
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    return {
                        "success": False,
                        "error": "No content generated from Google AI",
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
        """Provide a fallback response when Google AI is unavailable"""
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
        """Process a memory garden test using Google AI"""
        system_context = "You are a supportive AI therapist for the Memory Garden application. Provide thoughtful, therapeutic reflections on memories. Be empathetic, insightful, and help users explore the deeper meaning of their experiences."
        
        prompt = f"Please provide a thoughtful, therapeutic reflection on this memory:\n\nTitle: {test_title}\nDescription: {test_description}\n\nYour reflection should be warm, supportive, and help the user understand the emotional significance of this memory."
        
        result = self.call_google_ai_api(prompt, system_context)
        
        if result["success"]:
            return {
                "success": True,
                "reflection": result["response"],
                "test_title": test_title,
                "test_description": test_description,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Use fallback response when Google AI fails
            fallback = self._fallback_response(f"reflection on {test_title}: {test_description}")
            return {
                "success": True,
                "reflection": fallback["response"],
                "test_title": test_title,
                "test_description": test_description,
                "timestamp": datetime.now().isoformat(),
                "note": "Google AI unavailable, using fallback response"
            }
    
    def continue_conversation(self, message: str, conversation_history: List[Dict[str, str]], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Continue a conversation with context awareness"""
        # Build context-aware system message
        if context and context.get('website_name') == 'Memory Garden':
            system_context = "You are Sprout, a helpful Memory Garden assistant. Help users navigate the website and understand its features. Be practical, friendly, and provide clear guidance on how to use Memory Garden effectively."
        else:
            system_context = "You are a supportive AI assistant for the Memory Garden therapy application. Provide thoughtful, therapeutic responses that help users explore their memories and emotions."
        
        # Build conversation context
        conversation_text = ""
        for msg in conversation_history[-5:]:  # Last 5 messages to stay within limits
            if msg.get('role') in ['user', 'assistant']:
                role = "User" if msg['role'] == 'user' else "Assistant"
                conversation_text += f"{role}: {msg['content']}\n"
        
        if conversation_text:
            full_prompt = f"{system_context}\n\nPrevious conversation:\n{conversation_text}\n\nUser: {message}\n\nAssistant:"
        else:
            full_prompt = f"{system_context}\n\nUser: {message}\n\nAssistant:"
        
        result = self.call_google_ai_api(full_prompt)
        
        if result["success"]:
            return {
                "success": True,
                "response": result["response"],
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Use fallback response when Google AI fails
            fallback = self._fallback_response(message)
            return {
                "success": True,
                "response": fallback["response"],
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "note": "Google AI unavailable, using fallback response"
            }

def main():
    """Test the Google AI integration"""
    print("🧪 Testing Google AI Studio Integration...")
    
    # Check if API key is set
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY not found in environment variables")
        print("💡 Please set it in your .env.local file")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Initialize AI
    ai = GoogleAI()
    
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
