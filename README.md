# 🌱 Memory Garden v0.3

A beautiful, AI-powered digital sanctuary for planting, growing, and cherishing your precious memories. Built with Next.js, React, and Tailwind CSS.

## ✨ Features

- **🌿 Plant Memories**: Create detailed memory entries with text, media files, and emotional context
- **🤖 AI-Powered Therapy**: Get thoughtful, therapeutic reflections on your memories using advanced AI models
- **📱 Responsive Design**: Beautiful interface that works seamlessly on all devices
- **🎨 Customizable Styles**: Multiple UI themes and style configurations
- **💾 Local Storage**: Your memories are stored locally for privacy and security
- **🔍 Memory Garden**: Timeline view of all your planted memories with chat history
- **🌐 Multi-Language Support**: Built-in internationalization framework

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/memory-garden.git
   cd memory-garden
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.local.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### AI Services Setup

The app supports multiple AI providers:

- **Google AI Studio** (Recommended - Free tier)
- **OpenAI** (Limited free tier)
- **Hugging Face** (Free tier: 30,000 requests/month)

See `scripts/QUICK_AI_SETUP.md` for detailed setup instructions.

### Environment Variables

```bash
# Required for AI features
GOOGLE_AI_API_KEY=your-google-ai-api-key
# OR
OPENAI_API_KEY=your-openai-api-key
# OR  
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Optional
NODE_ENV=production
```

## 🏗️ Project Structure

```
memory-garden/
├── app/                    # Next.js app directory
│   ├── api/              # API routes
│   ├── components/       # Reusable components
│   ├── garden/          # Memory garden page
│   ├── memory/          # Individual memory pages
│   ├── plant/           # Plant memory page
│   ├── testing/         # AI testing page
│   └── utils/           # Utility functions
├── scripts/              # Python AI scripts
├── public/               # Static assets
└── styles/               # Global styles
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Connect your GitHub repository
   - Add environment variables
   - Deploy automatically

### Other Platforms

- **Netlify**: Compatible with Next.js
- **Railway**: Good for full-stack apps
- **DigitalOcean App Platform**: Scalable hosting

## 🔒 Privacy & Security

- **Local Storage**: Memories stored in browser localStorage
- **No Database**: No external data storage required
- **API Keys**: Keep your AI service API keys secure
- **HTTPS**: Always use HTTPS in production

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first CSS framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Tailwind CSS** for the beautiful design system
- **AI Service Providers** for making AI accessible
- **Open Source Community** for inspiration and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/memory-garden/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/memory-garden/discussions)
- **Email**: your-email@example.com

---

**Made with ❤️ and 🌱 for memory preservation**

*Version 0.3 - Released 06/08/2025* 

