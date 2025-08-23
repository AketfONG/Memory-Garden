'use client';

import React from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

export default function UpdatesPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showBackButton={true} backButtonText="Back to Home" />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-16">
              <span className="text-6xl mb-6 block">📝</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Update Log</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Track the growth and evolution of Memory Garden through our version updates.
              </p>
              <div className="mt-6 flex gap-4 justify-center">
                <a 
                  href="/style-config" 
                  className="inline-block px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out"
                >
                  🎨 Style Configuration
                </a>
                <a 
                  href="/testing" 
                  className="inline-block px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out"
                >
                  🧪 Testing
                </a>
              </div>
            </div>



            {/* Version v0.3 */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Version 0.3</h2>
                    <p className="text-emerald-600 font-medium">Latest Version</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-emerald-500 mr-2">✨</span>
                    New Features
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      AI text input to conversation using Google AI Studio
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      Media preview area
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      Style configuration page for easier development
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-emerald-500 mr-2">🎨</span>
                    Improvements
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      UI refinements
                    </li>
                  </ul>
                </div>



                <div className="bg-emerald-100 rounded-full p-4">
                  <p className="text-emerald-700 text-sm">
                    <strong>Release Date:</strong> 06/08/2025
                  </p>
                </div>
              </div>
            </div>

            {/* Version v0.2 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Version 0.2</h2>
                    <p className="text-gray-600 font-medium">Previous Version</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-emerald-500 mr-2">✨</span>
                    New Features
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      My Garden for previous memory generations
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      Simple Mode for memory creation
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      Refined date specification
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-emerald-500 mr-2">🎨</span>
                    Improvements
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      Optimised buttons, mobile view, navigation bar elements
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-200 rounded-full p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Release Date:</strong> 13/07/2025
                  </p>
                </div>
              </div>
            </div>

            {/* Version v0.1 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Version 0.1</h2>
                    <p className="text-gray-600 font-medium">Previous Version</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-gray-500 mr-2">✨</span>
                    New Features
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Navigation Bar AI integration
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Mobile version Navigation Bar
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Multiple selection of Memory Category and Emotions
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Language Switch
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-gray-500 mr-2">🎨</span>
                    Improvements
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Added floating when hovering over blocks
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Unified colour schemes, button styles and UI design of the website
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Improved chat UI, Navigation Bar and Media Player
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Changed Emojis on buttons for better readability
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-gray-500 mr-2">📝</span>
                    Notes
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Disabled Overscroll and Scroll Bar
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-200 rounded-full p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Release Date:</strong> 28/06/2025
                  </p>
                </div>
              </div>
            </div>

            {/* Version v0.0 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Version 0</h2>
                    <p className="text-gray-600 font-medium">Initial Prototype</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-gray-500 mr-2">🚀</span>
                    Foundation
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      Defined website design, Memory Data Collection, Memory Generation, Home Page, Features Page, Tour Page and About Page
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-200 rounded-full p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Release Date:</strong> 27/06/2025
                  </p>
                </div>
              </div>
            </div>

            {/* Future Updates */}
            <div className="mt-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-16 text-white shadow-xl">
              <div className="text-center">
                <span className="text-5xl mb-6 block">🛠️</span>
                <h2 className="text-4xl font-bold mb-6">Coming Soon</h2>
                <p className="text-xl mb-10 opacity-95 leading-relaxed">
                  We're constantly working on new features to make Memory Garden even more beautiful and useful.
                </p>
                <div className="space-y-3">
                  <p className="flex items-center justify-center text-xl font-semibold">
                    <span className="text-white mr-2">🎬</span>
                    AI-powered memory video generation
                  </p>
                  <p className="flex items-center justify-center text-xl font-semibold">
                    <span className="text-white mr-2">🎵</span>
                    Voice narration for memories
                  </p>
                  <p className="flex items-center justify-center text-xl font-semibold">
                    <span className="text-white mr-2">🧘</span>
                    AI conversation companion
                  </p>
                </div>
                <div className="mt-10">
                  <button className="bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 text-emerald-600 px-12 py-5 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center mx-auto">
                    💡 Suggest Features
                  </button>
                </div>
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