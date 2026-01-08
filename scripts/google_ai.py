import os
import json
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv
from google import genai

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class GoogleAI:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        
        if not self.api_key:
            print("Warning: GOOGLE_AI_API_KEY not found in environment variables")
            self.client = None
        else:
            # Set the API key as environment variable for the client
            os.environ['GEMINI_API_KEY'] = self.api_key
            self.client = genai.Client()
    
    def call_google_ai_api(self, prompt: str, context: str = None) -> Dict[str, Any]:
        """Call Google AI Studio API for text generation using the new SDK"""
        if not self.api_key or not self.client:
            return {
                "success": False,
                "error": "Google AI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        # Build the full prompt with context
        full_prompt = prompt
        if context:
            full_prompt = f"{context}\n\n{prompt}"
        
        try:
            # Use the new Google GenAI SDK
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt
            )
            
            return {
                "success": True,
                "response": response.text,
                "model": "gemini-2.5-flash",
                "timestamp": datetime.now().isoformat()
            }
                
        except Exception as e:
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
                "response": "Hi! 🌱 Ready to look at your memory garden? What memory would you like to plant today?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "memory" in prompt_lower or "garden" in prompt_lower:
            return {
                "success": True,
                "response": "I like helping with memories! What special moment do you want to remember today?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "help" in prompt_lower:
            return {
                "success": True,
                "response": "I'm here to help! What kind of memory are you thinking about planting?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "sunset" in prompt_lower or "walk" in prompt_lower:
            return {
                "success": True,
                "response": "That sounds nice! 🌅 What made that time special for you?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "reflection" in prompt_lower:
            return {
                "success": True,
                "response": "Thinking about things is good! What did this memory show you about yourself?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": True,
                "response": "Hi! I'm here to help with your memory garden. What memory would you like to explore?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
    
    def process_memory_garden_test(self, test_title: str, test_description: str) -> Dict[str, Any]:
        """Process a memory garden test using Google AI"""
        system_context = "You are a kind friend helping with the Memory Garden. Use simple words and easy language. Keep responses short (4-5 lines max), warm, and friendly. ALWAYS end with a guiding question to help them explore their memory deeper."
        
        prompt = f"Talk like a kind friend about this memory:\n\nTitle: {test_title}\nDescription: {test_description}\n\nUse simple words, keep it short (4-5 lines), be warm and friendly. IMPORTANT: Always end with a guiding question that starts with 'What' or 'How' to help them think about this memory more."
        
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
            system_context = "You are Sprout, a kind Memory Garden helper. Use simple words and easy language. Keep responses short (4-5 lines max), warm, and friendly. ALWAYS end with a guiding question to help users explore their memories deeper."
        else:
            system_context = "You are a kind friend helping with the Memory Garden. Use simple words and easy language. Keep responses short (4-5 lines max), warm, and friendly. ALWAYS end with a guiding question to help them think about their memories more."
        
        # Build conversation context
        conversation_text = ""
        for msg in conversation_history[-5:]:  # Last 5 messages to stay within limits
            if msg.get('role') in ['user', 'assistant']:
                role = "User" if msg['role'] == 'user' else "Assistant"
                conversation_text += f"{role}: {msg['content']}\n"
        
        if conversation_text:
            full_prompt = f"{system_context}\n\nPrevious conversation:\n{conversation_text}\n\nUser: {message}\n\nTalk like a kind friend (4-5 lines max, use simple words). IMPORTANT: Always end with a guiding question that starts with 'What' or 'How'."
        else:
            full_prompt = f"{system_context}\n\nUser: {message}\n\nTalk like a kind friend (4-5 lines max, use simple words). IMPORTANT: Always end with a guiding question that starts with 'What' or 'How'."
        
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
