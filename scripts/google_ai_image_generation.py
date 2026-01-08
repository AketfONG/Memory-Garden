import os
import json
import base64
from datetime import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from google import genai

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

class GoogleAIImageGeneration:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        
        if not self.api_key:
            print("Warning: GOOGLE_AI_API_KEY not found in environment variables")
            self.client = None
        else:
            # Set the API key as environment variable for the client
            os.environ['GEMINI_API_KEY'] = self.api_key
            self.client = genai.Client()
    
    def generate_image(self, prompt: str, output_path: str = None) -> Dict[str, Any]:
        """Generate an image using Google AI Studio's Imagen 4 model"""
        if not self.api_key or not self.client:
            return {
                "success": False,
                "error": "Google AI API key not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            # Use Gemini 2.0 Flash with image generation capabilities
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp-image-generation",
                contents=prompt,
                config={
                    "responseModalities": ["TEXT", "IMAGE"]
                }
            )
            
            # Extract image data from response
            image_data = None
            text_response = ""
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'text') and part.text:
                    text_response = part.text
                elif hasattr(part, 'inlineData') and part.inlineData:
                    image_data = part.inlineData.data
                elif hasattr(part, 'fileData') and part.fileData:
                    # Alternative way to access image data
                    image_data = part.fileData.data
                elif hasattr(part, 'inline_data') and part.inline_data:
                    # Another way to access image data (from dict)
                    if isinstance(part.inline_data, dict):
                        image_data = part.inline_data.get('data')
                    else:
                        image_data = part.inline_data.data
            
            if not image_data:
                return {
                    "success": False,
                    "error": "No image data received from API",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Save image if output path is provided
            if output_path:
                try:
                    with open(output_path, 'wb') as f:
                        f.write(base64.b64decode(image_data))
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"Failed to save image: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    }
            
            return {
                "success": True,
                "image_data": image_data,
                "text_response": text_response,
                "output_path": output_path,
                "prompt": prompt,
                "timestamp": datetime.now().isoformat()
            }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Image generation failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_memory_visualization(self, memory_title: str, memory_description: str, style: str = "realistic") -> Dict[str, Any]:
        """Generate a visual representation of a memory for the Memory Garden"""
        
        # Create a detailed prompt based on memory content
        style_prompts = {
            "realistic": "photorealistic, high quality, detailed",
            "artistic": "artistic, painterly, beautiful brushstrokes",
            "dreamy": "dreamy, ethereal, soft lighting, magical",
            "minimalist": "minimalist, clean, simple, elegant",
            "watercolor": "watercolor painting, soft colors, artistic",
            "sketch": "pencil sketch, hand-drawn, artistic"
        }
        
        style_desc = style_prompts.get(style, style_prompts["realistic"])
        
        prompt = f"""Create a beautiful {style_desc} image for this memory:

Title: {memory_title}
Description: {memory_description}

Make it warm, nostalgic, and perfect for a memory garden. 1024x1024 pixels, square format."""
        
        return self.generate_image(prompt)
    
    def generate_garden_background(self, theme: str = "peaceful") -> Dict[str, Any]:
        """Generate background images for the Memory Garden"""
        
        theme_prompts = {
            "peaceful": "A serene, peaceful garden with soft sunlight filtering through leaves, gentle flowers, and a calm atmosphere",
            "magical": "A magical garden with glowing flowers, sparkling dewdrops, and an ethereal, enchanting atmosphere",
            "nostalgic": "A nostalgic garden with vintage elements, warm golden light, and a sense of cherished memories",
            "minimalist": "A clean, minimalist garden design with simple geometric shapes, soft colors, and elegant simplicity",
            "tropical": "A lush tropical garden with vibrant colors, exotic plants, and a warm, inviting atmosphere",
            "zen": "A zen garden with raked sand, smooth stones, bamboo, and a meditative, peaceful atmosphere"
        }
        
        base_prompt = theme_prompts.get(theme, theme_prompts["peaceful"])
        
        prompt = f"""Create a beautiful {base_prompt} for a memory garden background. 

Warm, inviting, and perfect for a memory garden. 1920x1080 pixels, landscape format."""
        
        return self.generate_image(prompt)
    
    def generate_memory_icon(self, category: str, emotion: str = "neutral") -> Dict[str, Any]:
        """Generate category-specific icons for memories"""
        
        category_icons = {
            "family": "A warm, loving family gathering with people hugging and smiling",
            "nature": "A beautiful natural landscape with trees, flowers, and peaceful scenery",
            "achievement": "A celebration scene with success symbols, trophies, or graduation caps",
            "travel": "A travel scene with suitcases, maps, or famous landmarks",
            "work": "A professional workspace with people collaborating and achieving goals",
            "love": "A romantic scene with hearts, couples, or wedding elements",
            "health": "A healthy lifestyle scene with exercise, wellness, or medical care",
            "creativity": "An artistic scene with paintbrushes, canvases, or creative tools",
            "learning": "A learning environment with books, students, or educational elements",
            "friends": "A group of friends laughing and enjoying time together"
        }
        
        emotion_modifiers = {
            "happy": "bright, cheerful, joyful",
            "sad": "soft, gentle, melancholic",
            "excited": "energetic, vibrant, dynamic",
            "peaceful": "calm, serene, tranquil",
            "proud": "confident, strong, accomplished",
            "grateful": "warm, appreciative, heartfelt",
            "nostalgic": "vintage, sepia-toned, reminiscent",
            "hopeful": "bright, optimistic, uplifting"
        }
        
        base_description = category_icons.get(category, "A meaningful moment in life")
        emotion_desc = emotion_modifiers.get(emotion, "neutral, balanced")
        
        prompt = f"""Create a beautiful, {emotion_desc} icon for {category}.

Description: {base_description}

Simple, recognizable, and perfect for a memory garden. 512x512 pixels, square format."""
        
        return self.generate_image(prompt)
    
    def generate_ai_artwork(self, memory_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI artwork based on complete memory data"""
        
        # Extract key information from memory
        title = memory_data.get('title', 'Untitled Memory')
        description = memory_data.get('description', '')
        categories = memory_data.get('categories', [])
        emotions = memory_data.get('emotions', [])
        tags = memory_data.get('tags', '')
        
        # Build a comprehensive prompt
        category_text = ', '.join(categories) if categories else 'general'
        emotion_text = ', '.join(emotions) if emotions else 'neutral'
        
        prompt = f"""Create a beautiful, artistic representation of this memory:

Title: {title}
Description: {description}
Categories: {category_text}
Emotions: {emotion_text}
Tags: {tags}

Make it feel like a treasured moment captured in beautiful art. 1024x1024 pixels, square format."""
        
        return self.generate_image(prompt)

def main():
    """Test the image generation functionality"""
    print("🎨 Testing Google AI Studio Image Generation...")
    
    # Check if API key is set
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY not found in environment variables")
        print("💡 Please set it in your .env.local file")
        return False
    
    print(f"✅ API key found: {api_key[:8]}...")
    
    # Initialize AI
    ai = GoogleAIImageGeneration()
    
    # Test 1: Basic image generation
    print("\n🖼️ Testing basic image generation...")
    result = ai.generate_image(
        "A beautiful garden with colorful flowers and a peaceful atmosphere, perfect for a memory garden application",
        "test_garden.png"
    )
    
    if result["success"]:
        print("✅ Basic image generation successful!")
        print(f"Image saved to: {result['output_path']}")
        if result['text_response']:
            print(f"AI Response: {result['text_response'][:100]}...")
    else:
        print(f"❌ Basic image generation failed: {result['error']}")
    
    # Test 2: Memory visualization
    print("\n🌱 Testing memory visualization...")
    memory_result = ai.generate_memory_visualization(
        "Beach Sunset",
        "A beautiful evening watching the sun set over the ocean with family",
        "artistic"
    )
    
    if memory_result["success"]:
        print("✅ Memory visualization successful!")
        # Save the image
        with open("test_memory.png", "wb") as f:
            f.write(base64.b64decode(memory_result["image_data"]))
        print("Memory image saved to: test_memory.png")
    else:
        print(f"❌ Memory visualization failed: {memory_result['error']}")
    
    # Test 3: Category icon generation
    print("\n🏷️ Testing category icon generation...")
    icon_result = ai.generate_memory_icon("family", "happy")
    
    if icon_result["success"]:
        print("✅ Category icon generation successful!")
        # Save the icon
        with open("test_icon.png", "wb") as f:
            f.write(base64.b64decode(icon_result["image_data"]))
        print("Category icon saved to: test_icon.png")
    else:
        print(f"❌ Category icon generation failed: {icon_result['error']}")
    
    print("\n🎉 Image generation tests completed!")
    print("\n💡 Available features:")
    print("  - Generate images from text prompts")
    print("  - Create memory visualizations")
    print("  - Generate category icons")
    print("  - Create garden backgrounds")
    print("  - Generate AI artwork from memory data")
    
    return True

def handle_api_request():
    """Handle API request from Next.js"""
    try:
        # Read JSON input from stdin
        import sys
        input_data = json.loads(sys.stdin.read())
        
        # Initialize AI
        ai = GoogleAIImageGeneration()
        
        # Extract parameters
        prompt = input_data.get('prompt', '')
        memory_title = input_data.get('memoryTitle', '')
        memory_description = input_data.get('memoryDescription', '')
        category = input_data.get('category', '')
        emotion = input_data.get('emotion', '')
        style = input_data.get('style', 'realistic')
        type_param = input_data.get('type', 'custom')
        
        # Generate image based on type
        if type_param == "memory_visualization":
            result = ai.generate_memory_visualization(memory_title, memory_description, style)
        elif type_param == "category_icon":
            result = ai.generate_memory_icon(category, emotion or "neutral")
        elif type_param == "garden_background":
            result = ai.generate_garden_background(style)
        elif type_param == "ai_artwork":
            memory_data = {
                "title": memory_title,
                "description": memory_description,
                "categories": [category] if category else [],
                "emotions": [emotion] if emotion else [],
                "tags": input_data.get('tags', '')
            }
            result = ai.generate_ai_artwork(memory_data)
        else:  # custom
            result = ai.generate_image(prompt)
        
        # Output JSON result
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    # Check if we're being called from API (has stdin input)
    import sys
    if not sys.stdin.isatty():
        # Called from API
        handle_api_request()
    else:
        # Called directly for testing
        success = main()
        exit(0 if success else 1)
