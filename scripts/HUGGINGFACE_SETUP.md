# 🚀 Hugging Face AI Integration Setup

## ✨ **Why Hugging Face?**
- **Free tier**: 30,000 requests/month
- **No credit card required**
- **Many open-source models**
- **Simple API integration**

## 📋 **Setup Steps:**

### **1. Get Your Free API Key**
1. Go to [Hugging Face](https://huggingface.co/)
2. Click "Sign Up" (free account)
3. Verify your email
4. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
5. Click "New token"
6. Give it a name (e.g., "Memory Garden")
7. Select "Read" permissions
8. Copy the token

### **2. Add to Environment**
1. Copy your `.env.local.example` to `.env.local`
2. Add your API key:
   ```bash
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```

### **3. Test the Integration**
```bash
cd scripts
python test_huggingface.py
```

## 🔧 **Usage Examples:**

### **Memory Garden Test:**
```python
from huggingface_ai import HuggingFaceAI

ai = HuggingFaceAI()
result = ai.process_memory_garden_test(
    "Morning Coffee", 
    "Sitting on the porch with a warm cup of coffee"
)
```

### **Navigation Chat:**
```python
result = ai.continue_conversation(
    "How do I plant a memory?",
    conversation_history,
    {"website_name": "Memory Garden"}
)
```

## 🌟 **Available Models:**
- **microsoft/DialoGPT-medium** (default) - Good for conversations
- **gpt2** - General text generation
- **distilgpt2** - Faster, lighter version
- **microsoft/DialoGPT-large** - Better quality (slower)

## 💡 **Tips:**
- Start with the default model
- Keep prompts concise
- The free tier is generous for development
- Models may take a few seconds to respond on first use

## 🆘 **Troubleshooting:**
- **"API key not configured"**: Check your `.env.local` file
- **"API request failed"**: Verify your token is correct
- **Slow responses**: First request loads the model (subsequent requests are faster)

## 🔄 **Switching from LM Studio:**
1. Update your API routes to use `huggingface_ai.py`
2. Set the environment variable
3. Test with the provided script
4. Enjoy free AI responses! 🎉

