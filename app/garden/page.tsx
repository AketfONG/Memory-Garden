"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navigation from "../components/Navigation";
import { memoryStorage, SavedMemory, MemoryMessage } from "../utils/memoryStorage";

function GardenPageInner() {
  const searchParams = useSearchParams();
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeChatMemory, setActiveChatMemory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'garden' | 'cards'>('list');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAnimating, setDeleteAnimating] = useState<'none' | 'in' | 'out'>('none');
  const deleteConfirmedRef = useRef(false);
  const [memoryImages, setMemoryImages] = useState<{ [key: string]: string }>({});
  const [generatingImages, setGeneratingImages] = useState<{ [key: string]: boolean }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Set view mode from URL parameter
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'cards' || viewParam === 'list' || viewParam === 'garden') {
      setViewMode(viewParam);
    }
  }, [searchParams]);

  // Load images for memory cards when memories are loaded
  useEffect(() => {
    if (memories.length > 0 && !loading) {
      // Check localStorage for saved images first
      memories.forEach((memory) => {
        if (!memoryImages[memory.id] && !generatingImages[memory.id]) {
          // Check if image exists in localStorage
          const imageStorageKey = `memory_image_${memory.id}`;
          const savedImage = localStorage.getItem(imageStorageKey);
          if (savedImage) {
            setMemoryImages(prev => ({
              ...prev,
              [memory.id]: savedImage
            }));
          } else {
            // Generate image if not found
            generateMemoryCardImage(memory);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memories.length, loading]);

  // Load memories on component mount
  useEffect(() => {
    try {
      const allMemories = memoryStorage.getAllMemories();
      
      // If no memories exist, add some mock memories for demonstration
      if (allMemories.length === 0) {
        const mockMemories: SavedMemory[] = [
          {
            id: 'mock_1',
            title: 'Family Reunion at Grandma\'s House',
            description: 'The whole family gathered at Grandma\'s house for our annual summer reunion. The backyard was filled with laughter as cousins played tag while the adults shared stories around the picnic table. Grandma\'s famous apple pie was the highlight of the day, and I\'ll never forget how her eyes lit up when we all sang "Happy Birthday" to her. The warmth of family love filled every corner of that house.',
            startDate: '2026-08-15',
            startTime: '14:00',
            endDate: '',
            endTime: '',
            vagueTime: '',
            categories: ['family'],
            customCategory: '',
            customEmotion: 'loved',
            tags: 'family, reunion, grandma, cousins',
            mediaFiles: [],
            mode: 'normal',
            timestamp: '2026-08-15T14:00:00.000Z',
            chatHistory: [
              {
                id: 1,
                type: 'assistant',
                content: 'What a beautiful memory of family connection! The image of cousins playing while adults share stories really captures the essence of a perfect family gathering. Tell me more about your grandma\'s famous apple pie - what made it so special?',
                timestamp: new Date('2026-08-15T14:30:00.000Z')
              }
            ],
            aiInsights: 'This memory beautifully captures the warmth and joy of family gatherings, highlighting the importance of intergenerational connections and shared traditions.'
          },
          {
            id: 'mock_2',
            title: 'First Day of College',
            description: 'Walking through the campus gates with my backpack and a mix of nervousness and excitement. The autumn leaves were just starting to turn, and I could hear the distant sound of students chatting and laughing. I remember feeling so small in that big lecture hall, but also incredibly hopeful about what the next four years would bring. My roommate Sarah became my first friend, and we\'re still close today.',
            startDate: '2024-09-03',
            startTime: '08:00',
            endDate: '',
            endTime: '',
            vagueTime: '',
            categories: ['learning'],
            customCategory: '',
            customEmotion: 'excited',
            tags: 'college, new beginnings, nervous, excited',
            mediaFiles: [],
            mode: 'normal',
            timestamp: '2024-09-03T08:00:00.000Z',
            chatHistory: [
              {
                id: 1,
                type: 'assistant',
                content: 'What an exciting new chapter! The mix of nervousness and excitement you describe is so relatable for anyone starting college. What was your first class that day, and how did you and Sarah first connect?',
                timestamp: new Date('2024-09-03T08:30:00.000Z')
              }
            ],
            aiInsights: 'This memory captures the universal experience of new beginnings, showing how initial nervousness can transform into lasting friendships and personal growth.'
          },
          {
            id: 'mock_3',
            title: 'Sunset Beach Walk with Dad',
            description: 'Dad and I took our usual evening walk along the beach as the sun painted the sky in shades of orange and pink. We talked about life, dreams, and the future while the waves gently lapped at our feet. It was one of those perfect moments where everything felt right in the world. Dad shared stories from his own college days, and I realized how much I\'ve grown to appreciate these quiet conversations.',
            startDate: '2026-07-20',
            startTime: '18:30',
            endDate: '',
            endTime: '',
            vagueTime: '',
            categories: ['family'],
            customCategory: '',
            customEmotion: 'peaceful',
            tags: 'beach, sunset, dad, peaceful, reflection',
            mediaFiles: [],
            mode: 'normal',
            timestamp: '2026-07-20T18:30:00.000Z',
            chatHistory: [
              {
                id: 1,
                type: 'assistant',
                content: 'Such a peaceful and meaningful moment! The image of walking along the beach at sunset while having deep conversations is truly beautiful. What advice did your dad give you that day that has stayed with you?',
                timestamp: new Date('2026-07-20T19:00:00.000Z')
              }
            ],
            aiInsights: 'This memory highlights the importance of quality time with family and the wisdom that comes from intergenerational conversations in peaceful settings.'
          },
          {
            id: 'mock_4',
            title: 'High School Graduation',
            description: 'Walking across the stage to receive my diploma, I could hear my family cheering from the audience. Four years of hard work, late nights studying, and countless memories with friends all led to this moment. The ceremony was bittersweet - excited for the future but sad to leave behind the friends and teachers who had become like family. The after-party at Megan\'s house was filled with laughter, tears, and promises to stay in touch.',
            startDate: '2023-06-12',
            startTime: '19:00',
            endDate: '',
            endTime: '',
            vagueTime: '',
            categories: ['achievement'],
            customCategory: '',
            customEmotion: 'proud',
            tags: 'graduation, achievement, proud, bittersweet',
            mediaFiles: [],
            mode: 'normal',
            timestamp: '2023-06-12T19:00:00.000Z',
            chatHistory: [
              {
                id: 1,
                type: 'assistant',
                content: 'What a milestone moment! The bittersweet feeling of graduation is so universal - excitement for the future mixed with sadness about leaving behind familiar faces. What was your favorite high school memory that you reflected on during that day?',
                timestamp: new Date('2023-06-12T19:30:00.000Z')
              }
            ],
            aiInsights: 'This memory captures the emotional complexity of major life transitions, celebrating achievement while acknowledging the loss of familiar routines and relationships.'
          },
          {
            id: 'mock_5',
            title: 'The Great Pancake Disaster',
            description: 'Attempted to make pancakes for Mom on her birthday and completely burned the first batch. The kitchen was filled with smoke and the smell of charred batter. Instead of being upset, Mom laughed and taught me the right way to make pancakes. We ended up having the best breakfast together, and I learned that sometimes the best memories come from our mistakes. The second batch was perfect!',
            startDate: '2026-03-08',
            startTime: '09:00',
            endDate: '',
            endTime: '',
            vagueTime: '',
            categories: ['family'],
            customCategory: '',
            customEmotion: 'grateful',
            tags: 'cooking, disaster, fun, learning, mom',
            mediaFiles: [],
            mode: 'simple',
            timestamp: '2026-03-08T09:00:00.000Z',
            chatHistory: [
              {
                id: 1,
                type: 'assistant',
                content: 'What a wonderful example of turning a mistake into a beautiful memory! Your mom\'s reaction shows such wisdom and love. What\'s your favorite pancake topping now, and do you still make pancakes for special occasions?',
                timestamp: new Date('2026-03-08T09:30:00.000Z')
              }
            ],
            aiInsights: 'This memory beautifully illustrates how mistakes can become opportunities for learning and connection, showing the importance of patience and humor in family relationships.'
          }
        ];
        setMemories(mockMemories);
      } else {
        setMemories(allMemories);
      }
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

  // Generate image for memory card
  const generateMemoryCardImage = async (memory: SavedMemory) => {
    // Skip if already generating or has image
    if (generatingImages[memory.id] || memoryImages[memory.id]) {
      return;
    }

    setGeneratingImages(prev => ({ ...prev, [memory.id]: true }));

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
          category: memory.categories[0] || 'general'
        }),
      });

      const result = await response.json();
      
      if (result.success && result.imageData) {
        setMemoryImages(prev => ({
          ...prev,
          [memory.id]: result.imageData
        }));
      }
    } catch (error) {
      console.error('Error generating memory card image:', error);
    } finally {
      setGeneratingImages(prev => {
        const updated = { ...prev };
        delete updated[memory.id];
        return updated;
      });
    }
  };

  // Handle image upload for memory card
  const handleImageUpload = async (memoryId: string, file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image too large. Please upload images smaller than 5MB');
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present
        const base64Data = base64String.includes(',') 
          ? base64String.split(',')[1] 
          : base64String;
        
        setMemoryImages(prev => ({
          ...prev,
          [memoryId]: base64Data
        }));
      };
      reader.onerror = () => {
        alert('Failed to read image file');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  // Handle file input change
  const handleFileInputChange = (memoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(memoryId, file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRefs.current[memoryId]) {
      fileInputRefs.current[memoryId]!.value = '';
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

  // Handle delete all memories
  const handleDeleteAllMemories = () => {
    // Mark deletion as confirmed and trigger exit animation
    deleteConfirmedRef.current = true;
    setDeleteAnimating('out');
    // Re-enable body scrolling
    document.body.style.overflow = 'unset';
  };

  const handleShowDeleteConfirm = () => {
    deleteConfirmedRef.current = false; // Reset deletion flag
    setShowDeleteConfirm(true);
    setDeleteAnimating('in');
    // Disable body scrolling
    document.body.style.overflow = 'hidden';
  };

  const handleHideDeleteConfirm = () => {
    setDeleteAnimating('out');
    // Re-enable body scrolling
    document.body.style.overflow = 'unset';
  };

  // Handle click outside to close popup
  useEffect(() => {
    if (!showDeleteConfirm) return;
    
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.delete-confirmation-popup')) {
        handleHideDeleteConfirm();
      }
    }
    
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showDeleteConfirm]);

  // Cleanup: ensure scrolling is re-enabled when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
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
                    onClick={() => setViewMode('cards')}
                    className={`px-6 py-3 rounded-full font-medium ${
                      viewMode === 'cards'
                        ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                        : 'text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out'
                    }`}
                  >
                    Memory Cards
                  </button>
                  <Link
                    href="/garden/timeline"
                    className={`px-6 py-3 rounded-full font-medium inline-block ${
                      viewMode === 'garden'
                        ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                        : 'text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out'
                    }`}
                  >
                    Timeline
                  </Link>
                </div>
              </div>
            </div>

            {/* Delete All Button */}
            <div className="text-center mb-8">
              <button
                onClick={memories.length > 0 ? handleShowDeleteConfirm : undefined}
                disabled={memories.length === 0}
                className={`px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 flex items-center space-x-3 mx-auto ${
                  memories.length > 0
                    ? 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>🗑️</span>
                <span>Delete All Memories</span>
              </button>
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

            {/* Memory Cards View */}
            {viewMode === 'cards' && (
              <div className="mb-16">
                {/* Memory Cards Grid */}
                {loading ? (
                  <div className="bg-white rounded-3xl p-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading memory cards...</p>
                  </div>
                ) : memories.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">No Memory Cards Yet</h3>
                    <p className="text-gray-600 mb-8">Start planting memories to see them appear as beautiful visual cards.</p>
                    <Link
                      href="/plant"
                      className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      🌱 Plant Your First Memory
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {memories.map((memory) => {
                        const hasImage = memoryImages[memory.id];
                        const isGenerating = generatingImages[memory.id];

                        return (
                          <div
                            key={memory.id}
                            className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-4 shadow-lg border border-emerald-100 cursor-pointer group hover:shadow-xl transition-all duration-300 flex flex-col"
                            onClick={() => handleMemorySelection(memory.id)}
                          >
                            {/* Image Section - Same style as memory visualization */}
                            <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center overflow-hidden">
                              {isGenerating ? (
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                                  <p className="text-lg font-semibold text-gray-700 mb-2">Generating Your Memory Visualization...</p>
                                  <p className="text-gray-600">Creating a beautiful, realistic image of your memory</p>
                                </div>
                              ) : hasImage ? (
                                <img 
                                  src={`data:image/png;base64,${hasImage}`}
                                  alt={memory.title}
                                  className="w-full h-full object-cover rounded-2xl"
                                />
                              ) : (
                                <div 
                                  className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRefs.current[memory.id]?.click();
                                  }}
                                >
                                  <p className="text-sm text-gray-600">Add Media</p>
                                  <input
                                    ref={(el) => {
                                      fileInputRefs.current[memory.id] = el;
                                    }}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileInputChange(memory.id, e)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="mt-6 flex flex-col flex-1">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{memory.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{memory.description}</p>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                                <span>{formatDate(memory.startDate || memory.vagueTime || 'No date')}</span>
                                {memory.categories.length > 0 && (
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                    {memory.categories[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                )}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <>
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

              </div>
            )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Generate Memory Button - Bottom of Page */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <Link
            href="/plant"
            className="bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-3 mx-auto w-fit"
          >
            <span>🪴</span>
            <span>Generate Memory</span>
          </Link>
        </div>
      </div>

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

        {/* Delete Confirmation Popup */}
        {(showDeleteConfirm || deleteAnimating === 'out') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className={`delete-confirmation-popup bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-red-100 ${
                deleteAnimating === 'in' ? 'animate-slide-down' : 
                deleteAnimating === 'out' ? 'animate-slide-up' : ''
              }`}
               onAnimationEnd={() => { 
                 if (deleteAnimating === 'out') {
                   setDeleteAnimating('none');
                   setShowDeleteConfirm(false);
                   // Re-enable body scrolling when popup is fully closed
                   document.body.style.overflow = 'unset';
                   
                   // Perform deletion cleanup if confirmed
                   if (deleteConfirmedRef.current) {
                     memoryStorage.clearAllMemories();
                     setMemories([]);
                     setSelectedMemory(null);
                     setActiveChatMemory(null);
                     deleteConfirmedRef.current = false; // Reset flag
                   }
                 } else if (deleteAnimating === 'in') {
                   setDeleteAnimating('none');
                 }
               }}
            >
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              {/* Modal Content */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete All Memories?</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                This action cannot be undone. All {memories.length} memories will be permanently deleted from your garden.
              </p>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleHideDeleteConfirm}
                  className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 hover:border-red-300 hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <span>❌</span>
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleDeleteAllMemories}
                  className="flex-1 bg-gradient-to-b from-red-500 to-red-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <span>🗑️</span>
                  <span>Delete All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GardenPage() {
  return (
    <Suspense fallback={null}>
      <GardenPageInner />
    </Suspense>
  );
}