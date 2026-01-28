"use client";

import React, { useState, useEffect, useRef } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { stackStorage, type MemoryStack as StackData } from "../utils/stackStorage";
import { PRESET_STACKS } from "../utils/presetStacks";
import { useLanguage } from "../contexts/LanguageContext";

interface MemoryStack {
  id: string;
  title: string;
  count: number;
  date: string;
  preview: string;
  summary?: string;
}

function formatDateDDMMYYYY(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

export default function MemoryStacks() {
  const { language } = useLanguage();
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [memoryStacks, setMemoryStacks] = useState<MemoryStack[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showDemoStacks, setShowDemoStacks] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    setMounted(true);
  }, []);

  // Initialize preset stacks once on mount
  useEffect(() => {
    if (!mounted || initializedRef.current) return;
    initializedRef.current = true;
    
    try {
      // Initialize preset stacks if no stacks exist
      stackStorage.initializePresets(PRESET_STACKS);
    } catch (error) {
      console.error("Failed to initialize preset stacks:", error);
    }
  }, [mounted]);

  // Load and filter stacks whenever showDemoStacks changes
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const stacks: StackData[] = stackStorage.getAllStacks();
      const presetTitles = new Set(PRESET_STACKS.map((s) => s.title));

      // Cantonese labels for demo stacks
      const demoLocale: Record<
        string,
        { titleZh: string; descriptionZh: string }
      > = {
        "Summer Beach Day": {
          titleZh: "夏日沙灘一日遊",
          descriptionZh:
            "同朋友喺沙灘度過完美一日，砌沙堡、曬太陽，充滿笑聲同陽光味道。",
        },
        "Family Birthday Celebration": {
          titleZh: "一家人嘅生日慶祝",
          descriptionZh:
            "全家人齊齊為嫲嫲／婆婆慶祝 80 大壽，屋企充滿笑聲同祝福。",
        },
        "Mountain Hiking Adventure": {
          titleZh: "山頂遠足小冒險",
          descriptionZh:
            "挑戰行上山頂，沿途風景壯麗，到達時有種完成咗一件大事嘅滿足感。",
        },
        "Anniversary Dinner": {
          titleZh: "紀念日浪漫晚餐",
          descriptionZh:
            "去到最鍾意嘅餐廳食一餐靚飯，一齊慶祝又走過一個年頭嘅陪伴同愛。",
        },
        "Work Project Launch": {
          titleZh: "工作項目正式起動",
          descriptionZh:
            "同成個團隊一齊成功推出年度最大型嘅項目，感受到團隊合作同成就感。",
        },
        "Weekend Road Trip": {
          titleZh: "週末公路小旅行",
          descriptionZh:
            "臨時決定去附近小鎮行下，發現咗唔少小店同咖啡店，充滿驚喜同自由感。",
        },
        "Art Gallery Opening": {
          titleZh: "藝術展開幕之夜",
          descriptionZh:
            "參加本地藝術家畫展開幕，被一幅幅畫同創作能量包圍，感受到靈感同藝術氣氛。",
        },
      };

      // When showDemoStacks is true, show ALL stacks (both presets and user-generated)
      // When showDemoStacks is false, show ONLY user-generated stacks (filter out presets)
      const filteredStacks = showDemoStacks
        ? stacks // Show all when demo is enabled
        : stacks.filter((stack) => !presetTitles.has(stack.title)); // Filter out presets when demo is disabled

      const displayStacks: MemoryStack[] = filteredStacks.map((stack) => {
        // Prefer AI-chosen emoji if present, otherwise derive from category as a fallback
        const category = stack.categories?.[0] || stack.customCategory || "";
        let preview = stack.emoji || "🖼️";
        if (!stack.emoji) {
          if (category === "family") preview = "👨‍👩‍👧‍👦";
          else if (category === "friends") preview = "👥";
          else if (category === "travel" || category === "nature") preview = "✈️";
          else if (category === "achievement" || category === "work") preview = "🏆";
          else if (category === "love") preview = "💕";
        }

        const mediaCount = stack.mediaFiles?.length || 0;

        let dateLabel = "";
        if (stack.startDate) {
          dateLabel = formatDateDDMMYYYY(stack.startDate);
        } else if (stack.vagueTime) {
          dateLabel = stack.vagueTime;
        } else if (stack.timestamp) {
          dateLabel = formatDateDDMMYYYY(new Date(stack.timestamp).toISOString());
        }

        const zh = demoLocale[stack.title];

        return {
          id: stack.id,
          title:
            language === "en" || !zh ? stack.title || "Untitled Stack" : zh.titleZh,
          count: mediaCount,
          date: dateLabel || (language === "en" ? "No date set" : "未設定日期"),
          preview,
          summary:
            language === "en" || !zh
              ? stack.description || ""
              : zh.descriptionZh,
        };
      });

      setMemoryStacks(displayStacks);
    } catch (error) {
      console.error("Failed to load stacks:", error);
      setMemoryStacks([]);
    }
  }, [mounted, showDemoStacks]);

  const handleStackSelect = (stackId: string) => {
    setSelectedStack((prev) => (prev === stackId ? null : stackId));
  };

  const handleStartConversation = () => {
    if (selectedStack) {
      window.location.href = `/memory-conversation?type=stack&stack=${selectedStack}`;
    }
  };

  const handleRandomPick = () => {
    if (!memoryStacks.length) return;
    const randomStack = memoryStacks[Math.floor(Math.random() * memoryStacks.length)];
    window.location.href = `/memory-conversation?type=random&stack=${randomStack.id}`;
  };

  const handleNewMemory = () => {
    window.location.href = `/memory-conversation?type=new`;
  };

  const handleDeleteStack = (stackId: string) => {
    const confirmed = window.confirm(
      language === "en"
        ? "Are you sure you want to remove this memory stack?"
        : "你確定要移除呢疊記憶堆疊？"
    );
    if (!confirmed) return;

    try {
      stackStorage.deleteStack(stackId);
    } catch (error) {
      console.error("Failed to delete stack from storage:", error);
    }

    setMemoryStacks((prev) => prev.filter((stack) => stack.id !== stackId));
    setSelectedStack((prev) => (prev === stackId ? null : prev));
  };

  if (!mounted) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <Navigation
          fullWidth={true}
          primaryAction={{
            text: language === "en" ? "Back to Home" : "返回首頁",
            href: "/",
            variant: "secondary",
          }}
        />
        <main className="flex-1 overflow-hidden pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const hasStacksForSelection = memoryStacks.length > 0;
  const isRandomDisabled = !!selectedStack || !hasStacksForSelection;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
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
      <main className="flex-1 overflow-hidden pt-16">
        <div className="h-full w-full px-8 py-8">
          <div className="h-full w-full min-h-0">
            <div className="grid lg:grid-cols-2 gap-12 h-full w-full min-h-0">
              {/* Left Column - Memory Stacks */}
              <div className="flex flex-col h-full min-h-0">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {language === "en" ? "Your Memory Stacks" : "你嘅記憶堆疊"}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed mb-4">
                    {language === "en"
                      ? "Your imported memories are organised into stacks using their photos and dates."
                      : "你匯入嘅回憶會根據相片同日期，自動整理成一疊一疊嘅記憶。"}
                  </p>

                  {/* Demo stacks toggle (light green button like Mock Conversation) */}
                  <button
                    type="button"
                    onClick={() => setShowDemoStacks((prev) => !prev)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out"
                  >
                    {showDemoStacks
                      ? language === "en"
                        ? "▶ Hide Demo Stacks"
                        : "▶ 收起示範堆疊"
                      : language === "en"
                      ? "▶ Show Demo Stacks"
                      : "▶ 顯示示範堆疊"}
                  </button>
                </div>

                {/* Memory Stacks Grid (scrollable) */}
                <div className="flex-1 overflow-y-auto pr-2">
                  {memoryStacks.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm text-center px-4">
                        {language === "en"
                          ? "No memory stacks yet. Import memories or plant a memory to see them here."
                          : "暫時仲未有任何記憶堆疊。試下匯入相片，或者種植一段新回憶，喺度就會見到。"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {memoryStacks.map((stack) => (
                        <div
                          key={stack.id}
                          onClick={() => handleStackSelect(stack.id)}
                          className={`rounded-[2rem] p-6 border-2 cursor-pointer transition-all duration-300 flex flex-col relative ${
                            selectedStack === stack.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-4xl">{stack.preview}</div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                {stack.count}{" "}
                                {language === "en"
                                  ? stack.count === 1
                                    ? "item"
                                    : "items"
                                  : "個媒體"}
                              </div>
                              <div className="text-xs text-gray-400">{stack.date}</div>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{stack.title}</h3>
                          <div className="mt-2 h-[3rem]">
                            {stack.summary ? (
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                {stack.summary}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                                &nbsp;
                              </p>
                            )}
                          </div>

                          {/* Delete button under description */}
                          <div className="flex justify-end mt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!stack.id.startsWith("preset_")) {
                                  handleDeleteStack(stack.id);
                                }
                              }}
                              disabled={stack.id.startsWith("preset_")}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                stack.id.startsWith("preset_")
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                  : "bg-red-500 hover:bg-red-600 text-white hover:scale-110 hover:shadow-xl"
                              }`}
                              title={
                                stack.id.startsWith("preset_")
                                  ? "Demo stacks cannot be deleted"
                                  : "Delete memory stack"
                              }
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Actions */}
              <div className="flex flex-col min-h-[420px] lg:h-full lg:min-h-0">
                {/* Choose Stack Option */}
                <div
                  className={`relative rounded-[2rem] p-6 lg:p-10 mb-6 border-2 transition-all duration-300 ${
                    selectedStack
                      ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-2xl font-bold ${
                        selectedStack ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {language === "en" ? "Choose a Stack" : "揀一疊記憶堆疊"}
                    </h3>
                  </div>
                  {/* Mobile: floating circular play icon in top-right corner */}
                  <button
                    type="button"
                    onClick={selectedStack ? handleStartConversation : undefined}
                    disabled={!selectedStack}
                    className={`lg:hidden absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-300 ${
                      selectedStack
                        ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white hover:shadow-xl hover:scale-105"
                        : "bg-gray-300 text-gray-500 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    ▶
                  </button>
                  <p
                    className={`hidden lg:block text-base leading-relaxed mb-6 ${
                      selectedStack ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {language === "en"
                      ? "Select a memory stack from the left, and AI will ask you questions about it to help you explore and expand those memories."
                      : "喺左邊揀一疊記憶堆疊，AI 會就住入面嘅內容問你問題，陪你慢慢整理同延伸呢啲回憶。"}
                  </p>
                  {selectedStack ? (
                    <>
                      {/* Desktop: full-width CTA */}
                      <button
                        onClick={handleStartConversation}
                        className="hidden lg:block w-full bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        {language === "en"
                          ? "Start Conversation About This Stack"
                          : "就呢疊堆疊開始傾下"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        disabled
                        className="hidden lg:block w-full bg-gray-300 text-gray-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                      >
                        {language === "en"
                          ? "Start Conversation About This Stack"
                          : "就呢疊堆疊開始傾下"}
                      </button>
                    </>
                  )}
                </div>

                {/* Random Pick Option */}
                <div
                  className={`relative rounded-[2rem] p-6 lg:p-10 mb-6 border-2 transition-all duration-300 ${
                    isRandomDisabled
                      ? "bg-gray-100 border-gray-200"
                      : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-2xl font-bold ${
                        isRandomDisabled ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {language === "en" ? "Random Pick" : "隨機揀一疊"}
                    </h3>
                  </div>
                  {/* Mobile: floating circular play icon in top-right corner */}
                  <button
                    type="button"
                    onClick={!isRandomDisabled ? handleRandomPick : undefined}
                    disabled={isRandomDisabled}
                    className={`lg:hidden absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-300 ${
                      isRandomDisabled
                        ? "bg-gray-300 text-gray-500 opacity-60 cursor-not-allowed"
                        : "bg-gradient-to-b from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    ▶
                  </button>
                  <p
                    className={`hidden lg:block text-base leading-relaxed mb-6 ${
                      selectedStack ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {language === "en"
                      ? "Let AI randomly select a memory stack for you. Discover memories you might have forgotten about."
                      : "畀 AI 隨機幫你揀一疊記憶堆疊，或者會發現一啲你差啲忘記咗嘅故事。"}
                  </p>
                  {isRandomDisabled ? (
                    <>
                      <button
                        disabled
                        className="hidden lg:block w-full bg-gray-300 text-gray-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                      >
                        {language === "en" ? "Pick Random Stack" : "隨機揀一疊堆疊"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleRandomPick}
                        className="hidden lg:block w-full bg-gradient-to-b from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        {language === "en" ? "Pick Random Stack" : "隨機揀一疊堆疊"}
                      </button>
                    </>
                  )}
                </div>

                {/* New Memory Option */}
                <div
                  className={`relative rounded-[2rem] p-6 lg:p-10 mb-6 border-2 transition-all duration-300 ${
                    selectedStack
                      ? "bg-gray-100 border-gray-200"
                      : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-2xl font-bold ${
                        selectedStack ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {language === "en" ? "New Memory" : "建立新回憶"}
                    </h3>
                  </div>
                  {/* Mobile: floating circular play icon in top-right corner */}
                  <button
                    type="button"
                    onClick={!selectedStack ? handleNewMemory : undefined}
                    disabled={!!selectedStack}
                    className={`lg:hidden absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-300 ${
                      selectedStack
                        ? "bg-gray-300 text-gray-500 opacity-60 cursor-not-allowed"
                        : "bg-gradient-to-b from-purple-400 to-purple-700 text-white hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    ▶
                  </button>
                  <p
                    className={`hidden lg:block text-base leading-relaxed mb-6 ${
                      selectedStack ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {language === "en"
                      ? "Create a memory about something that probably happened but wasn't included in your imported media. AI will help you recall and document it."
                      : "為一啲冇喺相片或影片入面出現，但你記得曾經發生過嘅事情，建立一張新記憶卡，由 AI 陪你一齊回想同記錄。"}
                  </p>
                  {selectedStack ? (
                    <>
                      <button
                        disabled
                        className="hidden lg:block w-full bg-gray-300 text-gray-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                      >
                        {language === "en" ? "Create New Memory" : "建立新回憶"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleNewMemory}
                        className="hidden lg:block w-full bg-gradient-to-b from-purple-400 to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        {language === "en" ? "Create New Memory" : "建立新回憶"}
                      </button>
                    </>
                  )}
                </div>

                {/* Action Buttons - Pushed to bottom */}
                <div className="mt-auto flex gap-5">
                  <Link
                    href="/get-started"
                    className="flex-1 text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    {language === "en" ? "Back" : "返回"}
                  </Link>
                  {selectedStack ? (
                    <Link
                      href={`/memory-conversation?type=stack&stack=${selectedStack}`}
                      className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {language === "en" ? "Start Conversation" : "開始對話"}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex-1 text-center bg-gray-300 text-gray-500 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                    >
                      {language === "en" ? "Start Conversation" : "開始對話"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


