"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function MemoryPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: 'Your memory has been planted and is growing beautifully! 🌱 I\'ve created a special video to help you visualize and reflect on this moment. How does this memory make you feel now?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Add timestamp only after mounting
    setMessages(prev => prev.map(msg => 
      msg.id === 1 ? { ...msg, timestamp: new Date() } : msg
    ));
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'Thank you for sharing that reflection. Every memory is unique and precious. Is there anything else you\'d like to explore about this moment? 🌸',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-emerald-600 font-bold text-lg">🌱</span>
                </div>
                <span className="text-2xl font-bold text-gray-800">Memory Garden</span>
              </a>
            </div>
            <Link href="/" className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-all duration-300 hover:border-emerald-300 font-medium">
              Back to Garden
            </Link>
          </nav>
        </header>
        <main className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <span className="text-6xl mb-6 block">🌱</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Loading...</h1>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-emerald-600 font-bold text-lg">🌱</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">Memory Garden</span>
            </a>
          </div>
          <Link href="/" className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-all duration-300 hover:border-emerald-300 font-medium">
            ⬅️ Back to Garden
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
            <span className="text-6xl mb-6 block">🌱</span>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Memory Planted Successfully!</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Your precious memory has been nurtured and planted in your garden. 
              Here's a special visualization created just for you.
            </p>
          </div>

          {/* Generated Video Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Memory Visualization</h2>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 shadow-lg border border-emerald-100">
              <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Placeholder for generated video */}
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Memory Video Generated</p>
                  <p className="text-gray-600">A beautiful visualization of your memory</p>
                </div>
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <span className="text-3xl text-emerald-600 ml-1">▶️</span>
                  </div>
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="mt-6 flex justify-center space-x-4">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full transition-colors">
                  📥 Download Video
                </button>
                <button className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-colors">
                  🔄 Regenerate
                </button>
                <button className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-colors">
                  📤 Share
                </button>
              </div>
            </div>
          </div>

          {/* AI Chat Interface */}
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b border-emerald-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">🌱</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Sprout</h3>
                  <p className="text-sm text-gray-600">Your nurturing companion</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatMessagesRef} className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-50 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-emerald-100">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Share your thoughts about this memory..."
                  className="flex-1 px-4 py-3 border border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 text-gray-800 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-b from-emerald-500 to-green-600 text-white w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plant" className="bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                🪴 Plant Memory
              </Link>
              <Link href="/" className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                🌸 View My Garden
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 