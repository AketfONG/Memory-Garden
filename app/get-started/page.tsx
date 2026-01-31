"use client";
import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { stackStorage } from "../utils/stackStorage";
import { useLanguage } from "../contexts/LanguageContext";

export default function GetStarted() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [momentDate, setMomentDate] = useState("");
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizeError, setOrganizeError] = useState<string | null>(null);

  const formatTitleCase = (value: string) => {
    return value
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim().length > 0)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const hasFiles = allFiles.length > 0;
    const hasDateInput = momentDate.trim().length > 0;

    // If absolutely no input, skip AI and go straight to next page
    if (!hasFiles && !hasDateInput && !memoryTitle.trim()) {
      window.location.href = "/memory-stacks";
      return;
    }

    setIsOrganizing(true);
    try {
      let imageAnalysis = "";
      // Clean up user-provided title: normalize spacing and limit length
      let userTitle = memoryTitle.trim();
      if (userTitle) {
        userTitle = userTitle.replace(/\s+/g, ' ').trim();
        const words = userTitle.split(/\s+/).filter(Boolean);
        if (words.length > 8) {
          userTitle = words.slice(0, 8).join(' ');
        }
      }
      let aiTitle = userTitle ? formatTitleCase(userTitle) : "";
      let aiSummary = "";
      let aiEmoji = "";
      let accurateDate = ""; // Will be in dd/mm/yyyy format

      // Step 1: Analyze images if any are uploaded
      if (imageFiles.length > 0) {
        try {
          // Analyze the first image (or combine analysis from multiple images)
          const firstImage = imageFiles[0];
          const formData = new FormData();
          formData.append('file', firstImage);
          if (momentDate) {
            formData.append('memoryContext', `User mentioned: ${momentDate}`);
          }

          const analysisResponse = await fetch("/api/analyze-media", {
            method: "POST",
            body: formData,
          });

          if (analysisResponse.ok) {
            const analysisResult = await analysisResponse.json();
            console.log("Image analysis result:", analysisResult);
            if (analysisResult.success && analysisResult.analysis) {
              imageAnalysis = analysisResult.analysis;
              console.log("Image analysis extracted:", imageAnalysis.substring(0, 100));
            } else {
              console.error("Image analysis failed:", analysisResult.error || analysisResult.details);
              setOrganizeError(`Image analysis failed: ${analysisResult.error || analysisResult.details || 'Unknown error'}`);
            }
          } else {
            const errorText = await analysisResponse.text().catch(() => '');
            console.error("Image analysis HTTP error:", analysisResponse.status, errorText);
            setOrganizeError(`Image analysis failed: ${analysisResponse.status} ${errorText}`);
          }
        } catch (imageError) {
          console.error("Error analyzing images:", imageError);
          setOrganizeError(`Image analysis error: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
        }
      }

      // Step 2: Convert date input to accurate dd/mm/yyyy format using AI and system time
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const systemTimeInfo = `Current system date: ${currentDay}/${currentMonth}/${currentYear}`;

      if (hasDateInput) {
        try {
          const datePrompt = `
You are a date conversion assistant. Convert the user's date input into an accurate date in dd/mm/yyyy format.

User's input: "${momentDate}"
${systemTimeInfo}

Rules:
- If the input is vague (e.g., "last summer", "a year ago"), use the system date to calculate the most likely date
- If the input is specific (e.g., "March 15th", "15/03/2024"), use that date
- Always return ONLY a JSON object with this exact format: {"date": "dd/mm/yyyy"}
- If you cannot determine a date, return {"date": ""}

Examples:
- "last summer" with current date 15/01/2025 → {"date": "15/07/2024"}
- "March 15th" → {"date": "15/03/${currentYear}"}
- "a year ago" with current date 15/01/2025 → {"date": "15/01/2024"}
- "yesterday" with current date 15/01/2025 → {"date": "14/01/2025"}

Return ONLY the JSON object, nothing else.`;

          const dateResponse = await fetch("/api/google-ai-chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: datePrompt,
              conversationHistory: [],
            }),
          });

          if (dateResponse.ok && dateResponse.body) {
            const reader = dateResponse.body.getReader();
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
                      const parsedDate = JSON.parse(jsonCandidate);
                      if (parsedDate.date) {
                        accurateDate = String(parsedDate.date).trim();
                      }
                    } catch {
                      // Try regex fallback
                      const dateMatch = content.match(/"date"\s*:\s*"([^"]+)"/);
                      if (dateMatch && dateMatch[1]) {
                        accurateDate = dateMatch[1].trim();
                      }
                    }
                  }
                } catch {
                  // ignore malformed lines
                }
              }
            }
          }
        } catch (dateError) {
          console.error("Error converting date:", dateError);
        }
      }

      // Step 3: Use BLIP analysis + user inputs to refine title/summary/emoji via GPT-4o-mini
      const imageNames = imageFiles.map((f) => f.name).join(", ") || "none";
      const videoNames = videoFiles.map((f) => f.name).join(", ") || "none";
      const audioNames = audioFiles.map((f) => f.name).join(", ") || "none";

      const languageInstruction =
        language === "en"
          ? "Write the title and summary in natural, warm English."
          : "請以自然、溫暖嘅廣東話（繁體中文），用貼近香港人語氣去寫標題同摘要。";

      const prompt = `
You are helping organize a stack of personal memories based on media files.

Image understanding from BLIP (Salesforce BLIP captioning model):
${imageAnalysis || "No image description available."}

User inputs:
- User-provided title (may be empty): ${memoryTitle || "(none provided)"}
- When the moment happened (raw): ${momentDate || "unknown"}
- Converted date (dd/mm/yyyy, may be empty): ${accurateDate || "(not available)"}
- Images: ${imageNames}
- Videos: ${videoNames}
- Audio: ${audioNames}

Your job:
- If the user already provided a clear title, keep it and only adjust slightly if grammar/capitalization needs it.
- If the user did NOT provide a title (or the current title is just "New Memory Stack"), create a warm, specific title (3–8 words) based on the BLIP image description and other details.
- Always create a refined, user-friendly description (1–3 sentences) that would look great as a memory stack summary.
- Choose exactly ONE emoji that best represents this memory, grounded in the scene/people/activity/emotion (for example 🎂 for birthday, 🌅 for sunrise, 🏖️ for beach, 🧁 for desserts, 👨‍👩‍👧‍👦 for family). Avoid generic smiley faces if a more specific emoji fits.

Language:
- ${languageInstruction}

Return ONLY a compact JSON object with this exact shape:
{
  "title": "<final stack title>",
  "summary": "<refined description for the memory stack>",
  "emoji": "<single emoji character, no words>"
}
Do NOT include any extra keys or text outside the JSON.
`;

      const response = await fetch("/api/stack-summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[get-started] /api/stack-summarize result:", data);
        if (data.success) {
          // Only override title if the user did NOT provide one
          if (!memoryTitle.trim() && data.title) {
            // Clean up the title: normalize spacing and limit length
            let cleanedTitle = String(data.title)
              .replace(/\s+/g, " ") // Collapse multiple spaces
              .trim();
            // If the title is mostly Chinese/CJK, remove spaces between CJK characters
            if (/[\u3400-\u9FFF]/.test(cleanedTitle)) {
              const cjkGap = /([\u3400-\u9FFF])\s+([\u3400-\u9FFF])/g;
              while (cjkGap.test(cleanedTitle)) {
                cleanedTitle = cleanedTitle.replace(cjkGap, "$1$2");
              }
            }
            // Limit to 8 words max to prevent concatenated titles
            const words = cleanedTitle.split(/\s+/).filter(Boolean);
            if (words.length > 8) {
              cleanedTitle = words.slice(0, 8).join(' ');
            }
            aiTitle = cleanedTitle;
          }
          if (data.summary) {
            let cleanedSummary = String(data.summary).replace(/\s+/g, " ").trim();
            // Fix spacing inside Chinese/CJK, e.g. "藝 廊 開 幕" -> "藝廊開幕"
            if (/[\u3400-\u9FFF]/.test(cleanedSummary)) {
              const cjkGap = /([\u3400-\u9FFF])\s+([\u3400-\u9FFF])/g;
              while (cjkGap.test(cleanedSummary)) {
                cleanedSummary = cleanedSummary.replace(cjkGap, "$1$2");
              }
            }
            aiSummary = cleanedSummary;
          } else if (imageAnalysis) {
            // Fallback: use BLIP analysis if GPT didn't return a summary
            aiSummary = imageAnalysis;
          }
          if (data.emoji) {
            aiEmoji = String(data.emoji).trim();
          }
        } else {
          console.error("[get-started] Stack summarize API error:", data.error || data.details);
          // Fallback to BLIP description only
          aiSummary = imageAnalysis || "";
        }
      } else {
        const errorText = await response.text().catch(() => "");
        console.error("[get-started] Stack summarize HTTP error:", response.status, errorText);
        // Fallback to BLIP description only
        aiSummary = imageAnalysis || "";
      }

      console.log("[get-started] Final values - aiTitle:", aiTitle, "aiSummary length:", aiSummary.length, "aiEmoji:", aiEmoji);
      
      if (!aiTitle) {
        aiTitle = "New Memory Stack";
        console.log("[get-started] Using fallback title: New Memory Stack");
      } else {
        // Clean up title before formatting: ensure no extra spaces
        aiTitle = aiTitle.replace(/\s+/g, ' ').trim();
        // Limit to 8 words max
        const words = aiTitle.split(/\s+/).filter(Boolean);
        if (words.length > 8) {
          aiTitle = words.slice(0, 8).join(' ');
        }
        aiTitle = formatTitleCase(aiTitle);
      }

      // Convert accurateDate (dd/mm/yyyy) to startDate (yyyy-mm-dd) format for storage
      let startDate = "";
      if (accurateDate) {
        const dateParts = accurateDate.split("/");
        if (dateParts.length === 3) {
          const [day, month, year] = dateParts;
          startDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }

      const memorySummary = {
        title: aiTitle,
        description: aiSummary,
        emoji: aiEmoji,
        startDate: startDate,
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
        // Save as a memory stack
        const stackId = stackStorage.saveStack(memorySummary);
        
        // Store uploaded images in localStorage with stack ID
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
              const imageStorageKey = `stack_images_${stackId}`;
              try {
                localStorage.setItem(imageStorageKey, JSON.stringify(imagesToStore));
              } catch (storageError: any) {
                // Handle QuotaExceededError gracefully
                if (storageError?.name === 'QuotaExceededError' || storageError?.message?.includes('quota')) {
                  console.warn('localStorage quota exceeded, skipping image storage. Stack will still be saved.');
                } else {
                  console.error("Error storing uploaded images:", storageError);
                }
              }
            }
          } catch (imageError) {
            console.error("Error storing uploaded images:", imageError);
          }
        }
      } catch (error) {
        console.error("Failed to save organized stack:", error);
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

  if (!mounted) {
    return (
      <div className="min-h-screen lg:h-screen bg-white flex flex-col overflow-y-auto lg:overflow-hidden">
        <Navigation fullWidth={true} primaryAction={{ text: "Back to Home", href: "/", variant: "secondary" }} />
        <main className="flex-1 pt-16 lg:overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-white flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Header */}
      <Navigation
        fullWidth={true}
        primaryAction={{
          text: language === "en" ? "Back to Home" : "返回首頁",
          href: "/",
          variant: "secondary",
        }}
      />

      {/* Main Content */}
      <main className="flex-1 pt-16 min-h-0 lg:overflow-y-auto" data-nav-scroll-root>
        <div className="w-full px-8 py-8">
          <div className="w-full">
            <div className="grid lg:grid-cols-2 gap-12 w-full">
              {/* Left Column - Upload Area */}
              <div className="flex flex-col">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {language === "en" ? "Import Your Memories" : "匯入你嘅回憶"}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {language === "en"
                      ? "Import photos, videos, and audios so that AI can organize for you according to context and timeline."
                      : "匯入相片、影片同錄音，等 AI 按照情境同時間線幫你整理。"}
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 flex-1 flex items-center justify-center ${
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
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      {language === "en"
                        ? "Drop your pictures here or click to browse"
                        : "拖放相片到呢度，或者按此揀相"}
                    </h2>
                    <label className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer">
                      {language === "en" ? "Choose Files" : "揀選檔案"}
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
                <div className="mt-6 hidden lg:grid lg:grid-cols-3 gap-5">
                  <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-200 text-center">
                    <div className="text-5xl mb-4">🖼️</div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-base">
                      {language === "en" ? "Photos" : "相片"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === "en" ? "By people & places" : "以人物、地點分類"}
                    </p>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-200 text-center">
                    <div className="text-5xl mb-4">🎥</div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-base">
                      {language === "en" ? "Videos" : "影片"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === "en" ? "Moments in motion" : "動起嚟嘅珍貴片段"}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-2">
                      {language === "en" ? "Coming Soon" : "即將推出"}
                    </p>
                  </div>
                  <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-200 text-center">
                    <div className="text-5xl mb-4">🎤</div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-base">
                      {language === "en" ? "Audio" : "聲音"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === "en" ? "Voice recordings" : "聲音錄音"}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-2">
                      {language === "en" ? "Coming Soon" : "即將推出"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Information */}
              <div className="flex flex-col">
                {/* How It Works */}
                <div className="hidden lg:block bg-gradient-to-br from-emerald-50 to-green-50 rounded-[2rem] p-8 mb-10 border-2 border-emerald-100">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8">
                    {language === "en" ? "How AI Organizes Your Memories" : "AI 點樣幫你整理回憶"}
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-5 flex-shrink-0 shadow-lg">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {language === "en" ? "Context Analysis" : "理解相背後嘅情境"}
                        </h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {language === "en"
                            ? "AI analyzes the content of your photos to understand the context, people, places, and events. Video and audio summarization coming soon."
                            : "AI 會分析你嘅相片內容，理解入面嘅人物、地方同事情背景。影片同聲音摘要功能將會陸續加入。"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-5 flex-shrink-0 shadow-lg">2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {language === "en" ? "Timeline Organization" : "按照時間線自動排好"}
                        </h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {language === "en"
                            ? "Files are automatically organized chronologically based on metadata, content analysis, and context clues."
                            : "系統會根據檔案資料、內容分析同上下文線索，自動按時間順序幫你排好檔案。"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-5 flex-shrink-0 shadow-lg">3</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                          {language === "en" ? "Story Creation" : "將片段連結成故事"}
                        </h4>
                        <p className="text-gray-600 text-base leading-relaxed">
                          {language === "en"
                            ? "Related memories are grouped together to create coherent stories and memory cards that you can revisit and share."
                            : "會將相關嘅回憶串連起嚟，變成有脈絡嘅故事同記憶卡，方便你之後重溫同分享。"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Give it a title */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === "en" ? "Give it a title" : "幫呢段回憶改個標題"}
                  </label>
                  <input
                    type="text"
                    value={memoryTitle}
                    onChange={(e) => setMemoryTitle(e.target.value)}
                    placeholder={
                      language === "en"
                        ? "e.g., Grandma's Birthday, First Day of School..."
                        : "例：嫲嫲生日、第一日返中學⋯⋯"
                    }
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                  />
                </div>

                {/* When did the moment happen */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === "en" ? "When did the moment happen?" : "呢個時刻大約係幾時發生？"}
                  </label>
                  <input
                    type="text"
                    value={momentDate}
                    onChange={(e) => setMomentDate(e.target.value)}
                    placeholder={
                      language === "en"
                        ? "e.g., Summer 2024, Last year, March 15th..."
                        : "例：2024年夏天、上年、3月15號⋯⋯"
                    }
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                  />
                </div>

                {/* Uploaded Files Preview */}
                <div className="flex flex-col mb-10">
                  <p className="text-sm text-gray-600 mb-2">
                    {language === "en"
                      ? "Uploaded files will appear here"
                      : "已匯入嘅檔案會顯示喺呢度"}
                  </p>
                  <div className="bg-gray-50 rounded-[2rem] p-4 border-2 border-gray-200 min-h-[120px]">
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
                        <p className="text-gray-500 text-sm text-center">
                          {language === "en" ? "No files uploaded yet" : "仲未有匯入任何檔案"}
                        </p>
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
                    {language === "en" ? "Back to Home" : "返回首頁"}
                  </Link>
                  <button
                    type="button"
                    onClick={handleStartOrganizing}
                    disabled={isOrganizing}
                    className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isOrganizing
                      ? language === "en"
                        ? "Organizing..."
                        : "整理緊⋯⋯"
                      : language === "en"
                      ? "Start Organizing"
                      : "開始整理回憶"}
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
          <div className="bg-white rounded-[2rem] w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
