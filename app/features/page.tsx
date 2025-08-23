import React from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showBackButton={true} />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-16">
              <span className="text-6xl mb-6 block">✨</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Memory Garden Features</h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Discover the powerful tools that make Memory Garden a unique and nurturing space for your precious memories.
              </p>
            </div>

            {/* Feature 1: Memory Generation */}
            <div className="mb-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="text-center mb-6">
                      <span className="text-5xl mb-4 block">🎬</span>
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">Memory Generation</h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Transform your written memories into beautiful, personalized videos that bring your experiences to life.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">AI-Powered Visualization</h3>
                          <p className="text-gray-600">Our advanced AI analyzes your memory description and creates stunning visual representations that capture the essence of your experience.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Emotional Storytelling</h3>
                          <p className="text-gray-600">Each generated video tells your story with emotional depth, using colors, music, and imagery that resonate with your feelings.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Customizable Themes</h3>
                          <p className="text-gray-600">Choose from various artistic styles and themes to match the mood and nature of your memory perfectly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2">
                  <div className="bg-gradient-to-br from-emerald-100 to-green-200 rounded-3xl p-16 min-h-[420px] flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Memory Video Generated</p>
                      <p className="text-gray-600">A beautiful visualization of your memory</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: AI Conversation */}
            <div className="mb-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="bg-gradient-to-br from-emerald-100 to-green-200 rounded-3xl p-16 min-h-[420px] flex items-center justify-center relative overflow-hidden">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 text-lg">🌱</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">Sprout</h3>
                          <p className="text-sm text-emerald-500 font-medium">Your nurturing companion</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-emerald-50 rounded-2xl p-3">
                          <p className="text-sm text-gray-800">How does this memory make you feel now?</p>
                        </div>
                        <div className="bg-emerald-600 rounded-2xl p-3 ml-8">
                          <p className="text-sm text-white">It fills me with joy and gratitude...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="text-center mb-6">
                      <span className="text-5xl mb-4 block">🧘</span>
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">AI Conversation</h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Engage in meaningful conversations with an AI companion designed to help you explore and understand your memories deeper.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Emotional Intelligence</h3>
                          <p className="text-gray-600">Our AI understands the emotional context of your memories and responds with empathy and insight.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Reflection Guidance</h3>
                          <p className="text-gray-600">Get thoughtful questions and prompts that help you discover new perspectives on your experiences.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Memory Connection</h3>
                          <p className="text-gray-600">Discover beautiful connections between different memories and how they shape your life story.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Voice Recreation */}
            <div className="mb-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="text-center mb-6">
                      <span className="text-5xl mb-4 block">🎵</span>
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">Voice Recreation</h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Bring your memories to life with AI-generated voice narration that captures the emotional tone of your experiences.
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Natural Voice Synthesis</h3>
                          <p className="text-gray-600">Advanced AI technology creates natural-sounding voice narration that reads your memories with perfect emotional inflection.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Emotional Tone Matching</h3>
                          <p className="text-gray-600">The voice automatically adjusts its tone, pace, and emotion to match the feeling and context of your memory.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-all duration-300 hover:shadow-xl">
                          <span className="text-white text-sm font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Accessibility & Immersion</h3>
                          <p className="text-gray-600">Perfect for accessibility needs and creating immersive memory experiences that engage multiple senses.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2">
                  <div className="bg-gradient-to-br from-emerald-100 to-green-200 rounded-3xl p-16 min-h-[420px] flex items-center justify-center relative overflow-hidden">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎵</div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Voice Narration</p>
                      <p className="text-gray-600">Emotional storytelling through sound</p>
                    </div>
                    <div className="absolute bottom-6 left-1/4 right-1/4">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600">🎤</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Memory Narration</p>
                              <p className="text-sm text-gray-600">Playing...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-12 mb-16 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It All Works Together</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300">
                    <span className="text-white text-2xl">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Plant Your Memory</h3>
                  <p className="text-gray-600">Write about your experience with rich details, emotions, and context.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300">
                    <span className="text-white text-2xl">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Magic Happens</h3>
                  <p className="text-gray-600">Our AI creates a video, generates voice narration, and prepares for conversation.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300">
                    <span className="text-white text-2xl">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Experience & Reflect</h3>
                  <p className="text-gray-600">Watch your memory come to life and engage in meaningful reflection.</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Experience These Features?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Start your journey with Memory Garden and discover how these powerful features can transform your relationship with your memories.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/plant" className="w-fit bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  💭 Start Your First Memory
                </Link>
                <Link href="/" className="w-fit border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                  🏠 Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-16 mt-32 border-t-2 border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-semibold text-gray-800">Memory Garden</span>
          </div>
          <p className="text-gray-600">Nurturing memories, growing connections, cultivating joy.</p>
          <p className="text-sm text-gray-500 mt-4">&copy; 2025 Memory Garden. Built with love and care.</p>
        </div>
      </footer>
    </div>
  );
} 