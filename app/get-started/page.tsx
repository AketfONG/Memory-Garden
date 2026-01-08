"use client";
import React, { useState } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { memoryStorage } from "../utils/memoryStorage";

export default function GetStarted() {
  const [dragActive, setDragActive] = useState(false);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [momentDate, setMomentDate] = useState("");
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizeError, setOrganizeError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          setImageFiles(prev => [...prev, file]);
        } else if (file.type.startsWith('video/')) {
          setVideoFiles(prev => [...prev, file]);
        } else if (file.type.startsWith('audio/')) {
          setAudioFiles(prev => [...prev, file]);
        }
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          setImageFiles(prev => [...prev, file]);
        } else if (file.type.startsWith('video/')) {
          setVideoFiles(prev => [...prev, file]);
        } else if (file.type.startsWith('audio/')) {
          setAudioFiles(prev => [...prev, file]);
        }
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setImageFiles(prev => [...prev, ...Array.from(files)]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setVideoFiles(prev => [...prev, ...Array.from(files)]);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) setAudioFiles(prev => [...prev, ...Array.from(files)]);
  };

  const deleteAudioFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteVideoFile = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartOrganizing = async () => {
    setOrganizeError(null);
    if (isOrganizing) return;

    const allFiles = [...imageFiles, ...videoFiles, ...audioFiles];
    if (allFiles.length === 0) {
      // Nothing to organize, just go to stacks
      window.location.href = "/memory-stacks";
      return;
    }

    setIsOrganizing(true);
    try {
      const imageNames = imageFiles.map((f) => f.name).join(", ") || "none";
      const videoNames = videoFiles.map((f) => f.name).join(", ") || "none";
      const audioNames = audioFiles.map((f) => f.name).join(", ") || "none";

      const prompt = `
You are helping organize a stack of personal memories based on media files.

Media details:
- When: ${momentDate || "unknown"}
- Images: ${imageNames}
- Videos: ${videoNames}
- Audio: ${audioNames}

Return ONLY a compact JSON object with this exact shape:
{"title": "<short warm stack title (3-8 words)>", "summary": "<one or two sentences summarizing the likely memory context for a family-friendly app>"}
`;

      const response = await fetch("/api/google-ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          conversationHistory: [],
        }),
      });

      let aiTitle = "";
      let aiSummary = "";

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
              const parsed = JSON.parse(trimmed);
              if (parsed.type === "complete" && parsed.content) {
                let content = String(parsed.content).trim();

                // Try to extract a clean JSON object from the content
                let jsonCandidate = content
                  .replace(/```json/gi, "")
                  .replace(/```/g, "")
                  .trim();

                const firstBrace = jsonCandidate.indexOf("{");
                const lastBrace = jsonCandidate.lastIndexOf("}");
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                  jsonCandidate = jsonCandidate.slice(firstBrace, lastBrace + 1);
                }

                try {
                  const parsedContent = JSON.parse(jsonCandidate);
                  if (parsedContent.title) {
                    aiTitle = String(parsedContent.title).trim();
                  }
                  if (parsedContent.summary) {
                    aiSummary = String(parsedContent.summary).trim();
                  }
                } catch {
                  // Fallback: try to pull a "title" field with regex
                  const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/);
                  if (titleMatch && titleMatch[1]) {
                    aiTitle = titleMatch[1].trim();
                  } else {
                    // Last resort: use a cleaned, truncated text as title
                    aiTitle = content.replace(/[\r\n]/g, " ").slice(0, 80).trim();
                  }
                }
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }

      if (!aiTitle) {
        aiTitle = "New Memory Stack";
      }

      const memorySummary = {
        title: aiTitle,
        description: aiSummary,
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        vagueTime: momentDate,
        categories: [],
        customCategory: "",
        customEmotion: "",
        tags: "",
        mediaFiles: allFiles.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
        mode: "simple",
        timestamp: new Date().toISOString(),
      };

      try {
        const memoryId = memoryStorage.saveMemory(memorySummary, [], "");
        
        // Store uploaded images in localStorage
        if (imageFiles.length > 0 && typeof window !== "undefined") {
          try {
            const imagePromises = imageFiles.slice(0, 3).map((imageFile) => {
              return new Promise<{ name: string; data: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  try {
                    const base64String = reader.result as string;
                    const base64Data = base64String.includes(",")
                      ? base64String.split(",")[1]
                      : base64String;
                    resolve({
                      name: imageFile.name,
                      data: base64Data,
                    });
                  } catch (error) {
                    reject(error);
                  }
                };
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
              });
            });
            
            const imagesToStore = await Promise.all(imagePromises);
            
            if (imagesToStore.length > 0) {
              const imageStorageKey = `memory_images_${memoryId}`;
              localStorage.setItem(imageStorageKey, JSON.stringify(imagesToStore));
            }
          } catch (imageError) {
            console.error("Error storing uploaded images:", imageError);
          }
        }
      } catch (error) {
        console.error("Failed to save organized memory:", error);
      }

      window.location.href = "/memory-stacks";
    } catch (error) {
      console.error("Error organizing memories:", error);
      setOrganizeError("Could not organize memories with AI. You can still view stacks.");
      window.location.href = "/memory-stacks";
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-white flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <Navigation fullWidth={true} primaryAction={{ text: "Back to Home", href: "/", variant: "secondary" }} />

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:overflow-hidden">
        <div className="w-full px-8 py-8 lg:h-full">
          <div className="w-full lg:h-full">
            <div className="grid lg:grid-cols-2 gap-12 w-full lg:h-full">
              {/* Left Column - Upload Area */}
              <div className="flex flex-col lg:h-full">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Import Your Memories
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Import photos, videos, and audios so that AI can organize for you according to context and timeline
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex-1 flex items-center justify-center ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center w-full">
                    <div className="text-6xl mb-6">📸</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Drop your files here or click to browse
                    </h2>
                    <p className="text-gray-600 mb-6 text-base">
                      Supported: Photos (JPG, PNG, HEIC), Videos (MP4, MOV), Audio (MP3, M4A, WAV)
                    </p>
                    <label className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer">
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Media Type Descriptions */}
                <div className="mt-6 grid grid-cols-3 gap-5">
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
                    <div className="text-5xl mb-4">🖼️</div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-base">Photos</h4>
                    <p className="text-sm text-gray-600">By people & places</p>
                  </div>
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
                    <div className="text-5xl mb-4">🎥</div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-base">Videos</h4>
                    <p className="text-sm text-gray-600">Moments in motion</p>
                  </div>
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
                    <div className="text-5xl mb-4">🎤</div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-base">Audio</h4>
                    <p className="text-sm text-gray-600">Voice recordings</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Information */}
              <div className="flex flex-col lg:h-full">
                {/* How It Works */}
                <div className="hidden md:block bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-10 mb-10 border border-emerald-100">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">
                    How AI Organizes Your Memories
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-5 flex-shrink-0 shadow-lg">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">Context Analysis</h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          AI analyzes the content of your photos, videos, and audio to understand the context, people, places, and events.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-5 flex-shrink-0 shadow-lg">2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">Timeline Organization</h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          Files are automatically organized chronologically based on metadata, content analysis, and context clues.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-5 flex-shrink-0 shadow-lg">3</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">Story Creation</h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          Related memories are grouped together to create coherent stories and memory cards that you can revisit and share.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* When did the moment happen */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    When did the moment happen?
                  </label>
                  <input
                    type="text"
                    value={momentDate}
                    onChange={(e) => setMomentDate(e.target.value)}
                    placeholder="e.g., Summer 2024, Last year, March 15th..."
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                  />
                </div>

                {/* Uploaded Files Preview */}
                <div className="flex flex-col mb-10">
                  <p className="text-sm text-gray-600 mb-2">Uploaded files will appear here</p>
                  <div className="bg-gray-50 rounded-3xl p-4 border border-gray-200 min-h-[120px]">
                    {[...imageFiles, ...videoFiles, ...audioFiles].length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {[...imageFiles, ...videoFiles, ...audioFiles].map((file, idx) => {
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
                                    className="w-full h-full object-cover rounded-t-xl"
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
                      <div className="flex items-center justify-center min-h-[120px] pt-4">
                        <p className="text-gray-500 text-sm text-center">No files uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Pushed to bottom */}
                <div className="mt-auto flex gap-5">
                  <Link
                    href="/"
                    className="flex-1 text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    Back to Home
                  </Link>
                <button
                  type="button"
                  onClick={handleStartOrganizing}
                  disabled={isOrganizing}
                  className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isOrganizing ? "Organizing..." : "Start Organizing"}
                </button>
                </div>
              {organizeError && (
                <p className="mt-4 text-sm text-red-500 text-center">{organizeError}</p>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{selectedFile.name}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>
            <div className="p-4 h-[calc(80vh-80px)] overflow-auto flex items-center justify-center">
              {selectedFile.type.startsWith('image') && (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt={selectedFile.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}
              {selectedFile.type.startsWith('video') && (
                <video
                  src={URL.createObjectURL(selectedFile)}
                  controls
                  className="max-w-full max-h-full rounded-lg"
                />
              )}
              {selectedFile.type.startsWith('audio') && (
                <div className="flex flex-col items-center justify-center space-y-4 w-full">
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
