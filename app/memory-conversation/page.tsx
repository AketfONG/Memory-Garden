"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { memoryStorage, type SavedMemory, type MemoryMessage } from "../utils/memoryStorage";
import { stackStorage, type MemoryStack as StackData } from "../utils/stackStorage";

// Type definitions for Speech Recognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

function MemoryConversationInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "stack"; // stack, random, new
  const stackId = searchParams.get("stack");
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [voiceHints, setVoiceHints] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isMockLoading, setIsMockLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [selectedMemoryStack, setSelectedMemoryStack] = useState<StackData | null>(null);

  // Get page title based on type
  const getPageTitle = () => {
    switch (type) {
      case "random":
        return "Random Memory Discovery";
      case "new":
        return "Create New Memory";
      default:
        return "Memory Conversation";
    }
  };

  // Load selected memory stack
  useEffect(() => {
    if (stackId && (type === "stack" || type === "random")) {
      try {
        const stack = stackStorage.getStack(stackId);
        setSelectedMemoryStack(stack);
      } catch (e) {
        console.error("Failed to load memory stack:", e);
        setSelectedMemoryStack(null);
      }
    } else if (type === "new") {
      setSelectedMemoryStack(null);
    }
  }, [stackId, type]);

  // Get voice hints based on type
  useEffect(() => {
    const hints = {
      stack: [
        "What was happening in this memory?",
        "Who was with you?",
        "How did you feel?",
        "What made this moment special?",
        "Tell me more about this experience"
      ],
      random: [
        "What comes to mind when you see this?",
        "What do you remember about this?",
        "Can you describe what happened?",
        "Who was there with you?",
        "What was the best part?"
      ],
      new: [
        "What memory would you like to share?",
        "When did this happen?",
        "Who was involved?",
        "What made it memorable?",
        "Tell me the story"
      ]
    };
    setVoiceHints(hints[type as keyof typeof hints] || hints.stack);
  }, [type]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("");
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        
        // Add transcript to conversation history
        if (transcript.trim()) {
          setConversationHistory(prev => [
            ...prev,
            { role: "user", content: transcript }
          ]);
          setTranscript("");
        }
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
  };

  const handleMockConversation = async () => {
    if (isMockLoading) return;
    setIsMockLoading(true);

    try {
      let contextText = "";

      if (stackId) {
        const memory: SavedMemory | null = memoryStorage.getMemory(stackId);
        if (memory) {
          const when =
            memory.vagueTime ||
            memory.startDate ||
            (memory.timestamp ? new Date(memory.timestamp).toLocaleDateString() : "unknown time");

          const mediaSummary = memory.mediaFiles?.length
            ? `${memory.mediaFiles.length} media files (e.g. ${memory.mediaFiles
                .slice(0, 3)
                .map((m) => m.name)
                .join(", ")})`
            : "no media files";

          contextText = `Memory title: ${memory.title || "Untitled Memory"}
When: ${when}
Summary: ${memory.description || "No summary yet"}
Categories: ${(memory.categories || []).join(", ") || "none"}
Media: ${mediaSummary}`;
        }
      }

      const systemPrompt = `
You are creating a short, gentle mock conversation about a personal memory for an elderly-friendly app.

Context about the memory:
${contextText || "No specific memory context was provided. Use a generic warm memory."}

Return ONLY a JSON array called messages, with 4 to 6 turns, where each item has:
{ "role": "user" | "assistant", "content": "<the message text>" }

The conversation should:
- Feel natural and warm
- Talk specifically about this memory (people, feelings, details)
- Keep each message short (1–2 sentences)
`;

      const response = await fetch("/api/google-ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: systemPrompt,
          conversationHistory: [],
        }),
      });

      const newMessages: Array<{ role: string; content: string }> = [];

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

                // Clean possible markdown fences
                content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

                const firstBracket = content.indexOf("[");
                const lastBracket = content.lastIndexOf("]");
                if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                  content = content.slice(firstBracket, lastBracket + 1);
                }

                try {
                  const parsedMessages = JSON.parse(content);
                  if (Array.isArray(parsedMessages)) {
                    parsedMessages.forEach((msg) => {
                      if (
                        msg &&
                        (msg.role === "user" || msg.role === "assistant") &&
                        typeof msg.content === "string"
                      ) {
                        newMessages.push({ role: msg.role, content: msg.content });
                      }
                    });
                  }
                } catch (e) {
                  console.warn("Failed to parse mock conversation JSON:", e);
                }
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }

      if (!newMessages.length) {
        // Fallback simple conversation
        newMessages.push(
          { role: "user", content: "I remember this moment so clearly." },
          { role: "assistant", content: "Tell me more about what was happening then." },
          {
            role: "user",
            content: "We were together as a family, and it felt very warm and peaceful.",
          },
          {
            role: "assistant",
            content: "That sounds like a very special time. What do you cherish most about it?",
          }
        );
      }

      setConversationHistory(newMessages);
      setTranscript("");
    } catch (error) {
      console.error("Error creating mock conversation:", error);
    } finally {
      setIsMockLoading(false);
    }
  };

  // Handle text input submission
  const handleTextInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessingText) return;

    const userMessage = textInput.trim();
    setTextInput("");
    setIsProcessingText(true);

    // Add user message to conversation history
    const newUserMessage = { role: "user", content: userMessage };
    setConversationHistory((prev) => [...prev, newUserMessage]);

    try {
      // Get context from base memory if available
      let contextText = "";
      if (stackId) {
        const memory: SavedMemory | null = memoryStorage.getMemory(stackId);
        if (memory) {
          const when =
            memory.vagueTime ||
            memory.startDate ||
            (memory.timestamp ? new Date(memory.timestamp).toLocaleDateString() : "unknown time");

          const mediaSummary = memory.mediaFiles?.length
            ? `${memory.mediaFiles.length} media files`
            : "no media files";

          contextText = `Memory title: ${memory.title || "Untitled Memory"}
When: ${when}
Summary: ${memory.description || "No summary yet"}
Categories: ${(memory.categories || []).join(", ") || "none"}
Media: ${mediaSummary}`;
        }
      }

      // Prepare conversation history for API
      const conversationHistoryForAPI = [
        ...conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: userMessage },
      ];

      const systemPrompt = contextText
        ? `You are a gentle, caring companion helping someone explore their memories. 

Context about the memory they're discussing:
${contextText}

Respond naturally and warmly to continue the conversation. Keep responses short (1-2 sentences) and encouraging.`
        : `You are a gentle, caring companion helping someone explore their memories. Respond naturally and warmly. Keep responses short (1-2 sentences) and encouraging.`;

      // Call AI API
      const response = await fetch("/api/google-ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistoryForAPI,
          systemPrompt,
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let aiResponse = "";

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
              if (parsed.type === "content" && parsed.content) {
                aiResponse += parsed.content;
              } else if (parsed.type === "complete" && parsed.content) {
                aiResponse += parsed.content;
              }
            } catch {
              // ignore malformed lines
            }
          }
        }

        if (aiResponse.trim()) {
          // Add AI response to conversation history
          setConversationHistory((prev) => [
            ...prev,
            { role: "assistant", content: aiResponse.trim() },
          ]);
        }
      }
    } catch (error) {
      console.error("Error processing text input:", error);
      // Add error message to conversation
      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't process that. Could you try again?",
        },
      ]);
    } finally {
      setIsProcessingText(false);
    }
  };

  // Create a simple summary from the conversation history
  const createConversationSummary = () => {
    const allMessages = [
      ...conversationHistory.map((m) => m.content),
      transcript.trim() ? transcript.trim() : "",
    ].filter(Boolean);

    if (allMessages.length === 0) {
      return "A warm conversation about your memories.";
    }

    const fullText = allMessages.join(" ");
    const maxLength = 260;
    return fullText.length > maxLength ? `${fullText.slice(0, maxLength)}...` : fullText;
  };

  const handleSaveMemory = async () => {
    if (isSaving) return;
    
    // Check if there's any conversation content before saving
    const hasContent = conversationHistory.length > 0 || (transcript && transcript.trim().length > 0);
    if (!hasContent) {
      // Redirect to memory garden without saving
      if (typeof window !== "undefined") {
        window.location.href = "/memory-garden";
      }
      return;
    }
    
    setIsSaving(true);

    try {
      const summary = createConversationSummary();

      const now = new Date();
      const chatHistory: MemoryMessage[] = [
        ...conversationHistory.map((msg, index) => ({
          id: index,
          type: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: msg.content,
          timestamp: now,
        })),
        ...(transcript.trim()
          ? [
              {
                id: conversationHistory.length,
                type: "user" as const,
                content: transcript.trim(),
                timestamp: now,
              },
            ]
          : []),
      ];

      let baseMemory: SavedMemory | null = null;
      if (stackId) {
        try {
          baseMemory = memoryStorage.getMemory(stackId);
        } catch (e) {
          console.error("Failed to load base memory for stack:", e);
        }
      }

      // Check if base memory already has images
      const existingImageFiles = (baseMemory?.mediaFiles || []).filter((file) =>
        file.type.startsWith("image")
      );
      
      let existingImages: Array<{ name: string; type: string; size: number; data: string }> = [];
      
      // Load existing images from localStorage if base memory has image files
      if (existingImageFiles.length > 0 && stackId && typeof window !== "undefined") {
        try {
          const baseImageStorageKey = `memory_images_${stackId}`;
          const storedImages = localStorage.getItem(baseImageStorageKey);
          if (storedImages) {
            const parsedImages = JSON.parse(storedImages);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              existingImages = parsedImages
                .filter((img: any) => img && img.data)
                .map((img: { data: string; name?: string }) => {
                  const base64Data = img.data.includes(",")
                    ? img.data.split(",")[1]
                    : img.data;
                  return {
                    name: img.name || `existing-image-${Date.now()}.png`,
                    type: "image/png",
                    size: Math.floor((base64Data.length * 3) / 4),
                    data: base64Data,
                  };
                });
            }
          }
        } catch (e) {
          console.error("Error loading existing images:", e);
        }
      }

      // Check if there's any conversation content
      const hasConversation = conversationHistory.length > 0 || (transcript && transcript.trim().length > 0);
      console.log(`Saving memory: hasConversation=${hasConversation}, conversationHistory.length=${conversationHistory.length}, transcript="${transcript}"`);
      
      // Only generate new images if we don't have existing images AND there's conversation content
      const generatedImages: Array<{ name: string; type: string; size: number; data: string }> = [];
      
      if (existingImages.length === 0 && hasConversation) {
        try {
          // Create prompts for image generation based on the conversation
          const conversationText = [
            ...conversationHistory.map((m) => m.content),
            transcript.trim() ? transcript.trim() : "",
          ]
            .filter(Boolean)
            .join(" ")
            .slice(0, 500); // Limit prompt length

          const imagePrompts = [
            conversationText || summary || "A warm memory moment",
            summary || conversationText || "A nostalgic memory scene",
          ];

          // Generate 2 images
          for (let i = 0; i < 2; i++) {
            try {
              const response = await fetch("/api/generate-image-hybrid", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  prompt: imagePrompts[i],
                  memoryTitle: baseMemory?.title || "New Memory",
                  memoryDescription: summary,
                  category: baseMemory?.categories?.[0] || baseMemory?.customCategory || "",
                  emotion: baseMemory?.customEmotion || "",
                  style: "realistic",
                  type: "memory_visualization",
                }),
              });

              if (response.ok) {
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
                      type: "image/png",
                      size: Math.floor((base64Data.length * 3) / 4), // Approximate size
                      data: base64Data,
                    });
                    console.log(`Successfully generated image ${i + 1} (${Math.floor(base64Data.length / 1024)}KB)`);
                  } else {
                    console.warn(`Image ${i + 1} has empty data`);
                  }
                } else {
                  console.warn(`Image ${i + 1} generation failed:`, result.error || 'Unknown error');
                }
              } else {
                const errorText = await response.text();
                console.error(`Image ${i + 1} generation API error (${response.status}):`, errorText);
              }
            } catch (imageError) {
              console.error(`Error generating image ${i + 1}:`, imageError);
            }
          }
        } catch (imageGenError) {
          console.error("Error in image generation process:", imageGenError);
        }
        
        console.log(`Image generation complete: ${generatedImages.length} images generated`);
      }

      // Use existing images if available, otherwise use generated images
      const imagesToUse = existingImages.length > 0 ? existingImages : generatedImages;
      console.log(`Images to use: ${imagesToUse.length} (existing: ${existingImages.length}, generated: ${generatedImages.length})`);
      
      // Combine base memory media files with images (only add generated images if we didn't have existing ones)
      const allMediaFiles = existingImages.length > 0
        ? baseMemory?.mediaFiles || [] // Keep original media files if we have existing images
        : [
            ...(baseMemory?.mediaFiles || []),
            ...generatedImages.map((img) => ({
              name: img.name,
              type: img.type,
              size: img.size,
            })),
          ];

      const memoryData = {
        title: baseMemory?.title || "New Memory",
        description: summary,
        startDate: baseMemory?.startDate || "",
        startTime: baseMemory?.startTime || "",
        endDate: baseMemory?.endDate || "",
        endTime: baseMemory?.endTime || "",
        vagueTime: baseMemory?.vagueTime || "",
        categories: baseMemory?.categories || [],
        customCategory: baseMemory?.customCategory || "",
        customEmotion: baseMemory?.customEmotion || "",
        tags: baseMemory?.tags || "",
        mediaFiles: allMediaFiles,
        mode: baseMemory?.mode || "simple",
        timestamp: new Date().toISOString(),
      };

      // Save memory to get the ID
      const memoryId = memoryStorage.saveMemory(memoryData, chatHistory, "");

      // Store image data in localStorage with memory ID (use existing images if available, otherwise generated)
      if (typeof window !== "undefined") {
        const imageStorageKey = `memory_images_${memoryId}`;
        
        if (imagesToUse.length > 0) {
          const imagesToStore = imagesToUse.map((img) => ({
            name: img.name,
            data: img.data,
          }));
          localStorage.setItem(
            imageStorageKey,
            JSON.stringify(imagesToStore)
          );
          console.log(`Saved ${imagesToStore.length} images for memory ${memoryId}`);
        } else {
          console.warn(`No images to save for memory ${memoryId}. Existing: ${existingImages.length}, Generated: ${generatedImages.length}, Has conversation: ${hasConversation}`);
        }
      }

      if (typeof window !== "undefined") {
        window.location.href = "/memory-garden";
      }
    } catch (error) {
      console.error("Error saving memory from conversation:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/memory-garden";
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <Navigation fullWidth={true} primaryAction={{ text: "Back to Home", href: "/", variant: "secondary" }} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden pt-16">
        <div className="h-full w-full px-8 py-8">
          <div className="h-full w-full">
            <div className="grid lg:grid-cols-2 gap-12 h-full w-full">
              {/* Left Column - Voice Input */}
              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {getPageTitle()}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Speak freely about your memories. AI will listen and help you explore them.
                  </p>
                </div>

                {/* Selected Memory Stack Info */}
                {(selectedMemoryStack || type === "new") && (
                  <div className="mb-6 rounded-2xl p-6 border-2 border-gray-300 bg-gray-50 transition-all duration-300">
                    {type === "new" ? (
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                            ✨
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">New Memory</h3>
                            <p className="text-sm text-gray-600">Creating a fresh memory</p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Share a memory that wasn't captured in your uploaded media. Tell us about a moment you'd like to preserve.
                        </p>
                      </div>
                    ) : selectedMemoryStack ? (
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                            {(() => {
                              const category = selectedMemoryStack.categories?.[0] || selectedMemoryStack.customCategory || "";
                              if (category === "family") return "👨‍👩‍👧‍👦";
                              if (category === "friends") return "👥";
                              if (category === "travel" || category === "nature") return "✈️";
                              if (category === "achievement" || category === "work") return "🏆";
                              if (category === "love") return "💕";
                              return "🖼️";
                            })()}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{selectedMemoryStack.title || "Untitled Memory"}</h3>
                            <p className="text-sm text-gray-600">
                              {selectedMemoryStack.vagueTime || 
                               selectedMemoryStack.startDate || 
                               (selectedMemoryStack.timestamp ? new Date(selectedMemoryStack.timestamp).toLocaleDateString() : "No date")}
                              {selectedMemoryStack.mediaFiles?.length ? ` • ${selectedMemoryStack.mediaFiles.length} media` : ""}
                            </p>
                          </div>
                        </div>
                        {selectedMemoryStack.description && (
                          <p className="text-gray-700 text-sm leading-relaxed mt-2">
                            {selectedMemoryStack.description}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Voice Input Area */}
                <div className="flex-1 flex flex-col">
                  {/* Voice Hints */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 mb-6 border border-emerald-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      💡 You can say things like:
                    </h3>
                    <div className="space-y-2">
                      {voiceHints.map((hint, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-emerald-600 mr-3">•</span>
                          <p className="text-gray-700 text-base">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voice Control Button */}
                  <div className="flex-1 flex items-center justify-center">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isListening
                          ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                          : "bg-gradient-to-b from-emerald-500 to-green-600 text-white hover:scale-105"
                      }`}
                    >
                      {isListening ? "⏹️" : "🎤"}
                    </button>
                  </div>

                  {/* Status */}
                  <div className="text-center mt-6">
                    <p className="text-lg font-semibold text-gray-700">
                      {isListening ? (
                        <span className="text-red-600">● Listening... Speak now</span>
                      ) : (
                        <span className="text-gray-500">Click the microphone to start</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Transcription */}
              <div className="flex flex-col h-full min-h-0">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Your Conversation
                    </h2>
                    <p className="text-gray-600">
                      See what you've said and continue the conversation
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMockConversation}
                    disabled={isMockLoading}
                    className="inline-flex items-center justify-center px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isMockLoading ? "Creating mock conversation..." : "▶ Mock Conversation"}
                  </button>
                </div>

                {/* Transcription Display */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden mb-6 flex flex-col">
                  {/* Chat Header */}
                  <div className="bg-white p-6 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-base">🌱</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">Sprout</h3>
                        <p className="text-xs text-emerald-500 font-medium">Your nurturing companion</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white min-h-0">
                    {conversationHistory.length === 0 && !transcript ? (
                      <div className="h-full flex flex-col justify-center">
                        <p className="text-gray-400 text-center mb-6">
                          Your conversation will appear here.<br />
                          Start speaking or use the mock conversation to see an example.
                        </p>
                        <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300">
                          <div className="flex items-center mb-2">
                            <span className="text-gray-400 font-semibold mr-2">Example:</span>
                            <span className="text-xs text-gray-400">
                              Preview
                            </span>
                          </div>
                          <p className="text-gray-500 leading-relaxed italic">
                            {type === "new" 
                              ? "This is a memory about a special moment that happened last year. We were all together celebrating..."
                              : type === "random"
                              ? "I remember this day so clearly. It was one of those perfect moments where everything just felt right..."
                              : "This memory brings back such warm feelings. I can still remember the sounds, the smells, and the joy we all felt..."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversationHistory.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs px-4 py-3 rounded-2xl ${
                                message.role === "user"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-emerald-50 text-gray-800"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                          </div>
                        ))}
                        {transcript && (
                          <div className="flex justify-end">
                            <div className="max-w-xs px-4 py-3 rounded-2xl bg-emerald-600 text-white">
                              <p className="text-sm leading-relaxed italic">{transcript}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Loading indicator for AI response */}
                    {isProcessingText && (
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
                  <div className="p-6 flex-shrink-0">
                    <form onSubmit={handleTextInput} className="flex space-x-3">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500 bg-white"
                        disabled={isProcessingText || isListening}
                      />
                      <button
                        type="submit"
                        disabled={!textInput.trim() || isProcessingText || isListening}
                        className="bg-gradient-to-b from-emerald-500 to-green-600 text-white w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Action Buttons - Pushed to bottom */}
                <div className="mt-auto flex gap-5">
                  <Link
                    href="/memory-stacks"
                    className="flex-1 text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    Back
                  </Link>
                  <button
                    type="button"
                    onClick={handleSaveMemory}
                    disabled={isSaving}
                    className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSaving ? "Saving & Generating Images..." : "Save Memory"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MemoryConversation() {
  return (
    <Suspense fallback={null}>
      <MemoryConversationInner />
    </Suspense>
  );
}
