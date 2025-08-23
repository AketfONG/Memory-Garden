# Ollama Setup Guide

## 🌱 **What is Ollama?**
Ollama is a free, local AI service that runs on your computer. It's completely free with no API costs or rate limits!

## 📥 **Installation**

### **macOS:**
```bash
# Download and install
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve
```

### **Windows:**
1. Download from: https://ollama.ai/download
2. Run the installer
3. Start Ollama from the desktop app

### **Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

## 🚀 **Quick Start**

1. **Install Ollama** (see above)
2. **Start Ollama** in a terminal:
   ```bash
   ollama serve
   ```
3. **Download a model** (in another terminal):
   ```bash
   ollama pull llama3.2
   ```
4. **Test it works**:
   ```bash
   ollama run llama3.2 "Hello, how are you?"
   ```

## 🎯 **Available Models**

### **Recommended Models:**
- `llama3.2` - Fast and good quality
- `mistral` - Great balance of speed/quality
- `llama3.1` - Very good quality, slower
- `codellama` - Good for coding tasks

### **Download a Model:**
```bash
ollama pull llama3.2
```

## 🔧 **Usage with Memory Garden**

Once Ollama is running, the Memory Garden will automatically:
- ✅ Connect to Ollama on `localhost:11434`
- ✅ Use the `llama3.2` model by default
- ✅ Provide unlimited free AI responses
- ✅ Keep all conversations private (local)

## 🛠 **Troubleshooting**

### **Ollama not running:**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve
```

### **Model not found:**
```bash
# List available models
ollama list

# Download the model
ollama pull llama3.2
```

### **Port already in use:**
```bash
# Kill existing Ollama process
pkill ollama

# Start fresh
ollama serve
```

## 🌟 **Benefits of Ollama**

- 💰 **Completely Free** - No API costs
- 🔒 **Private** - Everything stays on your device
- ⚡ **Fast** - No network latency
- 🚫 **No Rate Limits** - Unlimited usage
- 🎯 **Offline** - Works without internet
- 🔧 **Customizable** - Choose your model

## 📚 **More Information**

- Website: https://ollama.ai
- Documentation: https://ollama.ai/docs
- Models: https://ollama.ai/library 