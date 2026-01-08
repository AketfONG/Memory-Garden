"use client";
import React, { useState, useEffect, useRef } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { memoryStorage, type SavedMemory } from "../utils/memoryStorage";

interface MemoryCardData {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  media: string[];
  mediaImages: string[]; // Base64 image data URLs
  date: string;
}

export default function MemoryGarden() {
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [memoryCards, setMemoryCards] = useState<MemoryCardData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [detailViewImages, setDetailViewImages] = useState<{ [key: string]: string[] }>({});
  const [generatingImages, setGeneratingImages] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Map memory titles to demo images
  const getDemoImagesForMemory = (memoryTitle: string): string[] => {
    const imageMap: { [key: string]: string[] } = {
      "Summer Beach Day": [
        "/Summer Beach Day 1.jpg.webp",
        "/Summer Beach Day 2.jpg"
      ],
      "Family Birthday Celebration": [
        "/Family Birthday Celebration 1.webp",
        "/Family Birthday Celebration 2.jpg"
      ],
      "Mountain Hiking Adventure": [
        "/Mountain Hiking Adventure 1.jpg",
        "/Mountain Hiking Adventure 2.jpg"
      ],
      "Anniversary Dinner": [
        "/Anniversary Dinner 1.jpg",
        "/Anniversary Dinner 2.jpg"
      ],
      "Work Project Launch": [
        "/Work Project Launch 1.jpg",
        "/Work Project Launch 2.png"
      ],
      "Weekend Road Trip": [
        "/Weekend Road Trip 1.jpg.webp",
        "/Weekend Road Trip 2.jpg"
      ],
      "Art Gallery Opening": [
        "/Art Gallery Opening 1.jpg",
        "/Art Gallery Opening 2.jpg.webp"
      ]
    };

    // Check for exact match or partial match
    for (const [key, images] of Object.entries(imageMap)) {
      if (memoryTitle.includes(key) || key.includes(memoryTitle)) {
        return images;
      }
    }
    return [];
  };

  const loadMemories = () => {
    try {
      const memories = memoryStorage.getAllMemories();
      const cards: MemoryCardData[] = memories.map((memory: SavedMemory) => {
        const tags =
          memory.tags
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [];

        // Get image files from mediaFiles
        const imageFiles = (memory.mediaFiles || []).filter((file) =>
          file.type.startsWith("image")
        );

        // Load generated/uploaded images from localStorage
        let generatedImages: string[] = [];
        try {
          const imageStorageKey = `memory_images_${memory.id}`;
          const storedImages = localStorage.getItem(imageStorageKey);
          
          if (storedImages) {
            try {
              const parsedImages = JSON.parse(storedImages);
              if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                generatedImages = parsedImages
                  .filter((img: any) => img && img.data && typeof img.data === 'string')
                  .map((img: { data: string; name?: string }) => {
                    // Handle both cases: data might already have prefix or not
                    if (img.data.startsWith('data:')) {
                      return img.data;
                    }
                    // Ensure we have base64 data
                    return `data:image/png;base64,${img.data}`;
                  })
                  .filter((url: string) => url && url.length > 0); // Filter out empty strings
                
                if (generatedImages.length > 0) {
                  console.log(`Loaded ${generatedImages.length} images for memory ${memory.id}`);
                }
              }
            } catch (parseError) {
              console.error(`Error parsing images for memory ${memory.id}:`, parseError);
            }
          }
        } catch (e) {
          console.error(`Error loading images for memory ${memory.id}:`, e);
        }

        // If no images in localStorage, check for demo images
        if (generatedImages.length === 0) {
          const demoImages = getDemoImagesForMemory(memory.title);
          if (demoImages.length > 0) {
            generatedImages = demoImages;
            console.log(`Using ${demoImages.length} demo images for memory: ${memory.title}`);
          }
        }

        // If no images in localStorage, check for demo images
        if (generatedImages.length === 0) {
          const demoImages = getDemoImagesForMemory(memory.title);
          if (demoImages.length > 0) {
            generatedImages = demoImages;
            console.log(`Using ${demoImages.length} demo images for memory: ${memory.title}`);
          }
        }

        // Loaded images from localStorage or demo images
        const loadedImages = generatedImages.slice(0, 3);
        
        // Calculate media display items
        let mediaItems: string[] = [];
        let mediaImagesForDisplay: string[] = [];
        
        // First, add loaded images (either from localStorage or demo images)
        loadedImages.forEach((imgUrl) => {
          mediaItems.push("🖼️");
          // If it's a demo image path (starts with /), use it directly
          // Otherwise, it's a base64 data URL
          mediaImagesForDisplay.push(imgUrl);
        });
        
        // Then, add placeholders for image files that don't have loaded data
        // We want to show up to 3 total items, so calculate remaining slots for images
        const remainingImageSlots = Math.min(imageFiles.length - loadedImages.length, 3 - mediaItems.length);
        for (let i = 0; i < remainingImageSlots; i++) {
          mediaItems.push("🖼️");
        }
        
        // Finally, add non-image media files to fill remaining slots (up to 3 total)
        const nonImageFiles = (memory.mediaFiles || [])
          .filter((file) => !file.type.startsWith("image"))
          .slice(0, 3 - mediaItems.length);
        
        nonImageFiles.forEach((file) => {
          if (file.type.startsWith("video")) {
            mediaItems.push("🎥");
          } else if (file.type.startsWith("audio")) {
            mediaItems.push("🎵");
          } else {
            mediaItems.push("📎");
          }
        });

        const media = mediaItems.slice(0, 3);
        const mediaImages = mediaImagesForDisplay;

        // Debug logging
        if (memory.mediaFiles && memory.mediaFiles.length > 0) {
          console.log(`Memory ${memory.id}: ${memory.mediaFiles.length} media files, ${loadedImages.length} loaded images, ${media.length} media items to display`);
        }

        const date =
          memory.vagueTime ||
          memory.startDate ||
          (memory.timestamp ? new Date(memory.timestamp).toLocaleDateString() : "");

        return {
          id: memory.id,
          title: memory.title || "New Memory",
          description: memory.description || "",
          hashtags: tags,
          media,
          mediaImages: mediaImages,
          date,
        };
      });

      setMemoryCards(cards);
    } catch (error) {
      console.error("Error loading memories for garden:", error);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleDeleteMemory = (memoryId: string) => {
    if (confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      try {
        // Delete memory from storage
        memoryStorage.deleteMemory(memoryId);
        
        // Delete associated images from localStorage
        if (typeof window !== "undefined") {
          const imageStorageKey = `memory_images_${memoryId}`;
          localStorage.removeItem(imageStorageKey);
        }
        
        // If the deleted memory was selected, deselect it
        if (selectedMemory === memoryId) {
          setSelectedMemory(null);
        }
        
        // Reload memories
        loadMemories();
      } catch (error) {
        console.error("Error deleting memory:", error);
        alert("Failed to delete memory. Please try again.");
      }
    }
  };

  // Load images for detail view when memory is selected
  useEffect(() => {
    if (selectedMemory && typeof window !== "undefined") {
      const imageStorageKey = `memory_images_${selectedMemory}`;
      const storedImages = localStorage.getItem(imageStorageKey);
      
      let imageUrls: string[] = [];
      
      if (storedImages) {
        try {
          const parsedImages = JSON.parse(storedImages);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            imageUrls = parsedImages
              .filter((img: any) => img && img.data && typeof img.data === 'string')
              .map((img: { data: string }) => {
                if (img.data.startsWith('data:')) {
                  return img.data;
                }
                return `data:image/png;base64,${img.data}`;
              })
              .filter((url: string) => url && url.length > 0);
          }
        } catch (e) {
          console.error(`Error loading images for detail view:`, e);
        }
      }
      
      // Fallback to memory card's mediaImages if no localStorage images
      if (imageUrls.length === 0) {
        const memory = memoryCards.find(m => m.id === selectedMemory);
        if (memory && memory.mediaImages && memory.mediaImages.length > 0) {
          imageUrls = memory.mediaImages;
        } else {
          // If still no images, check for demo images
          const fullMemory = memoryStorage.getMemory(selectedMemory);
          if (fullMemory) {
            const demoImages = getDemoImagesForMemory(fullMemory.title);
            if (demoImages.length > 0) {
              imageUrls = demoImages;
            }
          }
        }
      }
      
      if (imageUrls.length > 0) {
        setDetailViewImages(prev => ({
          ...prev,
          [selectedMemory]: imageUrls
        }));
      }
    }
  }, [selectedMemory, memoryCards]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, memoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(memoryId, file);
      } else {
        alert('Please drop an image file');
      }
    }
  };

  // Handle image upload
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
        
        // Update detail view images
        const imageUrl = `data:image/png;base64,${base64Data}`;
        setDetailViewImages(prev => ({
          ...prev,
          [memoryId]: [...(prev[memoryId] || []), imageUrl]
        }));

        // Also save to localStorage
        if (typeof window !== "undefined") {
          const imageStorageKey = `memory_images_${memoryId}`;
          const existingImages = localStorage.getItem(imageStorageKey);
          let imagesToStore: Array<{ name: string; data: string }> = [];
          
          if (existingImages) {
            try {
              imagesToStore = JSON.parse(existingImages);
            } catch (e) {
              // If parsing fails, start fresh
            }
          }
          
          imagesToStore.push({
            name: file.name,
            data: base64Data,
          });
          
          localStorage.setItem(imageStorageKey, JSON.stringify(imagesToStore));
        }

        // Reload memories to update the card view
        loadMemories();
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateImages = async (memoryId: string) => {
    // Prevent multiple simultaneous generations
    if (generatingImages[memoryId]) {
      return;
    }

    try {
      // Set loading state
      setGeneratingImages(prev => ({ ...prev, [memoryId]: true }));

      // Find the memory data
      const memory = memoryCards.find((m) => m.id === memoryId);
      if (!memory) {
        alert("Memory not found.");
        setGeneratingImages(prev => {
          const updated = { ...prev };
          delete updated[memoryId];
          return updated;
        });
        return;
      }

      // Get the full memory data from storage
      const fullMemory = memoryStorage.getMemory(memoryId);
      if (!fullMemory) {
        alert("Memory data not found.");
        setGeneratingImages(prev => {
          const updated = { ...prev };
          delete updated[memoryId];
          return updated;
        });
        return;
      }

      const prompt = memory.description || memory.title || "A warm memory moment";
      const imagePrompts = [
        prompt.slice(0, 500),
        memory.title || prompt.slice(0, 500) || "A nostalgic memory scene",
      ];

      const generatedImages: Array<{ name: string; data: string }> = [];

      // Generate 2 images
      for (let i = 0; i < 2; i++) {
        try {
          console.log(`Generating image ${i + 1} for memory ${memoryId}...`);
          const response = await fetch("/api/generate-image-hybrid", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: imagePrompts[i],
              memoryTitle: fullMemory.title || "New Memory",
              memoryDescription: fullMemory.description || "",
              category: fullMemory.categories?.[0] || fullMemory.customCategory || "",
              emotion: fullMemory.customEmotion || "",
              style: "realistic",
              type: "memory_visualization",
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Image generation API error (${response.status}):`, errorText);
            continue;
          }

          const result = await response.json();
          console.log(`Image ${i + 1} generation response:`, { success: result.success, hasImageData: !!result.imageData, error: result.error });
          
          if (result.success && result.imageData) {
            const imageData = result.imageData;
            // Remove data URL prefix if present
            const base64Data = imageData.includes(",")
              ? imageData.split(",")[1]
              : imageData;

            if (base64Data && base64Data.length > 0) {
              generatedImages.push({
                name: `generated-image-${i + 1}.png`,
                data: base64Data,
              });
              console.log(`Successfully generated image ${i + 1} (${Math.floor(base64Data.length / 1024)}KB)`);
            } else {
              console.warn(`Image ${i + 1} has empty data`);
            }
          } else {
            console.warn(`Image ${i + 1} generation failed:`, result.error || 'Unknown error');
          }
        } catch (imageError) {
          console.error(`Error generating image ${i + 1}:`, imageError);
        }
      }

      // Store generated images in localStorage
      if (generatedImages.length > 0 && typeof window !== "undefined") {
        const imageStorageKey = `memory_images_${memoryId}`;
        const imagesToStore = generatedImages.map((img) => ({
          name: img.name,
          data: img.data,
        }));
        localStorage.setItem(imageStorageKey, JSON.stringify(imagesToStore));
        console.log(`Saved ${imagesToStore.length} generated images for memory ${memoryId}`);
        
        // Update detail view images
        const imageUrls = generatedImages.map((img) => `data:image/png;base64,${img.data}`);
        setDetailViewImages(prev => ({
          ...prev,
          [memoryId]: imageUrls
        }));
        
        // Reload memories to show new images
        loadMemories();
        alert(`Successfully generated ${generatedImages.length} image(s)!`);
      } else {
        alert("Failed to generate images. Please check the console for errors and try again.");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      alert(`Failed to generate images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clear loading state
      setGeneratingImages(prev => {
        const updated = { ...prev };
        delete updated[memoryId];
        return updated;
      });
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <Navigation fullWidth={true} primaryAction={{ text: "Back to Home", href: "/", variant: "secondary" }} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pt-16">
        <div className="h-full w-full px-8 py-8">
          <div className="h-full w-full min-h-0">
            <div className="grid lg:grid-cols-2 gap-12 h-full w-full min-h-0">
              {/* Left Column - Memory Cards Grid */}
              <div className="flex flex-col h-full min-h-0">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Your Memory Garden
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Browse your preserved memories, each one a story waiting to be revisited
                  </p>
                </div>

                  {/* Memory Cards List (scrollable) */}
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 gap-4 mb-2">
                    {memoryCards.map((memory) => (
                      <div
                        key={memory.id}
                        onClick={() =>
                          setSelectedMemory((prev) => (prev === memory.id ? null : memory.id))
                        }
                        className={`rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                          selectedMemory === memory.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
                        }`}
                      >
                        {/* Media Preview */}
                        <div className="flex gap-3 mb-4">
                          {memory.media.map((emoji, index) => {
                            const hasImage = memory.mediaImages && memory.mediaImages[index];
                            return (
                              <div
                                key={index}
                                className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
                              >
                                {hasImage ? (
                                  <img
                                    src={memory.mediaImages[index]}
                                    alt={`Memory ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{emoji}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Title and Date */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{memory.title}</h3>
                          <span className="text-sm text-gray-500">{memory.date}</span>
                        </div>

                        {/* Description */}
                        <div className="mb-3">
                          {memory.description ? (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
                              {memory.description}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 leading-relaxed line-clamp-5">
                              &nbsp;
                            </p>
                          )}
                        </div>

                        {/* Tags */}
                        {memory.hashtags && memory.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {memory.hashtags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action buttons under description */}
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateImages(memory.id);
                            }}
                            disabled={generatingImages[memory.id]}
                            className={`inline-flex items-center gap-1 px-3 h-8 rounded-full text-xs font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                              generatingImages[memory.id]
                                ? 'bg-blue-400 text-white cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                            }`}
                            title="Generate images for this memory"
                          >
                            {generatingImages[memory.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span className="text-sm">Generating...</span>
                              </>
                            ) : (
                              <span className="text-sm">✨ Generate</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMemory(memory.id);
                            }}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                            title="Delete memory"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Memory Details */}
              <div className="flex flex-col h-full min-h-0">
                {selectedMemory ? (
                  <div className="flex-1 flex flex-col min-h-0 mb-6">
                    {(() => {
                      const memory = memoryCards.find(m => m.id === selectedMemory);
                      if (!memory) return null;

                      return (
                        <div className="flex-1 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-6 shadow-lg border border-emerald-100 flex flex-col min-h-0">
                          {/* Image Section - fixed height to fill available space */}
                          <div className="flex-1 min-h-0 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
                            {(() => {
                              const images = detailViewImages[memory.id] || [];
                              if (images.length > 0) {
                                // Show first image or small grid if multiple
                                return (
                                  <div className="w-full h-full relative">
                                    {images.length === 1 ? (
                                      <img
                                        src={images[0]}
                                        alt={memory.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
                                        {images.slice(0, 4).map((img, idx) => (
                                          <img
                                            key={idx}
                                            src={img}
                                            alt={`${memory.title} ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-lg"
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                // Exact \"Add Media\" style from garden cards (click-to-upload)
                                return (
                                  <div
                                    className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fileInputRef.current?.click();
                                    }}
                                  >
                                    <p className="text-sm text-gray-600">Add Media</p>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileInputChange(memory.id, e)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                );
                              }
                            })()}
                          </div>

                          {/* Card Content - match garden card typography/layout */}
                          <div className="flex flex-col flex-shrink-0">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {memory.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {memory.description}
                            </p>
                            {/* Tags */}
                            {memory.hashtags && memory.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {memory.hashtags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{memory.date}</span>
                              {/* We don't have categories here, so we omit the pill for now */}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-6">🌱</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Select a Memory
                      </h3>
                      <p className="text-gray-600">
                        Click on a memory card to see its full details, conversation summary, and related media.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Pushed to bottom */}
                <div className="mt-auto flex gap-5">
                  <Link
                    href="/memory-stacks"
                    className="flex-1 text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    Back
                  </Link>
                  <Link
                    href="/memory-conversation"
                    className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Create New Memory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

