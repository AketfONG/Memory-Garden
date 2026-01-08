"use client";
import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [memoryTitle, setMemoryTitle] = useState<string>("");
  const [memoryDescription, setMemoryDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [emotion, setEmotion] = useState<string>("neutral");
  const [style, setStyle] = useState<string>("realistic");
  const [type, setType] = useState<string>("custom");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");

  const categories = [
    "family", "nature", "achievement", "travel", "work", 
    "love", "health", "creativity", "learning", "friends"
  ];

  const emotions = [
    "neutral", "happy", "sad", "excited", "peaceful", 
    "proud", "grateful", "nostalgic", "hopeful"
  ];

  const styles = [
    "realistic", "artistic", "dreamy", "minimalist", "watercolor", "sketch"
  ];

  const types = [
    { value: "custom", label: "Custom Prompt" },
    { value: "memory_visualization", label: "Memory Visualization" },
    { value: "category_icon", label: "Category Icon" },
    { value: "garden_background", label: "Garden Background" },
    { value: "ai_artwork", label: "AI Artwork" }
  ];

  const generateImage = async () => {
    setLoading(true);
    setError("");
    setGeneratedImage("");
    setAiResponse("");

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          memoryTitle,
          memoryDescription,
          category,
          emotion,
          style,
          type
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedImage(`data:image/png;base64,${result.image_data}`);
        setAiResponse(result.text_response || "");
      } else {
        setError(result.error || "Image generation failed");
      }
    } catch (err) {
      setError("Failed to generate image: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <Navigation showBackButton={true} backButtonText="Back to Home" backButtonHref="/" />
      
      <main className="pt-26">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">🎨</span>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Image Generation</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Generate beautiful images for your Memory Garden using Google AI Studio
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                {/* Generation Type */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-emerald-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Generation Type</h2>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    {types.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Prompt */}
                {type === "custom" && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-emerald-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Custom Prompt</h2>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                )}

                {/* Memory Visualization */}
                {type === "memory_visualization" && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-emerald-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Memory Details</h2>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={memoryTitle}
                        onChange={(e) => setMemoryTitle(e.target.value)}
                        placeholder="Memory Title"
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                      <textarea
                        value={memoryDescription}
                        onChange={(e) => setMemoryDescription(e.target.value)}
                        placeholder="Memory Description"
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Category Icon */}
                {type === "category_icon" && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-emerald-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Icon Settings</h2>
                    <div className="space-y-4">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Style and Emotion */}
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-emerald-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Style Settings</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                      >
                        {styles.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emotion</label>
                      <select
                        value={emotion}
                        onChange={(e) => setEmotion(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-emerald-200 rounded-full focus:border-emerald-500 focus:outline-none transition-colors"
                      >
                        {emotions.map((e) => (
                          <option key={e} value={e}>
                            {e.charAt(0).toUpperCase() + e.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="text-center">
                  <button
                    onClick={generateImage}
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating...
                      </span>
                    ) : (
                      <span>🎨 Generate Image</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Output Section */}
              <div className="space-y-6">
                {/* Generated Image */}
                {generatedImage && (
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-emerald-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Generated Image</h2>
                      <button
                        onClick={downloadImage}
                        className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors"
                      >
                        📥 Download
                      </button>
                    </div>
                    <div className="text-center">
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="max-w-full h-auto rounded-2xl shadow-md mx-auto"
                      />
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {aiResponse && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 shadow-lg border border-emerald-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                      <span className="text-emerald-500 mr-2">💬</span>
                      AI Response
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{aiResponse}</p>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Use</h3>
                  <ul className="text-blue-700 space-y-2 text-sm">
                    <li>• <strong>Custom Prompt:</strong> Describe any image you want</li>
                    <li>• <strong>Memory Visualization:</strong> Generate images from your memories</li>
                    <li>• <strong>Category Icon:</strong> Create icons for memory categories</li>
                    <li>• <strong>Garden Background:</strong> Generate backgrounds for your garden</li>
                    <li>• <strong>AI Artwork:</strong> Create artistic representations of memories</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}







