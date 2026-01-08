'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

interface UsageStats {
  model: string;
  status: 'connected' | 'disconnected';
  apiKeyConfigured: boolean;
  lastChecked: string;
}

interface ImageAPIStatus {
  status: 'connected' | 'disconnected';
  lastChecked: string;
  message: string;
}

export default function AIUsagePage() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageStatus, setImageStatus] = useState<ImageAPIStatus | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    checkAPIStatus();
    checkImageAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    setLoading(true);
    try {
      // Check if API key is configured by making a test call
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testTitle: 'Connection Test',
          testDescription: 'Testing Google AI Studio connection'
        }),
      });

      const result = await response.json();
      
      setUsageStats({
        model: 'gemini-2.5-flash',
        status: result.success ? 'connected' : 'disconnected',
        apiKeyConfigured: result.success || result.error !== 'Google AI API key not configured',
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      setUsageStats({
        model: 'gemini-2.5-flash',
        status: 'disconnected',
        apiKeyConfigured: false,
        lastChecked: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkImageAPIStatus = async () => {
    setImageLoading(true);
    try {
      const response = await fetch('/api/generate-image-hybrid', {
        method: 'GET',
      });

      if (!response.ok) {
        setImageStatus({
          status: 'disconnected',
          lastChecked: new Date().toISOString(),
          message: `Status code: ${response.status}`,
        });
        return;
      }

      const data = await response.json();

      setImageStatus({
        status: 'connected',
        lastChecked: new Date().toISOString(),
        message: data?.message || 'Hybrid Image Generation API is responding.',
      });
    } catch (error) {
      setImageStatus({
        status: 'disconnected',
        lastChecked: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unable to reach image generation API',
      });
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation showBackButton={true} backButtonText="Back to Updates" backButtonHref="/updates" />

      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-16">
              <span className="text-6xl mb-6 block">📊</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Google AI Studio Usage</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Monitor your Google AI Studio API token usage, connection status, and image generation API health.
              </p>
            </div>

            {/* Connection Status Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🔌</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Connection Status</h2>
                    <p className="text-emerald-600 font-medium">Real-time API status</p>
                  </div>
                </div>
                <button
                  onClick={checkAPIStatus}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking...' : '🔄 Refresh'}
                </button>
              </div>

              {usageStats && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {usageStats.status === 'connected' ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {usageStats.status === 'connected' ? 'Connected' : 'Disconnected'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {usageStats.apiKeyConfigured ? 'API Key configured' : 'API Key not configured'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last checked</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(usageStats.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl">
                      <p className="text-sm text-gray-600 mb-1">Model</p>
                      <p className="text-lg font-semibold text-gray-800">{usageStats.model}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className={`text-lg font-semibold ${
                        usageStats.status === 'connected' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {usageStats.status === 'connected' ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Generation API Status Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">🖼️</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Image Generation API</h2>
                    <p className="text-emerald-600 font-medium">Hybrid image generation endpoint status</p>
                  </div>
                </div>
                <button
                  onClick={checkImageAPIStatus}
                  disabled={imageLoading}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageLoading ? 'Checking...' : '🔍 Check Image API'}
                </button>
              </div>

              {imageStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {imageStatus.status === 'connected' ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {imageStatus.status === 'connected' ? 'Connected' : 'Disconnected'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {imageStatus.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last checked</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(imageStatus.lastChecked).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl">
                      <p className="text-sm text-gray-600 mb-1">Endpoint</p>
                      <p className="text-lg font-semibold text-gray-800">/api/generate-image-hybrid</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p
                        className={`text-lg font-semibold ${
                          imageStatus.status === 'connected' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {imageStatus.status === 'connected' ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Usage Information Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl">📈</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Usage Information</h2>
                  <p className="text-emerald-600 font-medium">Google AI Studio dashboard</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-white rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🔗</span>
                    Check Usage on Google AI Studio
                  </h3>
                  <p className="text-gray-600 mb-4">
                    To view detailed token usage, billing, and quotas, visit the Google AI Studio dashboard:
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    🌐 Open Google AI Studio Dashboard
                  </a>
                </div>

                <div className="p-6 bg-white rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    Free Tier Limits
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      <span><strong>Requests per minute:</strong> 15 requests/minute</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      <span><strong>Requests per day:</strong> 1,500 requests/day</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      <span><strong>Model:</strong> Gemini 2.5 Flash (free tier)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      <span><strong>Input tokens:</strong> Unlimited (within rate limits)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-3">•</span>
                      <span><strong>Output tokens:</strong> Unlimited (within rate limits)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* API Endpoints Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl">🔧</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">API Endpoints</h2>
                  <p className="text-emerald-600 font-medium">Where Google AI is used</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-2">/api/ai-test</h3>
                  <p className="text-sm text-gray-600 mb-2">Generates therapeutic reflections on memories</p>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Memory Insights
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-2">/api/nav-chat</h3>
                  <p className="text-sm text-gray-600 mb-2">Navigation chat assistant (Sprout)</p>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    User Guidance
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-2">/api/google-ai-chat</h3>
                  <p className="text-sm text-gray-600 mb-2">Voice memory interaction streaming</p>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Voice Chat
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-2">/api/analyze-media</h3>
                  <p className="text-sm text-gray-600 mb-2">Multimodal media analysis</p>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Media Analysis
                  </span>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl">💡</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tips & Best Practices</h2>
                  <p className="text-emerald-600 font-medium">Optimize your usage</p>
                </div>
              </div>

              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  <span>Monitor your usage regularly on the Google AI Studio dashboard</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  <span>Free tier resets daily - plan your usage accordingly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  <span>Use streaming for better user experience and faster responses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  <span>Keep API key secure - never commit it to version control</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  <span>If you hit rate limits, implement request queuing or caching</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

