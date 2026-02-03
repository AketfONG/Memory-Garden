"use client";

import React from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { PRESET_STACKS } from "../utils/presetStacks";

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

export default function AIJournalIntroPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation showBackButton={true} backButtonHref="/" backButtonText={language === "en" ? "Back to Home" : "返回首頁"} />

      <main className="flex-1 pt-16 overflow-y-auto" data-nav-scroll-root>
        <div className="container mx-auto px-6 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-start text-left max-w-7xl mx-auto">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {language === "en" ? "AI Journal" : "AI 日記"}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                {language === "en"
                  ? "Chat or message with AI and get your conversation summarised. Your dialogue is turned into a clear summary you can keep or revisit."
                  : "同 AI 傾計或傳訊息，就可以得到對話摘要。對話會整理成清晰摘要，方便你保存或重溫。"}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/"
                  className="inline-block border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300"
                >
                  {language === "en" ? "Back" : "返回"}
                </Link>
                <Link
                  href="/memory-conversation?type=new&flow=ai-journal"
                  className="inline-block bg-gradient-to-b from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {language === "en" ? "Continue" : "繼續"}
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] p-8 border-2 border-indigo-100">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
                {language === "en" ? "How it works" : "運作方式"}
              </h2>
              <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    {language === "en" ? "Chat with AI" : "同 AI 傾計"}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {language === "en"
                      ? "Share your thoughts, memories, or stories in a conversation with AI."
                      : "喺對話入面同 AI 分享你嘅想法、回憶或故事。"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    {language === "en" ? "Get a summary" : "得到摘要"}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {language === "en"
                      ? "AI turns your chat into a clear summary you can keep or revisit."
                      : "AI 會將你嘅對話整理成清晰摘要，方便你保存或重溫。"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                    {language === "en" ? "Keep or revisit" : "保存或重溫"}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {language === "en"
                      ? "Save your summary to your garden or come back anytime to read and reflect."
                      : "將摘要保存到記憶花園，或者隨時返嚟重溫同反思。"}
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Sample Memory Cards – scroll gallery (hidden on mobile, one-column view) */}
          <div className="hidden lg:block w-screen max-w-none relative left-1/2 -translate-x-1/2 mt-16 mb-12 py-8 opacity-50">
            <div className="marquee relative overflow-hidden">
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-28 z-10"
                style={{
                  background: "linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.98) 15%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.5) 70%, transparent 100%)",
                }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-28 z-10"
                style={{
                  background: "linear-gradient(to left, #ffffff 0%, rgba(255,255,255,0.98) 15%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.5) 70%, transparent 100%)",
                }}
                aria-hidden="true"
              />
              <div className="py-4">
                <div className="flex flex-col gap-6">
                  {(() => {
                    const getDemoImages = (title: string): string[] => {
                      const imageMap: { [key: string]: string[] } = {
                        "Summer Beach Day": ["/Summer Beach Day 1.jpg.webp", "/Summer Beach Day 2.jpg"],
                        "Family Birthday Celebration": ["/Family Birthday Celebration 1.webp", "/Family Birthday Celebration 2.jpg"],
                        "Mountain Hiking Adventure": ["/Mountain Hiking Adventure 1.jpg", "/Mountain Hiking Adventure 2.jpg"],
                        "Anniversary Dinner": ["/Anniversary Dinner 1.jpg", "/Anniversary Dinner 2.jpg"],
                        "Work Project Launch": ["/Work Project Launch 1.jpg", "/Work Project Launch 2.png"],
                        "Weekend Road Trip": ["/Weekend Road Trip 1.jpg.webp", "/Weekend Road Trip 2.jpg"],
                        "Art Gallery Opening": ["/Art Gallery Opening 1.jpg", "/Art Gallery Opening 2.jpg.webp"],
                      };
                      for (const [key, images] of Object.entries(imageMap)) {
                        if (title.includes(key) || key.includes(title)) return images;
                      }
                      return [];
                    };
                    const demoLocale: Record<string, { titleZh: string; descriptionZh: string }> = {
                      "Summer Beach Day": { titleZh: "夏日沙灘一日遊", descriptionZh: "同朋友喺沙灘度過完美一日，砌沙堡、曬太陽，充滿笑聲同陽光味道。" },
                      "Family Birthday Celebration": { titleZh: "一家人嘅生日慶祝", descriptionZh: "全家人齊齊為嫲嫲／婆婆慶祝 80 大壽，屋企充滿笑聲同祝福。" },
                      "Mountain Hiking Adventure": { titleZh: "山頂遠足小冒險", descriptionZh: "挑戰行上山頂，沿途風景壯麗，到達時有種完成咗一件大事嘅滿足感。" },
                      "Anniversary Dinner": { titleZh: "紀念日浪漫晚餐", descriptionZh: "去到最鍾意嘅餐廳食一餐靚飯，一齊慶祝又走過一個年頭嘅陪伴同愛。" },
                      "Work Project Launch": { titleZh: "工作項目正式起動", descriptionZh: "同成個團隊一齊成功推出年度最大型嘅項目，感受到團隊合作同成就感。" },
                      "Weekend Road Trip": { titleZh: "週末公路小旅行", descriptionZh: "臨時決定去附近小鎮行下，發現咗唔少小店同咖啡店，充滿驚喜同自由感。" },
                      "Art Gallery Opening": { titleZh: "藝術展開幕之夜", descriptionZh: "參加本地藝術家畫展開幕，被一幅幅畫同創作能量包圍，感受到靈感同藝術氣氛。" },
                    };
                    const categoryLocale: Record<string, string> = {
                      family: "家庭", friends: "朋友", nature: "自然", achievement: "成就", travel: "旅行", love: "愛情", work: "工作", creativity: "創意",
                    };
                    const getPreviewEmoji = (categories: string[]): string => {
                      const c = categories?.[0] || "";
                      if (c === "family") return "👨‍👩‍👧‍👦";
                      if (c === "friends") return "👥";
                      if (c === "travel" || c === "nature") return "✈️";
                      if (c === "achievement" || c === "work") return "🏆";
                      if (c === "love") return "💕";
                      return "🖼️";
                    };
                    const duplicated = [...PRESET_STACKS, ...PRESET_STACKS, ...PRESET_STACKS, ...PRESET_STACKS];
                    return (
                      <div className="marquee-track flex gap-5" style={{ ["--marquee-duration" as string]: "60s" } as React.CSSProperties}>
                        {duplicated.map((stack, index) => {
                          const demoImages = getDemoImages(stack.title);
                          const previewEmoji = getPreviewEmoji(stack.categories);
                          const cardWidth = 320;
                          const displayDate = stack.startDate ? formatDateDDMMYYYY(stack.startDate) : stack.vagueTime || "";
                          const zh = demoLocale[stack.title];
                          const displayTitle = language === "en" || !zh ? stack.title : zh.titleZh;
                          const displayDescription = language === "en" || !zh ? stack.description : zh.descriptionZh;
                          const itemsLabel = language === "en" ? `${stack.mediaFiles.length} items` : `${stack.mediaFiles.length} 個媒體`;
                          const firstCategory = stack.categories[0];
                          const categoryLabel = language === "en" ? firstCategory : categoryLocale[firstCategory] || firstCategory;
                          return (
                            <div
                              key={`memory-${index}`}
                              className="shrink-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                              style={{ width: `${cardWidth}px` }}
                            >
                              <div className="h-40 bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center overflow-hidden">
                                {demoImages.length > 0 ? (
                                  <img src={demoImages[0]} alt={stack.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-5xl">{previewEmoji}</div>
                                )}
                              </div>
                              <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{displayTitle}</h3>
                                  <span className="text-xs text-gray-500 ml-2">{displayDate}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{displayDescription}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{itemsLabel}</span>
                                  {stack.categories.length > 0 && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{categoryLabel}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
