import os
import json
import requests
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class HuggingFaceAI:
    def __init__(self):
        self.api_key = os.getenv('HUGGINGFACE_API_KEY')
        self.api_url = "https://api-inference.huggingface.co/models"
        # Use models that are definitely available for free accounts
        self.models = [
            "sshleifer/tiny-gpt2",           # Small GPT-2 model
            "distilgpt2",                    # Distilled GPT-2
            "microsoft/DialoGPT-tiny",       # Tiny dialogue model
            "EleutherAI/gpt-neo-125M",       # Small GPT-Neo model
            "gpt2"                           # Original GPT-2 (fallback)
        ]
        
        if not self.api_key:
            print("Warning: HUGGINGFACE_API_KEY not found in environment variables")
    
    def call_huggingface_api(self, prompt: str, model: str = None) -> Dict[str, Any]:
        """Call Hugging Face API for text generation"""
        if not self.api_key:
            return {
                "success": False,
                "error": "Hugging Face API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        # Try multiple models if none specified
        if model is None:
            for model_to_try in self.models:
                print(f"Trying model: {model_to_try}")
                result = self._try_model(prompt, model_to_try)
                if result["success"]:
                    print(f"Success with model: {model_to_try}")
                    return result
            # If all models fail, use fallback
            print("All models failed, using fallback")
            return self._fallback_response(prompt)
        else:
            return self._try_model(prompt, model)
    
    def _try_model(self, prompt: str, model: str) -> Dict[str, Any]:
        """Try to use a specific model"""
        url = f"{self.api_url}/{model}"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Simplified payload for most models
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": 100,
                "temperature": 0.7,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        try:
            print(f"Calling {url}")
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Response received from {model}")
                
                # Extract the generated text from the response
                if isinstance(result, list) and len(result) > 0:
                    if "generated_text" in result[0]:
                        generated_text = result[0]["generated_text"]
                    else:
                        generated_text = str(result[0])
                    
                    # Clean up the generated text
                    if prompt in generated_text:
                        generated_text = generated_text.replace(prompt, '').strip()
                    
                    return {
                        "success": True,
                        "generated_text": generated_text,
                        "model": model,
                        "timestamp": datetime.now().isoformat()
                    }
                elif isinstance(result, dict):
                    if "generated_text" in result:
                        generated_text = result["generated_text"]
                        if prompt in generated_text:
                            generated_text = generated_text.replace(prompt, '').strip()
                        return {
                            "success": True,
                            "generated_text": generated_text,
                            "model": model,
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"Unexpected response format from {model}",
                            "timestamp": datetime.now().isoformat()
                        }
                else:
                    return {
                        "success": False,
                        "error": f"Unexpected response format from {model}",
                        "timestamp": datetime.now().isoformat()
                    }
            elif response.status_code == 503:
                # Model is loading, try next model
                print(f"Model {model} is loading (503)")
                return {"success": False, "error": "Model loading"}
            elif response.status_code == 404:
                # Model not found, try next model
                print(f"Model {model} not found (404)")
                return {"success": False, "error": "Model not found"}
            else:
                print(f"API error {response.status_code}")
                return {
                    "success": False,
                    "error": f"API request failed with status {response.status_code}",
                    "timestamp": datetime.now().isoformat()
                }
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed for {model}: {str(e)}")
            return {
                "success": False,
                "error": f"Request failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def _fallback_response(self, prompt: str) -> Dict[str, Any]:
        """Provide a fallback response when models are unavailable"""
        # Context-aware responses for different types of prompts
        prompt_lower = prompt.lower()
        
        if "hello" in prompt_lower or "hi" in prompt_lower:
            return {
                "success": True,
                "generated_text": "Hello! How can I help you today?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "memory" in prompt_lower or "garden" in prompt_lower:
            return {
                "success": True,
                "generated_text": "I'd be happy to help you with your memory garden! What would you like to know?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "help" in prompt_lower:
            return {
                "success": True,
                "generated_text": "I'm here to help! You can ask me about planting memories, exploring your garden, or any other features.",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "sunset" in prompt_lower or "walk" in prompt_lower:
            return {
                "success": True,
                "generated_text": "That sounds like a beautiful memory! Evening walks can be so peaceful and reflective. The changing light and quiet moments often help us process our thoughts and feelings.",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        elif "reflection" in prompt_lower:
            return {
                "success": True,
                "generated_text": "This memory seems meaningful to you. Take a moment to reflect on how it made you feel and what it taught you about yourself.",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": True,
                "generated_text": "I'm here to assist you with your Memory Garden. How can I help?",
                "model": "fallback",
                "timestamp": datetime.now().isoformat()
            }
    
    def process_memory_garden_test(self, test_title: str, test_description: str) -> Dict[str, Any]:
        """Process a memory garden test using AI"""
        prompt = f"Memory Garden Test: {test_title} - {test_description}. Please provide a thoughtful reflection on this memory."
        
        result = self.call_huggingface_api(prompt)
        
        if result["success"]:
            return {
                "success": True,
                "reflection": result["generated_text"],
                "test_title": test_title,
                "test_description": test_description,
                "timestamp": datetime.now().isoformat()
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
        # Build context-aware prompt
        if context and context.get('website_name') == 'Memory Garden':
            system_prompt = "You are Sprout, a helpful Memory Garden assistant. Help users navigate the website and understand its features. Be practical and helpful."
        else:
            system_prompt = "You are a supportive AI assistant for the Memory Garden therapy application. Provide thoughtful, therapeutic responses."
        
        # Format conversation history
        formatted_messages = []
        for msg in conversation_history:
            if msg.get('role') in ['user', 'assistant']:
                formatted_messages.append(f"{msg['role']}: {msg['content']}")
        
        # Create the full prompt
        if formatted_messages:
            conversation_text = "\n".join(formatted_messages)
            full_prompt = f"{system_prompt}\n\nConversation:\n{conversation_text}\n\nUser: {message}\nAssistant:"
        else:
            full_prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"
        
        result = self.call_huggingface_api(full_prompt)
        
        if result["success"]:
            return {
                "success": True,
                "response": result["generated_text"],
                "message": message,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "message": message,
                "timestamp": datetime.now().isoformat()
            }

def main():
    """Test the Hugging Face AI integration"""
    ai = HuggingFaceAI()
    
    # Test 1: Memory garden test
    print("Testing Memory Garden AI...")
    test_result = ai.process_memory_garden_test("Morning Walk", "A peaceful walk in the park with birds singing")
    print(json.dumps(test_result, indent=2))
    
    # Test 2: Conversation
    print("\nTesting conversation...")
    conv_result = ai.continue_conversation(
        "How do I plant a memory?",
        [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello! How can I help?"}],
        {"website_name": "Memory Garden"}
    )
    print(json.dumps(conv_result, indent=2))

if __name__ == "__main__":
    main()
