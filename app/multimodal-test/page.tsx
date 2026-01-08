"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

export default function MultimodalTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [memoryContext, setMemoryContext] = useState<string>("");
  const [memoryTitle, setMemoryTitle] = useState<string>("");
  const [memoryDescription, setMemoryDescription] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setAnalysis("");
      setInsights("");
    }
  };

  const analyzeMedia = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('memoryContext', memoryContext);
      formData.append('memoryTitle', memoryTitle);
      formData.append('memoryDescription', memoryDescription);

      const response = await fetch('/api/analyze-media', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.analysis);
        setInsights(result.insights || "No insights generated");
      } else {
        setError(result.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to analyze media: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const isImage = selectedFile?.type.startsWith('image/');
  const isVideo = selectedFile?.type.startsWith('video/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <Navigation showBackButton={true} backButtonText="Back to Home" backButtonHref="/" />
      
      <main className="pt-26">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">🤖</span>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Media Analysis</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Upload images or videos to see how AI can analyze and understand your memories
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* File Upload Section */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-emerald-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Media</h2>
              
              <div className="space-y-6">
                {/* File Input */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Choose Image or Video
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Supported: JPEG, PNG, GIF, WebP, MP4, MOV, AVI, WebM (max 10MB)
                  </p>
                </div>

                {/* Memory Context */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Memory Context (Optional)
                  </label>
                  <input
                    type="text"
                    value={memoryContext}
                    onChange={(e) => setMemoryContext(e.target.value)}
                    placeholder="e.g., A family gathering at the beach during sunset"
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Memory Title */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Memory Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={memoryTitle}
                    onChange={(e) => setMemoryTitle(e.target.value)}
                    placeholder="e.g., Beach Family Gathering"
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Memory Description */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Memory Description (Optional)
                  </label>
                  <textarea
                    value={memoryDescription}
                    onChange={(e) => setMemoryDescription(e.target.value)}
                    placeholder="e.g., A beautiful evening with family watching the sunset"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Analyze Button */}
                <div className="text-center">
                  <button
                    onClick={analyzeMedia}
                    disabled={!selectedFile || loading}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </span>
                    ) : (
                      <span>🔍 Analyze Media</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-emerald-100 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">File Preview</h3>
                <div className="text-center">
                  {isImage && (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-w-full max-h-64 rounded-2xl shadow-md mx-auto"
                    />
                  )}
                  {isVideo && (
                    <video
                      src={URL.createObjectURL(selectedFile)}
                      controls
                      className="max-w-full max-h-64 rounded-2xl shadow-md mx-auto"
                    />
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-emerald-100 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-emerald-500 mr-2">🔍</span>
                  AI Analysis
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{analysis}</p>
                </div>
              </div>
            )}

            {/* Insights Results */}
            {insights && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 shadow-lg border border-emerald-100 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-emerald-500 mr-2">💡</span>
                  Memory Insights
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{insights}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Use</h3>
              <ul className="text-blue-700 space-y-2">
                <li>• Upload an image or video from your memories</li>
                <li>• Add context about when and where the memory took place</li>
                <li>• Click "Analyze Media" to get AI insights</li>
                <li>• The AI will describe what it sees and suggest categories, emotions, and tags</li>
                <li>• Use these insights to better organize and understand your memories</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}







