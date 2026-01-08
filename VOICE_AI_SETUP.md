# 🎤 Voice AI Setup Guide - Groq + Deepgram

## ✅ **Completed Setup**

1. ✅ Deepgram API key added to `.env.local`
2. ✅ Packages installed (`@deepgram/sdk`, `groq-sdk`)
3. ✅ API routes created (`/api/transcribe`, `/api/groq-chat`)
4. ✅ Voice interaction page updated with streaming

## 🔑 **Next Step: Get Groq API Key**

You need to get a **free Groq API key** to complete the setup:

### **Get Groq API Key (FREE, No Credit Card Required)**

1. **Go to**: https://console.groq.com
2. **Sign up** (free account, no credit card needed)
3. **Create API Key**:
   - Click "API Keys" in the sidebar
   - Click "Create API Key"
   - Give it a name (e.g., "Memory Garden")
   - Copy the key
4. **Add to `.env.local`**:
   ```bash
   GROQ_API_KEY=your_groq_api_key_here
   ```

### **Free Tier Limits:**
- ✅ **14,400 requests/day** (600/hour)
- ✅ **Unlimited** for testing purposes
- ✅ **No credit card required**
- ✅ **Ultra-fast** (<200ms response time)

---

## 🚀 **How It Works**

### **Current Setup:**
1. **Speech Recognition**: Uses browser Web Speech API (free)
2. **AI Responses**: Uses **Groq** (free tier, ultra-fast)
3. **Text-to-Speech**: Uses browser Web Speech API (free)

### **Optional Upgrade (Future):**
- Replace Web Speech API with **Deepgram** for better transcription
- Currently Deepgram API route is ready (`/api/transcribe`)

---

## 🧪 **Testing**

1. **Start the dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Navigate to**: http://localhost:3000/memory-voice

3. **Test the voice interaction**:
   - Click the microphone button
   - Speak your message
   - See real-time streaming responses
   - AI will speak back automatically

---

## 📋 **Current Features**

✅ **Real-time voice input** (browser Web Speech API)  
✅ **Streaming AI responses** (Groq with live updates)  
✅ **Text-to-speech output** (browser Web Speech API)  
✅ **Live conversation** (maintains context)  
✅ **100% free** for testing (Groq free tier)

---

## 🔧 **Troubleshooting**

### **"Groq API key not configured"**
- Make sure you added `GROQ_API_KEY` to `.env.local`
- Restart the dev server after adding the key

### **"Deepgram API key not configured"**
- Your Deepgram key is already added
- If you see this error, check `.env.local` has: `DEEPGRAM_API_KEY=d7fc0d747abcca48cfb7c341ec32eba5c98de431`

### **Voice recognition not working**
- Make sure you allow microphone access in your browser
- Use Chrome, Edge, or Safari (best support)

---

## ✅ **Next Steps**

1. **Get Groq API key** (5 minutes): https://console.groq.com
2. **Add to `.env.local`**: `GROQ_API_KEY=your_key_here`
3. **Restart dev server**
4. **Test at**: `/memory-voice`

**You're almost ready! Just need the Groq API key to enable streaming AI responses.** 🚀



