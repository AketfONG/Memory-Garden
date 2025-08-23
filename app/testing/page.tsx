"use client";
import React, { useState, useEffect, useRef } from "react";
import Navigation from "../components/Navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function TestingPage() {
  const { language } = useLanguage();
  const t = translations[language];
  
  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  
  // State for media files (exactly same as plant page)
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Chat interface state (exactly same as memory page)
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Ref for auto-scrolling to latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMounted(true);
    // Add timestamp only after mounting
    setMessages(prev => prev.map(msg => 
      msg.id === 1 ? { ...msg, timestamp: new Date() } : msg
    ));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle story sharing
  const handleRunAITest = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in both story title and description');
      return;
    }

    try {
      // Clear the chat first
      setMessages([]);
      
      // Call therapy API
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testTitle: formData.title,
          testDescription: formData.description,
          mediaFiles: [...imageFiles, ...videoFiles, ...audioFiles].map(file => file.name)
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Add therapeutic response to chat
        const aiResponse: Message = {
          id: 1,
          type: 'assistant',
          content: result.reflection,
          timestamp: new Date()
        };
        setMessages([aiResponse]);
      } else {
        alert('Failed to connect with therapist: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Therapy Session Error:', error);
      alert('Failed to connect with therapist. Please check your connection and try again.');
    }
  };

  // Handlers for file input (exactly same as plant page)
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

  // Chat message handler with DeepSeek integration
  const handleSendMessage = async (e: React.FormEvent) => {
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

    try {
      // Prepare conversation history for DeepSeek
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call Google AI navigation chat API
      const response = await fetch('/api/nav-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const aiResponse: Message = {
          id: messages.length + 2,
          type: 'assistant',
          content: result.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback response if API fails
        const aiResponse: Message = {
          id: messages.length + 2,
          type: 'assistant',
          content: 'I apologize, but I\'m having trouble connecting to my AI services right now. Please try again later or check your internet connection. 🌱',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      // Fallback response
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment. 🌱',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation showBackButton={true} backButtonText="Back to Home" />
      
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
                                  <div className="text-center mb-12">
              <span className="text-6xl mb-6 block">🧘</span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Testing
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A safe space to share your stories and receive emotional support and gentle reflections.
              </p>
            </div>

          {/* Text Input Area (exactly same as plant page) */}
          <div className="bg-emerald-50 rounded-3xl p-8 mb-8 border border-emerald-100 shadow-lg transition-all duration-300">
            <div className="space-y-8">
              {/* Memory Title */}
              <div>
                <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-3">
                  🌸 Story Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Give your story a meaningful title..."
                  className="w-full px-4 py-3 rounded-full border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500 bg-emerald-50"
                />
              </div>

              {/* Memory Description */}
              <div>
                <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-3">
                  💭 Your Story
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Share your story, memory, or experience... What's on your heart today? Take your time to express what you're feeling..."
                  className="w-full px-4 py-3 rounded-3xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-500 resize-none bg-emerald-50"
                />
              </div>

              {/* Media Upload (exactly same as plant page) */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  📸 Add photos, videos, or audio to your story
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
                {/* Uploaded Files Preview (exactly same as plant page) */}
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

              {/* Test Button */}
              <div className="pt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleRunAITest}
                  disabled={!formData.title || !formData.description}
                  className="w-[90%] bg-gradient-to-b from-emerald-500 to-green-600 text-white py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>💚</span>
                  <span>Share My Story</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Chat Interface (exactly same as memory page) */}
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden mb-8">
            {/* Chat Header */}
            <div className="bg-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">🌱</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Sprout</h3>
                  <p className="text-sm text-emerald-500 font-medium">Your nurturing companion</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent overscroll-contain">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
              {/* Invisible element for auto-scrolling */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 relative">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Share what's on your heart..."
                  className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500 bg-white"
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


        </div>
      </main>

      {/* File Preview Modal (exactly same as plant page) */}
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
    </div>
  );
} 