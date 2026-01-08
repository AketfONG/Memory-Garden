import React from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showBackButton={true} />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-16">
              <span className="text-6xl mb-6 block">🌿</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">About Memory Garden</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Meet the passionate team behind Memory Garden, dedicated to helping you nurture and cherish your precious memories.
              </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-12 mb-16 backdrop-blur-md">
              <div className="text-center">
                <span className="text-4xl mb-6 block">💚</span>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  We believe that every memory deserves to be cherished and nurtured. Memory Garden was born from the simple idea that our most precious moments should have a beautiful, safe space to grow and flourish. We&apos;re committed to creating technology that feels human, warm, and nurturing.
                </p>
              </div>
            </div>

            {/* Team Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Developer 1 */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">👨‍💻</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Alex Chen</h3>
                      <p className="text-emerald-600 font-medium">Lead Developer & Designer</p>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      A passionate full-stack developer with a love for creating beautiful, user-centered experiences. Alex believes that technology should feel as natural and nurturing as tending to a garden.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">React</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Next.js</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">TypeScript</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">UI/UX</span>
                  </div>
                </div>

                {/* Developer 2 */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">👩‍💻</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Sarah Kim</h3>
                      <p className="text-emerald-600 font-medium">AI & Backend Engineer</p>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      Specializing in AI and machine learning, Sarah brings the magic of intelligent conversation to Memory Garden. She believes in creating AI that feels like talking to a caring friend.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">AI/ML</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Python</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Node.js</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Database</span>
                  </div>
                </div>

                {/* Developer 3 */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">👨‍🎨</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Marcus Rodriguez</h3>
                      <p className="text-emerald-600 font-medium">Creative Director</p>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      With a background in psychology and design, Marcus ensures that every interaction in Memory Garden feels emotionally resonant and meaningful. He believes in the power of beautiful design to heal and inspire.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Design</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Psychology</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">User Research</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Branding</span>
                  </div>
                </div>

                {/* Developer 4 */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 flex flex-col justify-between">
                  <div>
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">👩‍🔬</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Dr. Emily Watson</h3>
                      <p className="text-emerald-600 font-medium">Research & Psychology Lead</p>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      A clinical psychologist with expertise in memory and emotional well-being. Emily ensures that Memory Garden is grounded in scientific research and truly beneficial for mental health.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Psychology</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Research</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Mental Health</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Wellness</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-12 mb-16 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💚</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Compassion</h3>
                  <p className="text-gray-600">We approach every feature with empathy and understanding, knowing that memories are deeply personal.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Privacy</h3>
                  <p className="text-gray-600">Your memories are sacred. We prioritize security and privacy in everything we build.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Growth</h3>
                  <p className="text-gray-600">We believe in continuous improvement and nurturing both our product and our community.</p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                We&apos;d love to hear from you! Whether you have feedback, ideas, or just want to say hello.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <a href="mailto:hello@memorygarden.app" className="w-fit bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  📧 Say Hello
                </a>
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
          <p className="text-sm text-gray-500 mt-4">&copy; 2026 Memory Garden. Built with love and care.</p>
        </div>
      </footer>
    </div>
  );
} 