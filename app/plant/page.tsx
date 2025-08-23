"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";

export default function PlantMemory() {
  const router = useRouter();
  const [mode, setMode] = useState<'normal' | 'simple'>('normal');
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    vagueTime: '',
    description: '',
    customCategory: '',
    customEmotion: '',
    tags: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // Add state for media files
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a comprehensive memory summary for AI analysis
    const memorySummary = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endDate: formData.endDate,
      endTime: formData.endTime,
      vagueTime: formData.vagueTime,
      categories: selectedCategories,
      customCategory: formData.customCategory,
      customEmotion: formData.customEmotion,
      tags: formData.tags,
      mediaFiles: [...imageFiles, ...videoFiles, ...audioFiles].map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })),
      mode: mode,
      timestamp: new Date().toISOString()
    };
    
    console.log("Planting memory with data:", memorySummary);
    
    // Encode the memory summary and pass it to the memory page
    const encodedSummary = encodeURIComponent(JSON.stringify(memorySummary));
    
    // Navigate to memory page with the memory data
    router.push(`/memory?memory=${encodedSummary}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handlers for file input
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setAudioFiles(prev => [...prev, ...Array.from(files)]);
  };
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setVideoFiles(prev => [...prev, ...Array.from(files)]);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setImageFiles(prev => [...prev, ...Array.from(files)]);
  };

  // Delete file handlers
  const deleteAudioFile = (index: number) => {
    if (confirm('Are you sure you want to remove this audio file?')) {
      setAudioFiles(prev => prev.filter((_, i) => i !== index));
    }
  };
  const deleteVideoFile = (index: number) => {
    if (confirm('Are you sure you want to remove this video file?')) {
      setVideoFiles(prev => prev.filter((_, i) => i !== index));
    }
  };
  const deleteImageFile = (index: number) => {
    if (confirm('Are you sure you want to remove this image file?')) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showBackButton={true} backButtonText="View My Garden" backButtonHref="/" />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <span className="text-6xl mb-6 block">🌱</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Plant Memory</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Every memory starts as a tiny seed. Nurture it with love, and watch it grow into something beautiful.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="flex justify-center mb-8">
              <div className="rounded-full p-3 bg-white">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('normal')}
                    className={`px-6 py-3 rounded-full font-medium ${
                      mode === 'normal'
                        ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                        : 'text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('simple')}
                    className={`px-6 py-3 rounded-full font-medium ${
                      mode === 'simple'
                        ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                        : 'text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out'
                    }`}
                  >
                    Simple
                  </button>
                </div>
              </div>
            </div>

            {/* Memory Form */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 shadow-sm border border-emerald-100">
              <form className="space-y-8" onSubmit={handleSubmit}>
                {mode === 'normal' ? (
                  <>
                    {/* Memory Title */}
                    <div>
                      <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-3">
                        🌸 Memory Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Give your memory a beautiful name..."
                        className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
                      />
                    </div>

                {/* Memory Date Range */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    📅 When did this memory happen?
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Start Date & Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800"
                        />
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800"
                        />
                      </div>
                    </div>
                    
                    {/* End Date & Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To (optional)</label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800"
                        />
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Leave &quot;To&quot; empty if it&apos;s a single moment in time, or tell us about the vague time of this event</p>
                  
                  {/* Vague Time Input */}
                  <div className="mt-4">
                    <input
                      type="text"
                      id="vagueTime"
                      name="vagueTime"
                      value={formData.vagueTime}
                      onChange={handleInputChange}
                      placeholder="e.g., &quot;About 8 years ago&quot;, &quot;Last summer&quot;, &quot;During college&quot;..."
                      className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Memory Description */}
                <div>
                  <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-3">
                    💭 Tell us about this memory
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Describe what happened, how you felt, who was there... Let your memory bloom with details..."
                    className="w-full px-4 py-3 rounded-3xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500 resize-none"
                  />
                </div>

                {/* Memory Category */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    🌿 What type of memory is this?
                  </label>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { emoji: "👨‍👩‍👧‍👦", label: "Family", value: "family" },
                      { emoji: "👥", label: "Friends", value: "friends" },
                      { emoji: "🏆", label: "Achievement", value: "achievement" },
                      { emoji: "✈️", label: "Travel", value: "travel" },
                      { emoji: "📚", label: "Learning", value: "learning" },
                      { emoji: "💕", label: "Love", value: "love" },
                      { emoji: "🌲", label: "Nature", value: "nature" },
                      { emoji: "💼", label: "Work", value: "work" },
                      { emoji: "🏥", label: "Health", value: "health" },
                      { emoji: "🎨", label: "Creativity", value: "creativity" }
                    ].map((category) => (
                      <label key={category.value} className="flex flex-col items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="category"
                          value={category.value}
                          className="sr-only peer"
                        />
                        <div className="w-16 h-16 rounded-full border-2 border-emerald-200 hover:border-emerald-400 peer-checked:border-emerald-500 bg-emerald-50 hover:bg-emerald-100 peer-checked:bg-emerald-100 transition-all duration-300 flex items-center justify-center text-2xl hover:scale-110 transform transition-transform">
                          {category.emoji}
                        </div>
                        <span className="text-sm text-gray-600 mt-2 text-center peer-checked:text-emerald-600 peer-checked:font-medium transition-colors duration-300">{category.label}</span>
                      </label>
                    ))}
                  </div>
                  {/* Custom Category Input */}
                  <div className="mt-4">
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory}
                      onChange={handleInputChange}
                      placeholder="Or specify your own category..."
                      className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    😊 How did this memory make you feel?
                  </label>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { emoji: "😊", label: "Happy", value: "happy" },
                      { emoji: "😌", label: "Peaceful", value: "peaceful" },
                      { emoji: "🥰", label: "Loved", value: "loved" },
                      { emoji: "🤗", label: "Grateful", value: "grateful" },
                      { emoji: "😇", label: "Blessed", value: "blessed" },
                      { emoji: "😢", label: "Sad", value: "sad" },
                      { emoji: "😔", label: "Regret", value: "regret" },
                      { emoji: "😤", label: "Proud", value: "proud" },
                      { emoji: "😰", label: "Anxious", value: "anxious" },
                      { emoji: "😡", label: "Angry", value: "angry" },
                      { emoji: "😴", label: "Tired", value: "tired" },
                      { emoji: "🤔", label: "Thoughtful", value: "thoughtful" },
                      { emoji: "😎", label: "Confident", value: "confident" },
                      { emoji: "🥺", label: "Hopeful", value: "hopeful" },
                      { emoji: "😅", label: "Relieved", value: "relieved" }
                    ].map((mood) => (
                      <label key={mood.value} className="flex flex-col items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="mood"
                          value={mood.value}
                          className="sr-only peer"
                        />
                        <div className="w-16 h-16 rounded-full border-2 border-emerald-200 hover:border-emerald-400 peer-checked:border-emerald-500 bg-emerald-50 hover:bg-emerald-100 peer-checked:bg-emerald-100 transition-all duration-300 flex items-center justify-center text-2xl hover:scale-110 transform transition-transform">
                          {mood.emoji}
                        </div>
                        <span className="text-sm text-gray-600 mt-2 text-center peer-checked:text-emerald-600 peer-checked:font-medium transition-colors duration-300">{mood.label}</span>
                      </label>
                    ))}
                  </div>
                  {/* Custom Emotion Input */}
                  <div className="mt-4">
                    <input
                      type="text"
                      name="customEmotion"
                      value={formData.customEmotion}
                      onChange={handleInputChange}
                      placeholder="Or describe your own emotion..."
                      className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-lg font-semibold text-gray-800 mb-3">
                    🏷️ Add some tags to help your memory grow
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., summer, beach, laughter, sunset..."
                    className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">Separate tags with commas</p>
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    📸 Add photos, videos, or audio to your memory
                  </label>
                  <div className="border-2 border-dashed border-emerald-200 rounded-3xl p-8 text-center hover:border-emerald-500 transition-all duration-300 relative group">
                    {/* Overlay for hover effect */}
                    <div className="pointer-events-none absolute inset-0 bg-emerald-200 opacity-0 group-hover:opacity-[0.01] rounded-3xl transition-all duration-300 z-10"></div>
                    <div className="space-y-4 relative z-20">
                      <div className="text-4xl">📁</div>
                      <div>
                        <p className="text-lg font-medium text-gray-800 mb-2">Drop your media here or click to browse</p>
                        <p className="text-sm text-gray-600">Supports: JPG, PNG, MP4, MOV, MP3, WAV (Max 10MB each)</p>
                      </div>
                      <div className="flex flex-wrap gap-4 justify-center z-30 relative">
                        <label className="cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                          <span className="text-emerald-600 font-medium">📷 Photos</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                        </label>
                        <label className="cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                          <span className="text-emerald-600 font-medium">🎥 Videos</span>
                          <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoChange} />
                        </label>
                        <label className="cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                          <span className="text-emerald-600 font-medium">🎵 Audio</span>
                          <input type="file" accept="audio/*" multiple className="hidden" onChange={handleAudioChange} />
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Uploaded Files Preview */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Uploaded files will appear here</p>
                    <div className="bg-gray-50 rounded-3xl p-4 min-h-[60px] border border-gray-200">
                      {/* Show uploaded files as small horizontal scrollable preview cards with clear separation and fixed size */}
                      {[...imageFiles, ...videoFiles, ...audioFiles].length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {[...imageFiles, ...videoFiles, ...audioFiles].map((file, idx) => {
                            // Determine file type and index for deletion
                            let fileType: 'image' | 'video' | 'audio';
                            let deleteIndex: number;
                            
                            if (imageFiles.includes(file)) {
                              fileType = 'image';
                              deleteIndex = imageFiles.indexOf(file);
                            } else if (videoFiles.includes(file)) {
                              fileType = 'video';
                              deleteIndex = videoFiles.indexOf(file);
                            } else {
                              fileType = 'audio';
                              deleteIndex = audioFiles.indexOf(file);
                            }
                            
                            return (
                            <div 
                              key={idx} 
                              style={{width: '10rem', height: '10rem'}} 
                              className="flex-shrink-0 bg-white rounded-2xl shadow border border-gray-200 flex flex-col justify-between box-border overflow-hidden cursor-pointer relative group"
                              onClick={() => {
                                setSelectedFile(file);
                                setShowPreview(true);
                              }}
                            >
                              {/* Delete button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (fileType === 'image') {
                                    deleteImageFile(deleteIndex);
                                  } else if (fileType === 'video') {
                                    deleteVideoFile(deleteIndex);
                                  } else {
                                    deleteAudioFile(deleteIndex);
                                  }
                                }}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl z-10"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {/* Preview area */}
                              <div className="flex-1 flex items-center justify-center overflow-hidden">
                                {file.type.startsWith('image') && (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-fill rounded-t-xl"
                                  />
                                )}
                                {file.type.startsWith('video') && (
                                  <video
                                    src={URL.createObjectURL(file)}
                                    className="w-full h-full object-cover rounded-t-xl"
                                  />
                                )}
                                {file.type.startsWith('audio') && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-4xl text-gray-400">🎵</div>
                                  </div>
                                )}
                              </div>
                              {/* Filename bar at the bottom */}
                              <div className="w-full bg-gray-100 border-t border-gray-200 rounded-b-lg px-1 py-0.5 text-center">
                                <div className="font-medium text-sm text-gray-900 truncate" title={file.name}>{file.name}</div>
                                <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                              </div>
                            </div>
                          );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm text-center">No files uploaded yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 flex justify-center">
                  <button
                    type="submit"
                    className="w-[90%] bg-gradient-to-b from-emerald-500 to-green-600 text-white py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    🪴 Plant This Memory
                  </button>
                </div>
                  </>
                ) : (
                  <>
                    {/* Simple Mode - Memory Title */}
                    <div>
                      <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-3">
                        🌸 Memory Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Give your memory a beautiful name..."
                        className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500"
                      />
                    </div>

                    {/* Simple Mode - Memory Description */}
                    <div>
                      <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-3">
                        💭 Tell us about this memory
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Describe what happened, how you felt, who was there... Let your memory bloom with details..."
                        className="w-full px-4 py-3 rounded-3xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500 resize-none"
                      />
                    </div>

                    {/* Simple Mode - Media Upload */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-800 mb-3">
                        📸 Add photos, videos, or audio to your memory
                      </label>
                      <div className="border-2 border-dashed border-emerald-200 rounded-3xl p-8 text-center hover:border-emerald-500 transition-all duration-300 relative group">
                        {/* Overlay for hover effect */}
                        <div className="pointer-events-none absolute inset-0 bg-emerald-200 opacity-0 group-hover:opacity-[0.01] rounded-3xl transition-all duration-300 z-10"></div>
                        <div className="space-y-4 relative z-20">
                          <div className="text-4xl">📁</div>
                          <div>
                            <p className="text-lg font-medium text-gray-800 mb-2">Drop your media here or click to browse</p>
                            <p className="text-sm text-gray-600">Supports: JPG, PNG, MP4, MOV, MP3, WAV (Max 10MB each)</p>
                          </div>
                          <div className="flex flex-wrap gap-4 justify-center z-30 relative">
                            <label className="cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                              <span className="text-emerald-600 font-medium">📷 Photos</span>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                            </label>
                            <label className="cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                              <span className="text-emerald-600 font-medium">🎥 Videos</span>
                              <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoChange} />
                            </label>
                            <label className="cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                              <span className="text-emerald-600 font-medium">🎵 Audio</span>
                              <input type="file" accept="audio/*" multiple className="hidden" onChange={handleAudioChange} />
                            </label>
                          </div>
                        </div>
                      </div>
                      {/* Uploaded Files Preview */}
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Uploaded files will appear here</p>
                        <div className="bg-gray-50 rounded-3xl p-4 min-h-[60px] border border-gray-200">
                          {/* Show uploaded files as small horizontal scrollable preview cards with clear separation and fixed size */}
                          {[...imageFiles, ...videoFiles, ...audioFiles].length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                              {[...imageFiles, ...videoFiles, ...audioFiles].map((file, idx) => {
                                // Determine file type and index for deletion
                                let fileType: 'image' | 'video' | 'audio';
                                let deleteIndex: number;
                                
                                if (imageFiles.includes(file)) {
                                  fileType = 'image';
                                  deleteIndex = imageFiles.indexOf(file);
                                } else if (videoFiles.includes(file)) {
                                  fileType = 'video';
                                  deleteIndex = videoFiles.indexOf(file);
                                } else {
                                  fileType = 'audio';
                                  deleteIndex = audioFiles.indexOf(file);
                                }
                                
                                return (
                                <div 
                                  key={idx} 
                                  style={{width: '10rem', height: '10rem'}} 
                                  className="flex-shrink-0 bg-white rounded-2xl shadow border border-gray-200 flex flex-col justify-between box-border overflow-hidden cursor-pointer relative group"
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setShowPreview(true);
                                  }}
                                >
                                  {/* Delete button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (fileType === 'image') {
                                        deleteImageFile(deleteIndex);
                                      } else if (fileType === 'video') {
                                        deleteVideoFile(deleteIndex);
                                      } else {
                                        deleteAudioFile(deleteIndex);
                                      }
                                    }}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl z-10"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                  {/* Preview area */}
                                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                                    {file.type.startsWith('image') && (
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-fill rounded-t-xl"
                                      />
                                    )}
                                    {file.type.startsWith('video') && (
                                      <video
                                        src={URL.createObjectURL(file)}
                                        className="w-full h-full object-cover rounded-t-xl"
                                      />
                                    )}
                                    {file.type.startsWith('audio') && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-4xl text-gray-400">🎵</div>
                                      </div>
                                    )}
                                  </div>
                                  {/* Filename bar at the bottom */}
                                  <div className="w-full bg-gray-100 border-t border-gray-200 rounded-b-lg px-1 py-0.5 text-center">
                                    <div className="font-medium text-sm text-gray-900 truncate" title={file.name}>{file.name}</div>
                                    <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                  </div>
                                </div>
                              );
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm text-center">No files uploaded yet</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Simple Mode - Submit Button */}
                    <div className="pt-6 flex justify-center">
                      <button
                        type="submit"
                        className="w-[90%] bg-gradient-to-b from-emerald-500 to-green-600 text-white py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <span>🪴</span>
                        <span>Plant This Memory</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>

            {/* Tips Section */}
            <div className="mt-12 bg-white rounded-3xl p-8 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Tips for Growing Beautiful Memories
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  Be specific about the details - sights, sounds, smells, and feelings
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  Include the people who made this moment special
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  Don&apos;t worry about perfect grammar - write from the heart
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-3">•</span>
                  Add tags to help you find and connect related memories later
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-[800px] h-[600px] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{selectedFile.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4 h-[calc(600px-80px)] overflow-auto">
              {selectedFile.type.startsWith('image') && (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt={selectedFile.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
              {selectedFile.type.startsWith('video') && (
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className="w-full h-full rounded-lg"
                />
              )}
              {selectedFile.type.startsWith('audio') && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="text-6xl text-gray-400">🎵</div>
                  <audio
                    src={URL.createObjectURL(selectedFile)}
                    controls
                    className="w-full max-w-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Content Preview */}
      {/* This section is no longer needed as AI video generation is removed */}
      {/* {generatedVideoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-[800px] h-[600px] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Generated Content</h3>
              <button
                onClick={() => setGeneratedVideoUrl(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4 h-[calc(600px-80px)] overflow-auto">
              <img
                src={generatedVideoUrl}
                alt="AI Generated Content"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>This image was generated using AI based on your memory content.</p>
            </div>
          </div>
        </div>
      )} */}

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