#!/usr/bin/env python3
import sys
import json
import os
from datetime import datetime
from lmstudio_ai import LMStudioAITester

# Suppress debug output
os.environ['SUPPRESS_DEBUG'] = 'true'

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Message is required"}))
        return

    message = sys.argv[1]
    conversation_history = []
    
    if len(sys.argv) >= 3:
        try:
            conversation_history = json.loads(sys.argv[2])
        except json.JSONDecodeError:
            print(json.dumps({"error": "Invalid conversation history format"}))
            return

    try:
        # Initialize AI tester
        ai_tester = LMStudioAITester()
        
        # Create website assistance context
        website_context = {
            "website_name": "Memory Garden",
            "purpose": "A therapeutic space for sharing and cherishing memories with AI assistance",
            "main_features": [
                "Plant memories with AI assistance",
                "View memory garden organized by date", 
                "Add photos, videos, and audio to memories",
                "Chat about memories with AI",
                "Take interactive tour",
                "Customize visual styles",
                "Test AI features"
            ],
            "navigation_help": {
                "plant_memory": "Click '🪴 Plant Your First Memory' on home page, fill title and story, add media (optional), click 'Plant This Memory'",
                "view_garden": "Click '🌱 View My Garden' on home page or use navigation menu to see all memories organized by date",
                "take_tour": "Click '🎬 Take a Tour' on home page for interactive guide",
                "style_config": "Click '🎨 Style Configuration' in navigation or visit Updates page",
                "ai_testing": "Go to Updates page and click '🧪 Testing' button",
                "features": "Visit Features page to learn about all capabilities"
            },
            "technical_info": {
                "ui_elements": "Memory Garden is built with Next.js, React, and Tailwind CSS. UI elements are styled with Tailwind classes and can be customized through the style configuration.",
                "code_structure": "The codebase uses TypeScript with components in app/components/, pages in app/, and API routes in app/api/",
                "styling": "Styles are managed through Tailwind CSS classes and can be customized via the style configuration page"
            }
        }

        # Get AI response
        result = ai_tester.continue_conversation(
            user_message=message,
            conversation_history=conversation_history,
            test_context=website_context
        )

        if result.get('success'):
            print(json.dumps({
                "success": True,
                "ai_response": result.get('ai_response', ''),
                "timestamp": datetime.now().isoformat()
            }))
        else:
            print(json.dumps({
                "success": False,
                "error": result.get('error', 'Unknown error'),
                "timestamp": datetime.now().isoformat()
            }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }))

if __name__ == "__main__":
    main() 