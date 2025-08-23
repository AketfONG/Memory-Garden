# LM Studio Setup Guide

## 🌱 **What is LM Studio?**
LM Studio is a free, local AI service with a beautiful GUI interface. It's completely free with no API costs or rate limits!

## 📥 **Installation**

### **macOS:**
1. Download from: https://lmstudio.ai
2. Install the `.dmg` file
3. Launch LM Studio from Applications

### **Windows:**
1. Download from: https://lmstudio.ai
2. Run the installer
3. Launch LM Studio from Start Menu

### **Linux:**
1. Download from: https://lmstudio.ai
2. Extract and run the binary

## 🚀 **Quick Start**

1. **Install LM Studio** (see above)
2. **Launch LM Studio**
3. **Download a model**:
   - Click "Search" in the left sidebar
   - Search for models like "llama3.2" or "mistral"
   - Click "Download" on your preferred model
4. **Load the model**:
   - Click "Local Server" in the left sidebar
   - Select your downloaded model
   - Click "Start Server"
5. **Enable Local Server**:
   - In Local Server settings, make sure "Local Server" is enabled
   - The server will run on `http://localhost:1234`

## 🎯 **Recommended Models**

### **Fast & Good Quality:**
- `llama3.2:3b` - Very fast, good for conversations
- `mistral:7b` - Great balance of speed/quality
- `llama3.1:8b` - Good quality, moderate speed

### **High Quality (Slower):**
- `llama3.1:70b` - Excellent quality, slower
- `codellama:34b` - Great for coding tasks

## 🔧 **Usage with Memory Garden**

Once LM Studio is running, the Memory Garden will automatically:
- ✅ Connect to LM Studio on `http://localhost:1234/v1`
- ✅ Use the loaded model automatically
- ✅ Provide unlimited free AI responses
- ✅ Keep all conversations private (local)

## 🛠 **Troubleshooting**

### **LM Studio not running:**
```bash
# Check if LM Studio server is running
curl http://localhost:1234/v1/models

# If not responding, make sure:
# 1. LM Studio is open
# 2. Local Server is started
# 3. A model is loaded
```

### **Model not loading:**
1. Make sure you have enough RAM (8GB+ recommended)
2. Try a smaller model first (3B or 7B)
3. Check if the model download completed

### **Server not starting:**
1. Go to "Local Server" in LM Studio
2. Make sure "Local Server" is enabled
3. Select a model and click "Start Server"
4. Check the status shows "Running"

## 🌟 **Benefits of LM Studio**

- 💰 **Completely Free** - No API costs
- 🎨 **Beautiful GUI** - Easy to use interface
- 🔒 **Private** - Everything stays on your device
- ⚡ **Fast** - No network latency
- 🚫 **No Rate Limits** - Unlimited usage
- 🎯 **Offline** - Works without internet
- 🔧 **Easy Model Management** - Download and switch models easily

## 📚 **More Information**

- Website: https://lmstudio.ai
- Documentation: https://lmstudio.ai/docs
- Community: https://discord.gg/lmstudio

## 🔄 **Switching from Ollama**

If you were using Ollama before:
1. **Stop Ollama**: `pkill ollama`
2. **Install LM Studio** (see above)
3. **Start LM Studio** and load a model
4. **Memory Garden will automatically connect** to LM Studio

## 🎯 **Model Recommendations for Memory Garden**

For the best therapy/conversation experience:
- **Start with**: `llama3.2:3b` (fast and good)
- **Upgrade to**: `mistral:7b` (better quality)
- **Best quality**: `llama3.1:8b` (excellent conversations) 