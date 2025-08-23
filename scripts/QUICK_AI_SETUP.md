# 🚀 Quick AI Setup Guide for Memory Garden

## 🎯 **Current Status:**
- ✅ Hugging Face API key configured
- ❌ Hugging Face token lacks inference permissions
- 🔄 Need to fix permissions or use alternative

## 🔧 **Option 1: Fix Hugging Face (Recommended)**

### **Fix Token Permissions:**
1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Name: "Memory Garden AI"
4. **Select "Write" permissions** (includes inference)
5. Generate and copy new token
6. Update `.env.local` with new token

### **Test:**
```bash
cd scripts
python3 test_huggingface.py
```

## 🆓 **Option 2: Use OpenAI (Free $5/month)**

### **Get API Key:**
1. Go to: https://platform.openai.com/api-keys
2. Sign up/login
3. Create new API key
4. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk_your_key_here
   ```

### **Test:**
```bash
cd scripts
python3 openai_ai.py
```

## 🏠 **Option 3: Continue with LM Studio (Local, Free)**

### **Keep using what you have:**
- LM Studio is completely free
- Runs locally on your machine
- No API limits or costs
- Just need to start the local server

## 🚀 **Quick Test Commands:**

```bash
# Test Hugging Face (after fixing permissions)
python3 test_huggingface.py

# Test OpenAI (after getting API key)
python3 openai_ai.py

# Check current environment
cat ../.env.local
```

## 💡 **Recommendation:**
1. **Try fixing Hugging Face first** (most generous free tier)
2. **Fallback to OpenAI** (very reliable, $5 free credit)
3. **Keep LM Studio** as local backup (completely free)

## 🔄 **Next Steps:**
1. Fix Hugging Face permissions, OR
2. Get OpenAI API key, OR
3. Continue with LM Studio
4. Test the chosen solution
5. Update API routes to use working service

**Need help?** Run the diagnostic scripts to see what's working!

