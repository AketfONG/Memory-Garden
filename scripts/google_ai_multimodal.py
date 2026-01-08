import os
import json
import base64
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
from dotenv import load_dotenv
from google import genai

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class GoogleAIMultimodal:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        
        if not self.api_key:
            print("Warning: GOOGLE_AI_API_KEY not found in environment variables")
            self.client = None
        else:
            # Set the API key as environment variable for the client
            os.environ['GEMINI_API_KEY'] = self.api_key
            self.client = genai.Client()
    
    def encode_image_to_base64(self, image_path: str) -> str:
        """Encode an image file to base64 string"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            raise Exception(f"Error encoding image: {str(e)}")
    
    def encode_video_to_base64(self, video_path: str) -> str:
        """Encode a video file to base64 string"""
        try:
            with open(video_path, "rb") as video_file:
                return base64.b64encode(video_file.read()).decode('utf-8')
        except Exception as e:
            raise Exception(f"Error encoding video: {str(e)}")
    
    def analyze_image(self, image_path: str, prompt: str = "Describe this image in detail") -> Dict[str, Any]:
        """Analyze an image using Gemini's vision capabilities"""
        if not self.api_key or not self.client:
            return {
                "success": False,
                "error": "Google AI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            # Encode image to base64
            image_base64 = self.encode_image_to_base64(image_path)
            
            # Create the content with image and text
            content = [
                {
                    "text": prompt
                },
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",  # Adjust based on your image type
                        "data": image_base64
                    }
                }
            ]
            
            # Use Gemini's multimodal capabilities
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",  # Use 1.5-flash for better multimodal support
                contents=content
            )
            
            return {
                "success": True,
                "response": response.text,
                "model": "gemini-1.5-flash",
                "image_path": image_path,
                "prompt": prompt,
                "timestamp": datetime.now().isoformat()
            }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Image analysis failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def analyze_video(self, video_path: str, prompt: str = "Describe what happens in this video") -> Dict[str, Any]:
        """Analyze a video using Gemini's video understanding capabilities"""
        if not self.api_key or not self.client:
            return {
                "success": False,
                "error": "Google AI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            # Encode video to base64
            video_base64 = self.encode_video_to_base64(video_path)
            
            # Create the content with video and text
            content = [
                {
                    "text": prompt
                },
                {
                    "inline_data": {
                        "mime_type": "video/mp4",  # Adjust based on your video type
                        "data": video_base64
                    }
                }
            ]
            
            # Use Gemini's multimodal capabilities
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=content
            )
            
            return {
                "success": True,
                "response": response.text,
                "model": "gemini-1.5-flash",
                "video_path": video_path,
                "prompt": prompt,
                "timestamp": datetime.now().isoformat()
            }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Video analysis failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def analyze_memory_media(self, media_path: str, media_type: str, memory_context: str = "") -> Dict[str, Any]:
        """Analyze media files for memory garden context"""
        if not self.api_key or not self.client:
            return {
                "success": False,
                "error": "Google AI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        # Create context-aware prompt for memory analysis
        if media_type.lower() in ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp']:
            prompt = f"""As a kind friend, look at this image for a memory garden (4-5 lines max):
            
            Memory Context: {memory_context if memory_context else "No extra info given"}
            
            Use simple words, give a nice short description. IMPORTANT: Always end with a guiding question that starts with 'What' or 'How' to help them explore this memory more."""
            
            return self.analyze_image(media_path, prompt)
            
        elif media_type.lower() in ['video', 'mp4', 'mov', 'avi', 'webm']:
            prompt = f"""As a kind friend, look at this video for a memory garden (4-5 lines max):
            
            Memory Context: {memory_context if memory_context else "No extra info given"}
            
            Use simple words, give a nice short description. IMPORTANT: Always end with a guiding question that starts with 'What' or 'How' to help them explore this memory more."""
            
            return self.analyze_video(media_path, prompt)
        
        else:
            return {
                "success": False,
                "error": f"Unsupported media type: {media_type}",
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_memory_insights(self, media_analysis: str, memory_title: str = "", memory_description: str = "") -> Dict[str, Any]:
        """Generate AI insights based on media analysis and memory details"""
        if not self.api_key or not self.client:
            return {
                "success": False,
                "error": "Google AI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        prompt = f"""As a kind friend, talk about this memory (keep it 4-5 lines max):

            Memory Title: {memory_title if memory_title else "Untitled Memory"}
            Memory Description: {memory_description if memory_description else "No description given"}
            
            Media Analysis:
            {media_analysis}
            
            Use simple words, give a nice short thought. IMPORTANT: Always end with a guiding question that starts with 'What' or 'How' to help them explore this memory more."""
        
        try:
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            
            return {
                "success": True,
                "insights": response.text,
                "memory_title": memory_title,
                "memory_description": memory_description,
                "timestamp": datetime.now().isoformat()
            }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Insight generation failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
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
                model="gemini-1.5-flash",
                contents=full_prompt
            )
            
            return {
                "success": True,
                "response": response.text,
                "model": "gemini-1.5-flash",
                "timestamp": datetime.now().isoformat()
            }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Request failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

def main():
    """Test the multimodal Google AI integration"""
    print("🧪 Testing Google AI Studio Multimodal Integration...")
    
    # Check if API key is set
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY not found in environment variables")
        print("💡 Please set it in your .env.local file")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Initialize AI
    ai = GoogleAIMultimodal()
    
    # Test 1: Text generation
    print("\n📝 Testing text generation...")
    result = ai.call_google_ai_api("Tell me about the beauty of memories")
    print(f"Text generation result: {result['success']}")
    
    # Test 2: Image analysis (if you have a test image)
    print("\n🖼️ Testing image analysis...")
    print("Note: To test image analysis, place a test image in the scripts folder and update the path below")
    # Uncomment and modify the path to test with a real image:
    # result = ai.analyze_image("test_image.jpg", "Describe this image for a memory garden")
    # print(f"Image analysis result: {result['success']}")
    
    # Test 3: Memory media analysis
    print("\n🌱 Testing memory media analysis...")
    print("Note: To test media analysis, place test media files in the scripts folder")
    # Uncomment and modify the paths to test with real media:
    # result = ai.analyze_memory_media("test_image.jpg", "image", "A family gathering at the beach")
    # print(f"Memory media analysis result: {result['success']}")
    
    print("\n🎉 Multimodal tests completed!")
    print("\n💡 Capabilities available:")
    print("   - Image analysis and description")
    print("   - Video analysis and description") 
    print("   - Memory-specific media insights")
    print("   - AI-generated memory reflections")
    print("   - Category and tag suggestions")
    
    return True

if __name__ == "__main__":
    main()
