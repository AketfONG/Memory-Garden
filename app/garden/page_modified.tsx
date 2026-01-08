"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { memoryStorage, SavedMemory, MemoryMessage } from "../utils/memoryStorage";

export default function GardenPage() {
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeChatMemory, setActiveChatMemory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'garden'>('list');

  // Load memories on component mount
  useEffect(() => {
    try {
      const allMemories = memoryStorage.getAllMemories();
      setMemories(allMemories);
      setLoading(false);
    } catch (error) {
      console.error('Error loading memories:', error);
      setLoading(false);
    }
  }, []);

  // Handle memory selection
  const handleMemorySelection = (memoryId: string) => {
    if (selectedMemory === memoryId) {
      setSelectedMemory(null);
    } else {
      setSelectedMemory(memoryId);
      setNewMessage(''); // Clear input when switching to a new memory
    }
  };

  // Handle memory deletion
  const handleDeleteMemory = (memoryId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent memory expansion when clicking delete
    
    if (confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      try {
        // Remove from storage
        memoryStorage.deleteMemory(memoryId);
        
        // Remove from local state
        setMemories(prev => prev.filter(memory => memory.id !== memoryId));
        
        // If the deleted memory was selected, clear selection
        if (selectedMemory === memoryId) {
          setSelectedMemory(null);
        }
        
        console.log('Memory deleted successfully:', memoryId);
      } catch (error) {
        console.error('Error deleting memory:', error);
        alert('Failed to delete memory. Please try again.');
      }
    }
  };

  // Handle sending messages
  const handleSendMessage = async (memoryId: string, message: string) => {
    if (!message.trim()) return;

    const userMessage: MemoryMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

         // Add user message to local state and storage
     const updatedMemories = memories.map(memory => {
       if (memory.id === memoryId) {
         const updatedChatHistory = [...memory.chatHistory, userMessage];
         memoryStorage.updateChatHistory(memoryId, userMessage);
         return { ...memory, chatHistory: updatedChatHistory };
       }
       return memory;
     });
     setMemories(updatedMemories);

    // Clear input
    setNewMessage('');

    try {
      // Get AI response
      const response = await fetch('/api/nav-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: memories.find(m => m.id === memoryId)?.chatHistory || [],
          memoryContext: memories.find(m => m.id === memoryId)?.description || ''
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const aiMessage: MemoryMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: result.response,
          timestamp: new Date()
        };

                 // Add AI message to local state and storage
         const finalUpdatedMemories = memories.map(memory => {
           if (memory.id === memoryId) {
             const finalChatHistory = [...memory.chatHistory, userMessage, aiMessage];
             memoryStorage.updateChatHistory(memoryId, aiMessage);
             return { ...memory, chatHistory: finalChatHistory };
           }
           return memory;
         });
        setMemories(finalUpdatedMemories);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'No date') return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showBackButton={true} backButtonText="Back to Home" backButtonHref="/" />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <span className="text-6xl mb-6 block">🌱</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">My Garden</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                A timeline of your precious memories, growing and flourishing over time.
              </p>
            </div>

            {/* View Mode Selector */}
            <div className="flex justify-center mb-8">
              <div className="rounded-full p-3 bg-white">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-6 py-3 rounded-full font-medium ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                        : 'text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out'
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('garden')}
                    className={`px-6 py-3 rounded-full font-medium ${
                      viewMode === 'garden'
                        ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                        : 'text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out'
                    }`}
                  >
                    Garden
                  </button>
                </div>
              </div>
            </div>

            {/* Garden Stats */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-12 shadow-xl mb-16 text-white max-w-7xl mx-auto">
              <div className="flex flex-col items-center space-y-8">
                <div className="flex justify-center items-center space-x-8 md:space-x-16">
                  <div className="text-center flex flex-col items-center justify-center min-w-[200px]">
                    <div className="text-6xl font-bold text-white mb-2 leading-none">{memories.length}</div>
                    <div className="text-emerald-100 font-bold">Total Memories</div>
                  </div>
                  <div className="text-center flex flex-col items-center justify-center min-w-[200px]">
                    <div className="text-6xl font-bold text-white mb-2 leading-none">4</div>
                    <div className="text-emerald-100 font-bold">Categories</div>
                  </div>
                </div>
                <div className="text-center">
                  <a href="#" className="w-fit inline-block bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 text-emerald-600 px-12 py-5 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    👥 Invite Others
                  </a>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your memories...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {memories.map((memory, index) => (
                  <div key={memory.id} className="relative">
                    {/* Memory Card */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100">
                      <div className="flex items-start space-x-6">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">
                              {memory.mediaFiles.length > 0 ? '📸' : '🌱'}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-800 mb-1">{memory.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <span>{formatDate(memory.startDate || memory.vagueTime || 'No date')}</span>
                                <span>{memory.startTime}</span>
                              </div>
                              <div className="flex flex-wrap gap-4">
                                {memory.categories.length > 0 && (
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                                    {memory.categories[0]}
                                  </span>
                                )}
                                {memory.customEmotion && (
                                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                                    {memory.customEmotion}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {/* Delete Button - Next to expand arrow */}
                              <button
                                onClick={(e) => handleDeleteMemory(memory.id, e)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleDeleteMemory(memory.id, e as any);
                                  }
                                }}
                                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                                title="Delete Memory"
                                aria-label="Delete Memory"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {/* Expand/Collapse Arrow - Clickable for folding */}
                              <div 
                                className="text-emerald-600 transition-colors duration-200 cursor-pointer hover:text-emerald-700"
                                onClick={() => handleMemorySelection(memory.id)}
                              >
                                {selectedMemory === memory.id ? '▼' : '▶'}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 mb-4 leading-relaxed">{memory.description}</p>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {selectedMemory === memory.id && (
                        <div className="mt-6">
                          {/* Action Buttons */}
                          <div className="flex items-center justify-center mb-4 flex-wrap gap-4">
                            <button className="w-fit cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex-shrink-0 whitespace-nowrap">
                              <span className="text-emerald-600 font-medium">▶️ Play Video</span>
                            </button>
                            <button className="w-fit cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex-shrink-0 whitespace-nowrap">
                              <span className="text-emerald-600 font-medium">📤 Share Memory</span>
                            </button>
                            <button className="w-fit cursor-pointer border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex-shrink-0 whitespace-nowrap">
                              <span className="text-emerald-600 font-medium">🔄 Regenerate</span>
                            </button>
                          </div>

                          {/* Chat History */}
                          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
                            {/* Chat Header */}
                            <div className="bg-white p-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                                  <span className="text-emerald-600 text-lg">🌱</span>
                                </div>
                                <div>
                                  <h4 className="text-xl font-semibold text-gray-800">Sprout</h4>
                                  <p className="text-sm text-emerald-500 font-medium">Your nurturing companion</p>
                                </div>
                              </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="h-96 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent overscroll-contain">
                              {memory.chatHistory.map((chat, chatIndex) => (
                                <div
                                  key={chatIndex}
                                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                                      chat.type === 'user'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-50 text-gray-800'
                                    }`}
                                  >
                                    <p className="text-sm">{chat.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {chat.timestamp.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Chat Input */}
                            <div className="p-6 relative" onClick={(e) => e.stopPropagation()}>
                              <form className="flex space-x-3" onSubmit={(e) => e.preventDefault()}>
                                <input
                                  type="text"
                                  placeholder="Share your thoughts about this memory..."
                                  className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500"
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSendMessage(memory.id, newMessage);
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  type="button"
                                  className="bg-gradient-to-b from-emerald-500 to-green-600 text-white w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSendMessage(memory.id, newMessage);
                                  }}
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty State (when no memories) */}
                {memories.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6">🌱</div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Garden is Empty</h3>
                    <p className="text-gray-600 mb-8">Start planting your first memory to see it grow here.</p>
                  </div>
                )}

                {/* Plant New Memory Button */}
                <div className="text-center mt-12">
                  <Link 
                    href="/plant" 
                    className="w-fit inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="text-emerald-100 transition-all duration-300 hover:drop-shadow-md">🪴</span> Plant Memory
                  </Link>
                </div>
              </div>
            )}
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


