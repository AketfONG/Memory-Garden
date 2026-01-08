"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { memoryStorage, SavedMemory, MemoryMessage } from "../utils/memoryStorage";

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export default function MemoryPage() {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [dragVolume, setDragVolume] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [memorySaved, setMemorySaved] = useState(false);
  // Image generation enabled with GetImg API
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Handle form submission from plant page and generate AI insights
  useEffect(() => {
    const handleFormData = async () => {
      try {
        // Check if we have memory data from the plant page
        const urlParams = new URLSearchParams(window.location.search);
        const memoryParam = urlParams.get('memory');
        
        if (memoryParam && !memorySaved && !memoryData) {
          const decodedMemory = JSON.parse(decodeURIComponent(memoryParam));
          setMemoryData(decodedMemory);
          console.log('Memory data received:', decodedMemory);
          
          // Generate AI insights based on the memory data
          await generateAIInsights(decodedMemory);
        }
      } catch (error) {
        console.error('Error processing memory data:', error);
        // Fallback to default welcome message
        setMessages([{
          id: 1,
          type: 'assistant',
          content: "Hi! I'm Sprout, your nurturing companion. I'm here to help you grow and cherish your memories. 🌱",
          timestamp: new Date()
        }]);
      }
    };

    handleFormData();
  }, [memorySaved, memoryData]);

  // Generate AI insights based on memory data
  const generateAIInsights = async (memory: any) => {
    setIsLoadingAI(true);
    
    // Prevent duplicate saving by checking if already saved
    if (memorySaved) {
      setIsLoadingAI(false);
      return;
    }
    
    try {
      // Create a comprehensive prompt for AI analysis
      const prompt = createMemoryPrompt(memory);
      
      // Call the AI API to generate insights
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testTitle: memory.title || 'Untitled Memory',
          testDescription: prompt
        }),
      });

      const result = await response.json();

      let message: Message;
      let aiInsights: string;

      if (result.success) {
        // Start the conversation with AI-generated insights
        message = {
          id: 1,
          type: 'assistant',
          content: result.reflection,
          timestamp: new Date()
        };
        aiInsights = result.reflection;
      } else {
        // Fallback response if AI fails
        message = {
          id: 1,
          type: 'assistant',
          content: `Welcome to your Memory Garden! 🌱 I see you've planted a new memory${memory.title ? ` called "${memory.title}"` : ''}. This is a beautiful moment to cherish and reflect upon. How are you feeling about this memory?`,
          timestamp: new Date()
        };
        aiInsights = message.content;
      }
      
      setMessages([message]);
      
      // Save the memory only once with the appropriate insights
      saveMemoryToGarden(memory, [message], aiInsights);
      
            // Generate memory image
            await generateMemoryImage(memory);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback response
      const fallbackMessage: Message = {
        id: 1,
        type: 'assistant',
        content: `Welcome to your Memory Garden! 🌱 I see you've planted a new memory${memory.title ? ` called "${memory.title}"` : ''}. This is a beautiful moment to cherish and reflect upon. How are you feeling about this memory?`,
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
      
      // Save the memory with fallback insights
      saveMemoryToGarden(memory, [fallbackMessage], fallbackMessage.content);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Save memory to garden storage
  const saveMemoryToGarden = (memory: any, chatHistory: Message[], aiInsights: string) => {
    // Prevent duplicate saves
    if (memorySaved) {
      console.log('Memory already saved, skipping duplicate save');
      return;
    }
    
    try {
      // Convert Message[] to MemoryMessage[] with proper timestamps
      const memoryMessages: MemoryMessage[] = chatHistory.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp || new Date()
      }));
      
      const memoryId = memoryStorage.saveMemory(memory, memoryMessages, aiInsights);
      console.log('Memory saved to garden with ID:', memoryId);
      
      // Store the memory ID for future updates
      setMemoryData((prev: any) => ({ ...prev, savedId: memoryId }));
      
      // Mark memory as saved to prevent duplicates
      setMemorySaved(true);
    } catch (error) {
      console.error('Error saving memory to garden:', error);
    }
  };

  // Generate image for memory visualization
  // Image generation temporarily disabled
  const generateMemoryImage = async (memory: any) => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image-hybrid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'memory_visualization',
          memoryTitle: memory.title || 'Untitled Memory',
          memoryDescription: memory.description || 'A precious memory',
          style: 'realistic',
          emotion: memory.customEmotion || 'peaceful',
          category: memory.customCategory || 'general'
        }),
      });

      const result = await response.json();
      
      if (result.success && result.imageData) {
        setGeneratedImage(result.imageData);
        console.log(`Image generated using ${result.provider} provider`);
      } else {
        console.error('Failed to generate image:', result.error);
        // Show a message about adding credits if GetImg quota is exceeded
        if (result.error && result.error.includes('quota exceeded')) {
          console.log('GetImg quota exceeded. Please add credits to your GetImg account for realistic image generation.');
        }
      }
    } catch (error) {
      console.error('Error generating memory image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Create a comprehensive prompt for AI analysis
  const createMemoryPrompt = (memory: any) => {
    let prompt = '';
    
    if (memory.title) {
      prompt += `Memory Title: ${memory.title}\n`;
    }
    
    if (memory.description) {
      prompt += `Description: ${memory.description}\n`;
    }
    
    if (memory.startDate || memory.vagueTime) {
      prompt += `When: ${memory.startDate ? `${memory.startDate} ${memory.startTime || ''}` : memory.vagueTime}\n`;
    }
    
    if (memory.endDate) {
      prompt += `Duration: ${memory.startDate} to ${memory.endDate}\n`;
    }
    
    if (memory.categories && memory.categories.length > 0) {
      prompt += `Categories: ${memory.categories.join(', ')}\n`;
    }
    
    if (memory.customCategory) {
      prompt += `Custom Category: ${memory.customCategory}\n`;
    }
    
    if (memory.customEmotion) {
      prompt += `Emotion: ${memory.customEmotion}\n`;
    }
    
    if (memory.tags) {
      prompt += `Tags: ${memory.tags}\n`;
    }
    
    if (memory.mediaFiles && memory.mediaFiles.length > 0) {
      prompt += `Media: ${memory.mediaFiles.map((f: any) => f.name).join(', ')}\n`;
    }
    
    prompt += `\nPlease provide a thoughtful, therapeutic reflection on this memory. Consider the emotional significance, the details provided, and offer gentle insights that help the user explore and cherish this moment.`;
    
    return prompt;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Volume slider handlers
  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    setVolume(Math.round(percent * 100));
  };
  const handleKnobMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      setDragVolume(Math.round(percent * 100));
    } else {
      setDragVolume(volume);
    }
    document.body.style.userSelect = 'none';
  };
  React.useEffect(() => {
    let animationFrame: number;
    const handleMouseMove = (e: MouseEvent) => {
      animationFrame = requestAnimationFrame(() => {
        if (!dragging.current || !sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        setDragVolume(Math.round(percent * 100));
      });
    };
    const handleMouseUp = () => {
      dragging.current = false;
      if (dragVolume !== null) setVolume(dragVolume);
      setDragVolume(null);
      document.body.style.userSelect = '';
      cancelAnimationFrame(animationFrame);
    };
    if (dragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrame);
    };
  }, [dragVolume, volume]);

  useEffect(() => {
    setMounted(true);
    // Add timestamp only after mounting
    setMessages(prev => prev.map(msg => 
      msg.id === 1 ? { ...msg, timestamp: new Date() } : msg
    ));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    try {
      // Prepare conversation history for Google AI
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
        
        // Update the saved memory with new chat history
        if (memoryData?.savedId) {
          const memoryMessage: MemoryMessage = {
            id: aiResponse.id,
            type: aiResponse.type,
            content: aiResponse.content,
            timestamp: aiResponse.timestamp || new Date()
          };
          memoryStorage.updateChatHistory(memoryData.savedId, memoryMessage);
        }
      } else {
        // Fallback response if AI fails
        const fallbackResponse: Message = {
          id: messages.length + 2,
          type: 'assistant',
          content: 'Thank you for sharing that reflection. Every memory is unique and precious. Is there anything else you\'d like to explore about this moment? 🌸',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackResponse]);
        
        // Update the saved memory with fallback response
        if (memoryData?.savedId) {
          const memoryMessage: MemoryMessage = {
            id: fallbackResponse.id,
            type: fallbackResponse.type,
            content: fallbackResponse.content,
            timestamp: fallbackResponse.timestamp || new Date()
          };
          memoryStorage.updateChatHistory(memoryData.savedId, memoryMessage);
        }
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      // Fallback response
      const fallbackResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: 'Thank you for sharing that reflection. Every memory is unique and precious. Is there anything else you\'d like to explore about this moment? 🌸',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation showBackButton={true} />
        <main className="pt-26">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <span className="text-6xl mb-6 block">🌱</span>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Loading...</h1>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showBackButton={true} />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Success Message */}
            <div className="text-center mb-12">
              <span className="text-6xl mb-6 block">🌱</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Memory Planted Successfully!</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Your precious memory has been nurtured and planted in your garden. 
                Here&apos;s a special visualization created just for you.
              </p>
            </div>

        {/* Memory Visualization - GetImg API */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Memory Visualization</h2>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 shadow-lg border border-emerald-100">
            <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center overflow-hidden">
              {isGeneratingImage ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Generating Your Memory Visualization...</p>
                  <p className="text-gray-600">Creating a beautiful, realistic image of your memory</p>
                </div>
              ) : generatedImage ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={`data:image/png;base64,${generatedImage}`}
                    alt="Memory Visualization"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">Memory Visualisation Generated</p>
                  <p className="text-gray-600">A beautiful visualization of your memory</p>
                </div>
              )}
            </div>
          </div>
        </div>

            {/* Memory Summary */}
            {memoryData && (
              <div className="mb-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">🌿</span>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">{memoryData.title || 'Memory Garden'}</h3>
                          <p className="text-emerald-600 font-medium">Your Planted Memory</p>
                        </div>
                  </div>
                </div>
                
                <div className="space-y-6">

                  {memoryData.description && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="text-emerald-500 mr-2">📖</span>
                        Description
                      </h4>
                      <p className="text-gray-600 ml-6">{memoryData.description}</p>
                    </div>
                  )}


                  <div className="bg-emerald-100 rounded-full p-4">
                    <p className="text-emerald-700 text-sm">
                      <strong>Planted:</strong> {new Date().toLocaleDateString('en-GB', { 
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Chat Interface */}
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
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
                
                {/* AI Loading Indicator */}
                {isLoadingAI && (
                  <div className="flex justify-start">
                    <div className="max-w-xs px-4 py-3 rounded-2xl bg-emerald-50 text-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                        <p className="text-sm">Sprout is thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 relative">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Share your thoughts about this memory..."
                    className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500"
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
            <div className="mt-12 text-center">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/plant" className="w-fit bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex-shrink-0 whitespace-nowrap">
                  🪴 Plant Memory
                </Link>
                <Link href="/garden" className="w-fit border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex-shrink-0 whitespace-nowrap">
                  🌸 View My Garden
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