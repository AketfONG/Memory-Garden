"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";

export default function TourPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60); // 0-100
  const [dragVolume, setDragVolume] = useState<number|null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showBackButton={true} />

      {/* Main Content */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <span className="text-6xl mb-6 block">🎬</span>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Memory Garden</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Watch this short tour to discover how Memory Garden can transform the way you cherish and nurture your precious memories.
              </p>
            </div>

            {/* Video Player Section */}
            <div className="mb-16">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 shadow-lg border border-emerald-100">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Video Placeholder */}
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">Memory Garden Tour</p>
                    <p className="text-gray-600">Discover the magic of nurturing memories</p>
                  </div>
                  
                  {/* Video Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-emerald-200">
                    <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: isPlaying ? '45%' : '0%' }}></div>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="bg-gradient-to-b from-emerald-500 to-green-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center space-x-2"
                    >
                      {isPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="4" height="12" rx="1" fill="white"/>
                          <rect x="11" y="3" width="4" height="12" rx="1" fill="white"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="4,3 17,10 4,17" fill="white"/>
                        </svg>
                      )}
                      <span>{isPlaying ? "Pause" : "Play"}</span>
                    </button>
                    <div className="text-sm text-gray-600">
                      {isPlaying ? "2:15 / 5:00" : "0:00 / 5:00"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="mr-3 text-gray-500 text-sm w-8 text-right">{dragVolume !== null ? dragVolume : volume}</span>
                    <div className="flex items-center w-32 h-10 select-none">
                      <div
                        ref={sliderRef}
                        className="relative w-full h-2 bg-emerald-100 rounded-full cursor-pointer"
                        onClick={handleSliderClick}
                      >
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-emerald-400 rounded-full transition-all duration-200"
                          style={{ width: `${dragVolume !== null ? dragVolume : volume}%` }}
                        ></div>
                        <div
                          className="absolute top-1/2 -translate-y-1/2 transition-all duration-200"
                          style={{ left: `calc(${dragVolume !== null ? dragVolume : volume}% - 12px)` }}
                        >
                          <div
                            className="w-6 h-6 bg-gradient-to-b from-emerald-500 to-green-600 rounded-full shadow-lg border-4 border-white transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer"
                            onMouseDown={handleKnobMouseDown}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tour Highlights */}
            <div className="mb-16 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-12 backdrop-blur-md">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What You'll Discover</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Planting Memories</h3>
                  <p className="text-gray-600">Learn how to capture and nurture your precious moments with our intuitive interface.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Magic</h3>
                  <p className="text-gray-600">See how our AI transforms your words into beautiful visual stories and meaningful conversations.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💚</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Emotional Growth</h3>
                  <p className="text-gray-600">Discover how Memory Garden helps you reflect, heal, and grow through your memories.</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start Your Journey?</h2>
              <p className="text-lg text-gray-600 mb-8">
                Now that you've seen what Memory Garden can do, it's time to plant your first memory and watch it grow.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/plant" className="w-fit bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2">
                  <span>🪴</span>
                  <span>Start Growing</span>
                </Link>
                <Link href="/features" className="w-fit border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:border-emerald-300 hover:scale-105 flex items-center space-x-2">
                  <span>✨</span>
                  <span>Explore Features</span>
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
          <p className="text-sm text-gray-500 mt-4">&copy; 2025 Memory Garden. Built with love and care.</p>
        </div>
      </footer>
    </div>
  );
} 