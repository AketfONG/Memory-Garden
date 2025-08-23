#!/bin/bash

echo "🚀 Setting up Hugging Face AI Integration for Memory Garden"
echo "=========================================================="

# Check if .env.local exists
if [ ! -f "../.env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp ../env.local.example ../.env.local
    echo "✅ .env.local created from template"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔑 Next steps to complete setup:"
echo "1. Go to https://huggingface.co/ and sign up for a free account"
echo "2. Go to Settings > Access Tokens and create a new token"
echo "3. Copy the token and add it to your .env.local file:"
echo "   HUGGINGFACE_API_KEY=hf_your_actual_token_here"
echo ""
echo "🧪 Test the integration:"
echo "   cd scripts"
echo "   python3 test_huggingface.py"
echo ""
echo "🌱 Your Memory Garden will then use free AI responses!"
echo ""
echo "📚 See HUGGINGFACE_SETUP.md for detailed instructions"

