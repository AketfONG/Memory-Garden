"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import { memoryStorage, SavedMemory } from "../../utils/memoryStorage";

export default function TimelinePage() {
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<SavedMemory | null>(null);
  const [baseTimelineStart, setBaseTimelineStart] = useState<Date>(new Date());
  const [baseTimelineEnd, setBaseTimelineEnd] = useState<Date>(new Date());
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'timeline'>('timeline');
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = default, higher = zoomed in, lower = zoomed out

  // Load memories and set up timeline
  useEffect(() => {
    try {
      const allMemories = memoryStorage.getAllMemories();
      let memoriesToUse: SavedMemory[] = allMemories;
      
      // If no memories exist, add some mock memories for demonstration
      if (allMemories.length === 0) {
        const mockMemories: SavedMemory[] = [
          {
            id: 'mock_1',
            title: 'Family Reunion',
            description: 'Beautiful family gathering at grandma\'s house',
            startDate: '2024-08-15',
            startTime: '14:00',
            endDate: '2024-08-15',
            endTime: '18:00',
            vagueTime: '',
            categories: ['family'],
            customCategory: '',
            customEmotion: 'loved',
            tags: 'family, reunion, grandma',
            mediaFiles: [],
            mode: 'normal',
            timestamp: '2024-08-15T14:00:00.000Z',
            chatHistory: [],
            aiInsights: 'A warm family memory'
          },
          {
            id: 'mock_2',
            title: 'Beach Sunset',
            description: 'Watching the sun dip below the horizon',
            startDate: '2024-09-20',
            startTime: '18:30',
            endDate: '2024-09-20',
            endTime: '19:30',
            vagueTime: '',
            categories: ['nature'],
            customCategory: '',
            customEmotion: 'peaceful',
            tags: 'beach, sunset, nature',
            mediaFiles: [],
            mode: 'normal',
            timestamp: '2024-09-20T18:30:00.000Z',
            chatHistory: [],
            aiInsights: 'A peaceful nature memory'
          },
          {
            id: 'mock_3',
            title: 'Graduation Day',
            description: 'Walking across the stage to receive my diploma',
            startDate: '2024-05-20',
            startTime: '14:00',
            endDate: '2024-05-20',
            endTime: '16:00',
            vagueTime: '',
            categories: ['achievement'],
            customCategory: '',
            customEmotion: 'proud',
            tags: 'graduation, achievement, milestone',
            mediaFiles: [],
            mode: 'normal',
            timestamp: '2024-05-20T14:00:00.000Z',
            chatHistory: [],
            aiInsights: 'A proud achievement memory'
          },
          {
            id: 'mock_4',
            title: 'Morning Coffee',
            description: 'Perfect cappuccino at my favorite café',
            startDate: '2024-10-10',
            startTime: '09:00',
            endDate: '2024-10-10',
            endTime: '10:00',
            vagueTime: '',
            categories: [],
            customCategory: '',
            customEmotion: 'content',
            tags: 'coffee, morning, café',
            mediaFiles: [],
            mode: 'simple',
            timestamp: '2024-10-10T09:00:00.000Z',
            chatHistory: [],
            aiInsights: 'A simple daily moment'
          }
        ];
        memoriesToUse = mockMemories;
        setMemories(mockMemories);
      } else {
        setMemories(allMemories);
      }

      // Calculate timeline range
      if (memoriesToUse.length > 0) {
        const dates = memoriesToUse
          .map(m => new Date(m.startDate || m.timestamp))
          .filter(d => !isNaN(d.getTime()));
        
        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
          
          // Ensure dates are different (add at least 1 day if they're the same)
          if (minDate.getTime() === maxDate.getTime()) {
            maxDate.setDate(maxDate.getDate() + 1);
          }
          
          // Store base timeline range (without padding)
          setBaseTimelineStart(new Date(minDate));
          setBaseTimelineEnd(new Date(maxDate));
          
          // Initial timeline range will be set by the zoom useEffect
          // Set initial values based on zoom level
          const baseRangeDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
          
          // Use same padding logic as zoom useEffect
          const minPaddingRatio = 0.05;
          const maxPaddingRatio = 0.5;
          const paddingRatio = zoomLevel <= 0.5 
            ? minPaddingRatio 
            : minPaddingRatio + (maxPaddingRatio - minPaddingRatio) * ((zoomLevel - 0.5) / 4.5);
          
          const paddingDays = baseRangeDays * paddingRatio;
          const paddingMs = paddingDays * 1000 * 60 * 60 * 24;
          
          const initialStart = new Date(minDate.getTime() - paddingMs);
          const initialEnd = new Date(maxDate.getTime() + paddingMs);
          
          setTimelineStart(initialStart);
          setTimelineEnd(initialEnd);
        } else {
          // Fallback: use current date range if no valid dates
          const now = new Date();
          const start = new Date(now);
          start.setMonth(start.getMonth() - 6);
          const end = new Date(now);
          end.setMonth(end.getMonth() + 6);
          setBaseTimelineStart(start);
          setBaseTimelineEnd(end);
          
          const baseRangeDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          
          // Use same padding logic as zoom useEffect
          const minPaddingRatio = 0.05;
          const maxPaddingRatio = 0.5;
          const paddingRatio = zoomLevel <= 0.5 
            ? minPaddingRatio 
            : minPaddingRatio + (maxPaddingRatio - minPaddingRatio) * ((zoomLevel - 0.5) / 4.5);
          
          const paddingDays = baseRangeDays * paddingRatio;
          const paddingMs = paddingDays * 1000 * 60 * 60 * 24;
          
          setTimelineStart(new Date(start.getTime() - paddingMs));
          setTimelineEnd(new Date(end.getTime() + paddingMs));
        }
      } else {
        // Fallback: use current date range if no memories
        const now = new Date();
        const start = new Date(now);
        start.setMonth(start.getMonth() - 6);
        const end = new Date(now);
        end.setMonth(end.getMonth() + 6);
        setBaseTimelineStart(start);
        setBaseTimelineEnd(end);
        
        const baseRangeDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        // Use same padding logic as the other fallback for consistency
        const minPaddingRatio = 0.05;
        const maxPaddingRatio = 0.5;
        const paddingRatio = zoomLevel <= 0.5 
          ? minPaddingRatio 
          : minPaddingRatio + (maxPaddingRatio - minPaddingRatio) * ((zoomLevel - 0.5) / 4.5);
        const paddingDays = baseRangeDays * paddingRatio;
        const paddingMs = paddingDays * 1000 * 60 * 60 * 24;
        
        setTimelineStart(new Date(start.getTime() - paddingMs));
        setTimelineEnd(new Date(end.getTime() + paddingMs));
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update timeline range when zoom level changes
  useEffect(() => {
    const baseStartTime = baseTimelineStart.getTime();
    const baseEndTime = baseTimelineEnd.getTime();
    
    // Only update if we have valid base dates
    if (!isNaN(baseStartTime) && !isNaN(baseEndTime) && baseStartTime !== baseEndTime) {
      // Calculate padding based on zoom level
      // Higher zoom = less padding (tighter view), Lower zoom = more padding (wider view)
      // At minimum zoom (0.5), use minimal padding to show all events
      const baseRangeDays = (baseEndTime - baseStartTime) / (1000 * 60 * 60 * 24);
      
      // At minimum zoom (0.5), use minimal padding (5% of range) to ensure all events fit
      // At higher zoom levels, use more padding for context
      const minPaddingRatio = 0.05; // 5% padding at max zoom out
      const maxPaddingRatio = 0.5; // 50% padding at default zoom
      const paddingRatio = zoomLevel <= 0.5 
        ? minPaddingRatio 
        : minPaddingRatio + (maxPaddingRatio - minPaddingRatio) * ((zoomLevel - 0.5) / 4.5);
      
      const paddingDays = baseRangeDays * paddingRatio;
      const paddingMs = paddingDays * 1000 * 60 * 60 * 24;
      
      const adjustedStart = new Date(baseStartTime - paddingMs);
      const adjustedEnd = new Date(baseEndTime + paddingMs);
      
      setTimelineStart(adjustedStart);
      setTimelineEnd(adjustedEnd);
    }
  }, [zoomLevel, baseTimelineStart, baseTimelineEnd]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5)); // Max zoom 5x
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5)); // Min zoom 0.5x
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // Calculate position of memory on timeline
  const getMemoryPosition = (memory: SavedMemory) => {
    try {
      const memoryDate = new Date(memory.startDate || memory.timestamp);
      if (isNaN(memoryDate.getTime())) {
        return 50; // Center if invalid date
      }
      
      const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
      if (totalDays <= 0) {
        return 50; // Center if invalid range
      }
      
      const daysFromStart = (memoryDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
      const percentage = (daysFromStart / totalDays) * 100;
      return Math.max(0, Math.min(100, percentage));
    } catch (error) {
      console.error('Error calculating memory position:', error);
      return 50; // Center on error
    }
  };

  // Calculate minimum width for timeline container
  const getTimelineMinWidth = () => {
    if (memories.length === 0) return 2000;
    
    // Each card is ~250px wide, need spacing between them
    // At minimum zoom (0.5), ensure all cards fit with minimal spacing
    const cardWidth = 250;
    const minSpacing = 50; // Minimum spacing between cards
    const baseWidth = memories.length * (cardWidth + minSpacing);
    
    // Scale width based on zoom level - wider at higher zoom levels
    const zoomMultiplier = Math.max(1, zoomLevel * 0.5);
    return Math.max(2000, baseWidth * zoomMultiplier);
  };

  // Get memory category color
  const getCategoryColor = (memory: SavedMemory) => {
    const categoryColors: { [key: string]: string } = {
      'family': 'bg-pink-100 border-pink-300 text-pink-700',
      'nature': 'bg-green-100 border-green-300 text-green-700',
      'achievement': 'bg-yellow-100 border-yellow-300 text-yellow-700',
      'travel': 'bg-blue-100 border-blue-300 text-blue-700',
      'work': 'bg-purple-100 border-purple-300 text-purple-700',
      'love': 'bg-red-100 border-red-300 text-red-700',
      'health': 'bg-orange-100 border-orange-300 text-orange-700',
      'creativity': 'bg-indigo-100 border-indigo-300 text-indigo-700',
      'learning': 'bg-teal-100 border-teal-300 text-teal-700',
      'friends': 'bg-cyan-100 border-cyan-300 text-cyan-700'
    };
    
    const primaryCategory = memory.categories?.[0] || 'default';
    return categoryColors[primaryCategory] || 'bg-gray-100 border-gray-300 text-gray-700';
  };

  // Get memory emoji
  const getMemoryEmoji = (memory: SavedMemory) => {
    const categoryEmojis: { [key: string]: string } = {
      'family': '👨‍👩‍👧‍👦',
      'nature': '🌲',
      'achievement': '🏆',
      'travel': '✈️',
      'work': '💼',
      'love': '💕',
      'health': '🏥',
      'creativity': '🎨',
      'learning': '📚',
      'friends': '👥'
    };
    
    const primaryCategory = memory.categories?.[0] || 'default';
    return categoryEmojis[primaryCategory] || '🌱';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your memory timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <Navigation showBackButton={true} backButtonText="Back to Garden" backButtonHref="/garden" />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">📅</span>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Memory Timeline</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Journey through your memories across time. Each moment floats on its own timeline.
            </p>
          </div>

          {/* View Mode Selector */}
          <div className="flex justify-center mb-8">
            <div className="rounded-full p-3 bg-white">
              <div className="flex gap-3">
                <Link
                  href="/garden"
                  className="px-6 py-3 rounded-full font-medium inline-block text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out"
                >
                  List
                </Link>
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`px-6 py-3 rounded-full font-medium ${
                    viewMode === 'timeline'
                      ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
                      : 'text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out'
                  }`}
                >
                  Timeline
                </button>
              </div>
            </div>
          </div>

          {/* Timeline View */}
          <div className="relative" style={{ minHeight: '500px' }}>
            {/* Timeline Labels */}
            <div className="flex justify-between text-sm text-gray-500 mb-4 px-4">
              <span>{timelineStart.toLocaleDateString()}</span>
              <span>{timelineEnd.toLocaleDateString()}</span>
            </div>
            
            {/* Timeline Scroll Container */}
            <div className="relative overflow-x-auto overflow-y-visible pb-20" style={{ height: '500px' }}>
              <div className="relative" style={{ minWidth: `${getTimelineMinWidth()}px`, height: '100%' }}>
                {/* Timeline Line - Centered vertically */}
                <div 
                  className="absolute h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 rounded-full"
                  style={{
                    left: 0,
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }}
                ></div>
                
                {/* Memory Cards */}
                {memories.length > 0 ? (
                  memories.map((memory, index) => {
                    const position = getMemoryPosition(memory);
                    const isEven = index % 2 === 0;
                    
                    return (
                      <div
                        key={memory.id}
                        className="absolute transform -translate-x-1/2 cursor-pointer group"
                        style={{
                          left: `${position}%`,
                          top: isEven ? '20%' : '60%',
                          zIndex: 10
                        }}
                        onClick={() => setSelectedMemory(memory)}
                      >
                        {/* Memory Card */}
                        <div className={`
                          relative bg-white rounded-2xl p-4 shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 min-w-[200px] max-w-[250px] group-hover:z-20
                          ${getCategoryColor(memory)}
                        `}>
                          {/* Memory Emoji */}
                          <div className="text-2xl mb-2 text-center">
                            {getMemoryEmoji(memory)}
                          </div>
                          
                          {/* Memory Title */}
                          <h3 className="font-semibold text-sm mb-2 text-center line-clamp-2">
                            {memory.title}
                          </h3>
                          
                          {/* Memory Date */}
                          <p className="text-xs text-center opacity-75">
                            {new Date(memory.startDate || memory.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Timeline is Empty</h3>
                    <p className="text-gray-600 mb-8">Start planting memories to see them appear on your timeline.</p>
                    <Link
                      href="/plant"
                      className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      🌱 Plant Your First Memory
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Memory Details Modal */}
          {selectedMemory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getMemoryEmoji(selectedMemory)}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedMemory.title}</h2>
                        <p className="text-emerald-600 font-medium">
                          {new Date(selectedMemory.startDate || selectedMemory.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMemory(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>

                  {/* Memory Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{selectedMemory.description}</p>
                    </div>

                    {selectedMemory.categories && selectedMemory.categories.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedMemory.categories.map((category, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedMemory.tags && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tags</h3>
                        <p className="text-gray-600">{selectedMemory.tags}</p>
                      </div>
                    )}

                    {selectedMemory.aiInsights && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Insights</h3>
                        <p className="text-gray-600 italic">{selectedMemory.aiInsights}</p>
                      </div>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      onClick={() => setSelectedMemory(null)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <Link
                      href={`/memory?memory=${encodeURIComponent(JSON.stringify(selectedMemory))}`}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                    >
                      View Full Memory
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zoom Controls - Bottom of Page */}
          <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="w-10 h-10 rounded-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex items-center justify-center"
              title="Zoom Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <button
              onClick={handleZoomReset}
              className="px-4 h-10 rounded-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all duration-300 hover:border-emerald-300 hover:scale-105 text-sm font-medium"
              title="Reset Zoom"
            >
              Reset
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 5}
              className="w-10 h-10 rounded-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex items-center justify-center"
              title="Zoom In"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            <span className="text-sm text-gray-500 ml-2 min-w-[3rem] text-right">{Math.round(zoomLevel * 100)}%</span>
          </div>

        </div>
      </main>
      
      {/* Fixed gradient at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-50 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
