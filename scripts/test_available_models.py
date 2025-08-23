#!/usr/bin/env python3
"""
Test which Hugging Face models are actually available
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

def test_model(model_name):
    """Test if a specific model is available"""
    api_key = os.getenv('HUGGINGFACE_API_KEY')
    if not api_key:
        print("❌ No API key found")
        return False
    
    url = f"https://api-inference.huggingface.co/models/{model_name}"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Model: {model_name}")
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"  ✅ Available!")
            return True
        elif response.status_code == 404:
            print(f"  ❌ Not found")
        else:
            print(f"  ⚠️  Status: {response.status_code}")
        
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    print("🔍 Testing Hugging Face Model Availability")
    print("=" * 50)
    
    # Test various model types
    models_to_test = [
        # Text generation
        "gpt2",
        "distilgpt2", 
        "sshleifer/tiny-gpt2",
        "microsoft/DialoGPT-small",
        "microsoft/DialoGPT-tiny",
        
        # BERT models
        "bert-base-uncased",
        "distilbert-base-uncased",
        
        # Other popular models
        "EleutherAI/gpt-neo-125M",
        "facebook/opt-125m",
        "microsoft/DialoGPT-medium",
        
        # Try some definitely free models
        "sshleifer/distil-gpt2",
        "microsoft/DialoGPT-small",
        "gpt2-medium"
    ]
    
    available_models = []
    
    for model in models_to_test:
        if test_model(model):
            available_models.append(model)
        print()
    
    print("📊 Summary:")
    print(f"Total models tested: {len(models_to_test)}")
    print(f"Available models: {len(available_models)}")
    
    if available_models:
        print("✅ Available models:")
        for model in available_models:
            print(f"  - {model}")
    else:
        print("❌ No models available - this suggests limited free tier access")
        print("💡 Consider upgrading to a paid plan or using alternative services")

if __name__ == "__main__":
    main()

