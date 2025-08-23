import json
import os
from typing import Dict, Any, Optional
from datetime import datetime

class AIConfigManager:
    def __init__(self, config_file: str = "ai_config.json"):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Load AI configuration from file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                # Return default config if file doesn't exist
                return self.get_default_config()
        except Exception as e:
            print(f"Error loading config: {e}")
            return self.get_default_config()
    
    def save_config(self, config: Dict[str, Any]) -> bool:
        """Save AI configuration to file"""
        try:
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            self.config = config
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False
    
    def get_default_config(self) -> Dict[str, Any]:
        """Get default AI configuration"""
        return {
            "personality": {
                "role": "compassionate_therapist",
                "tone": "warm_and_empathetic",
                "style": "gentle_and_supportive",
                "approach": "listening_and_reflecting"
            },
            "responses": {
                "greeting": "I'm here to listen and support you. What's on your heart today? 💚",
                "fallback": "I hear you. Take your time - I'm here with you. 💚",
                "encouragement": "You're doing great. Keep sharing what feels right for you.",
                "reflection": "That sounds like it's bringing up some real feelings for you.",
                "closing": "Thank you for sharing with me. I'm here whenever you need to talk."
            },
            "therapeutic_techniques": {
                "active_listening": True,
                "reflective_responses": True,
                "emotional_validation": True,
                "gentle_questioning": True,
                "mindfulness_prompts": True
            },
            "conversation_flow": {
                "max_response_length": 200,
                "use_emojis": True,
                "ask_follow_up_questions": True,
                "acknowledge_emotions": True,
                "provide_safe_space": True
            },
            "custom_prompts": {
                "memory_sharing": "Tell me more about this memory. What makes it special to you?",
                "emotional_exploration": "What feelings come up when you think about this?",
                "support_offering": "How can I best support you right now?",
                "reflection_request": "Would you like to explore this further?"
            }
        }
    
    def update_config(self, updates: Dict[str, Any]) -> bool:
        """Update specific parts of the configuration"""
        try:
            # Deep merge updates into existing config
            self.merge_config(self.config, updates)
            return self.save_config(self.config)
        except Exception as e:
            print(f"Error updating config: {e}")
            return False
    
    def merge_config(self, base: Dict[str, Any], updates: Dict[str, Any]) -> None:
        """Recursively merge configuration updates"""
        for key, value in updates.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self.merge_config(base[key], value)
            else:
                base[key] = value
    
    def get_personality_prompt(self) -> str:
        """Generate personality prompt from configuration"""
        personality = self.config.get("personality", {})
        techniques = self.config.get("therapeutic_techniques", {})
        
        prompt = f"""You are a {personality.get('role', 'compassionate_therapist')} with a {personality.get('tone', 'warm_and_empathetic')} tone.

Your approach is {personality.get('approach', 'listening_and_reflecting')} and your style is {personality.get('style', 'gentle_and_supportive')}.

Therapeutic techniques you use:
"""
        
        for technique, enabled in techniques.items():
            if enabled:
                prompt += f"- {technique.replace('_', ' ').title()}\n"
        
        prompt += "\nKeep responses warm, empathetic, and focused on emotional support."
        return prompt
    
    def get_custom_response(self, response_type: str) -> str:
        """Get a custom response based on type"""
        responses = self.config.get("responses", {})
        return responses.get(response_type, responses.get("fallback", "I hear you. 💚"))
    
    def get_conversation_settings(self) -> Dict[str, Any]:
        """Get conversation flow settings"""
        return self.config.get("conversation_flow", {})
    
    def reset_to_default(self) -> bool:
        """Reset configuration to default values"""
        default_config = self.get_default_config()
        return self.save_config(default_config)
    
    def export_config(self) -> str:
        """Export configuration as JSON string"""
        return json.dumps(self.config, indent=2, ensure_ascii=False)
    
    def import_config(self, config_json: str) -> bool:
        """Import configuration from JSON string"""
        try:
            config = json.loads(config_json)
            return self.save_config(config)
        except Exception as e:
            print(f"Error importing config: {e}")
            return False

# Global config manager instance
config_manager = AIConfigManager() 