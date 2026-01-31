 "use client";
import React from "react";
import Navigation from "./components/Navigation";
import Link from "next/link";
import { PRESET_STACKS } from "./utils/presetStacks";
import { useLanguage } from "./contexts/LanguageContext";
import { translations } from "./translations";

function formatDateDDMMYYYY(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  // Handle ISO yyyy-mm-dd
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  // Fallback: try Date parsing, else return original
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Navigation
        fullWidth={true}
        primaryAction={{
          text: language === "en" ? "Visit Garden" : "去記憶花園",
          href: "/memory-garden",
          variant: "primary",
        }}
      />

      {/* Main content – scrolls like get-started; nav stays fixed and shows shadow when scrolled */}
      <main className="flex-1 min-h-0 pt-16 overflow-y-auto" data-nav-scroll-root>
        <div className="container mx-auto px-6 py-16">
          {/* Hero */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="grid lg:grid-cols-[3fr_2fr] gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  {t.home.hero.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                  {t.home.hero.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/get-started" 
                    className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {language === "en" ? "Story Summary Card" : "故事摘要卡"}
                  </Link>
                  <Link
                    href="/memory-conversation?type=new"
                    className="inline-block bg-gradient-to-b from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {language === "en" ? "AI Journal" : "AI 日記"}
                  </Link>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-[2rem] p-8 border-2 border-emerald-100">
                  <p className="text-4xl font-bold text-emerald-600 mb-2">
                    <span className="text-5xl">
                      {language === "en" ? "Thousands" : "成千上萬"}
                    </span>
                  </p>
                  <p className="text-xl text-gray-700">
                    {language === "en"
                      ? "of memories to be preserved"
                      : "段記憶等待被好好保存"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Memory Cards – full bleed to window edge, shadow at edges */}
          <div className="w-screen max-w-none relative left-1/2 -translate-x-1/2 mb-20 py-12">
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
                  {/* Row 1 - Memory Cards */}
                  {(() => {
                    const getDemoImages = (title: string): string[] => {
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
                      for (const [key, images] of Object.entries(imageMap)) {
                        if (title.includes(key) || key.includes(title)) {
                          return images;
                        }
                      }
                      return [];
                    };

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

                    const categoryLocale: Record<string, string> = {
                      family: "家庭",
                      friends: "朋友",
                      nature: "自然",
                      achievement: "成就",
                      travel: "旅行",
                      love: "愛情",
                      work: "工作",
                      creativity: "創意",
                    };

                    const getPreviewEmoji = (categories: string[]): string => {
                      const category = categories?.[0] || "";
                      if (category === "family") return "👨‍👩‍👧‍👦";
                      if (category === "friends") return "👥";
                      if (category === "travel" || category === "nature") return "✈️";
                      if (category === "achievement" || category === "work") return "🏆";
                      if (category === "love") return "💕";
                      return "🖼️";
                    };

                    // Create multiple duplicates for seamless infinite scroll
                    const duplicated = [...PRESET_STACKS, ...PRESET_STACKS, ...PRESET_STACKS, ...PRESET_STACKS];
                    return (
                      <div
                        className="marquee-track flex gap-5"
                        style={{ ["--marquee-duration" as any]: "60s" }}
                      >
                        {duplicated.map((stack, index) => {
                          const demoImages = getDemoImages(stack.title);
                          const previewEmoji = getPreviewEmoji(stack.categories);
                          const cardWidth = 320;
                          const displayDate = stack.startDate
                            ? formatDateDDMMYYYY(stack.startDate)
                            : stack.vagueTime || "";

                          const zh = demoLocale[stack.title];
                          const displayTitle =
                            language === "en" || !zh
                              ? stack.title
                              : zh.titleZh;
                          const displayDescription =
                            language === "en" || !zh
                              ? stack.description
                              : zh.descriptionZh;
                          const itemsLabel =
                            language === "en"
                              ? `${stack.mediaFiles.length} items`
                              : `${stack.mediaFiles.length} 個媒體`;
                          const firstCategory = stack.categories[0];
                          const categoryLabel =
                            language === "en"
                              ? firstCategory
                              : categoryLocale[firstCategory] || firstCategory;

                          return (
                            <div
                              key={`memory-${index}`}
                              className="shrink-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                              style={{ width: `${cardWidth}px` }}
                            >
                              {/* Image Preview */}
                              <div className="h-40 bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center overflow-hidden">
                                {demoImages.length > 0 ? (
                                  <img
                                    src={demoImages[0]}
                                    alt={stack.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-5xl">{previewEmoji}</div>
                                )}
                              </div>
                              
                              {/* Card Content */}
                              <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                    {displayTitle}
                                  </h3>
                                  <span className="text-xs text-gray-500 ml-2">{displayDate}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                                  {displayDescription}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{itemsLabel}</span>
                                  {stack.categories.length > 0 && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                                      {categoryLabel}
                                    </span>
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

          {/* How It Works */}
          <div id="how-it-works" className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {language === "en" ? "How it works" : "運作方式"}
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-16 mb-16">
              {/* For Elderly */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                  {language === "en" ? "As a gift for elderly" : "送俾長者嘅心意禮物"}
                </h3>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-[2rem] p-8 border-2 border-emerald-100">
                  <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">1</div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {language === "en" ? "Choose memories to revisit" : "揀返想重溫嘅回憶"}
                      </h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      {language === "en"
                        ? "Upload old photos or videos. We'll help select emotionally positive content and prepare gentle questions."
                        : "上載舊相或者影片，我哋會幫你揀出溫暖正面嘅內容，並準備溫柔嘅問題。"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">2</div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {language === "en" ? "Speak or record stories" : "傾計或者錄低故事"}
                      </h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      {language === "en"
                        ? "They can share in the way that's best for them: speak naturally, record their voice, or have a conversation. No typing required."
                        : "可以用最自然嘅方式分享：慢慢傾、錄低聲音，或者同AI對話，完全唔需要打字。"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">3</div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {language === "en" ? "Preserve their memories" : "好好保存佢哋嘅回憶"}
                      </h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      {language === "en"
                        ? "You'll have their stories in their voice preserved in beautiful memory cards you can read, reread and pass down."
                        : "佢哋用自己聲音講嘅故事，會變成靚靚記憶卡，隨時可以重溫，亦可以傳俾下一代。"}
                    </p>
                  </div>
                  </div>
                  <div className="mt-8 flex items-center justify-center">
                    <Link
                      href="/get-started"
                      className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {language === "en" ? "Try Story Summary Card" : "試用故事摘要卡"}
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* For Teens */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                  {language === "en" ? "For teens" : "俾青少年用"}
                </h3>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] p-8 border-2 border-indigo-100">
                  <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">1</div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {language === "en" ? "Get inspired" : "搵靈感"}
                      </h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      {language === "en"
                        ? "Choose prompts that bring your story to life, and we'll keep you motivated with gentle reminders."
                        : "揀啲提問同主題，幫你諗起屬於你嘅故事，我哋會用溫柔提示陪你慢慢寫。"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">2</div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {language === "en" ? "Write or record stories" : "寫低或者錄低故事"}
                      </h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      {language === "en"
                        ? "You can share in the way that's best for you: chat with AI, record your voice, or add photos and videos."
                        : "可以打字、同AI傾計、錄聲，或者加相加片，用最啱你嘅方式表達自己。"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">3</div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {language === "en" ? "Build your timeline" : "砌出自己嘅成長時間線"}
                      </h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      {language === "en"
                        ? "After recording your memories, you can see your stories preserved in a beautiful timeline to share and pass down."
                        : "記錄完之後，你會見到自己一條靚靚時間線，可以同信任嘅人分享，或者留俾未來嘅自己。"}
                    </p>
                  </div>
                  </div>
                  <div className="mt-8 flex items-center justify-center">
                    <Link
                      href="/memory-conversation?type=new"
                      className="inline-block bg-gradient-to-b from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      {language === "en" ? "Try AI Journal" : "試用 AI 日記"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
              </div>
              
          {/* What's Included */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {language === "en" ? "What's included?" : "有啲咩包括喺入面？"}
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  {language === "en"
                    ? "Everything you need to create a keepsake memory collection"
                    : "幫你儲起一套值得珍藏嘅回憶合集，所需嘅工具都喺度。"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-[2rem] p-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <span className="text-emerald-600 text-2xl mr-4">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {language === "en" ? "Voice-first storytelling" : "以聲音為先嘅講故事方式"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Speak naturally, no typing required"
                          : "自然咁講，唔洗打字都可以記低回憶"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-emerald-600 text-2xl mr-4">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {language === "en" ? "AI-guided memory recall" : "AI陪你慢慢搵返回憶"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Gentle questions that spark stories"
                          : "用溫柔提問，慢慢帶你諗起更多細節同故事"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-emerald-600 text-2xl mr-4">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {language === "en" ? "Beautiful memory cards" : "靚靚記憶卡展示故事"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Stories preserved with photos and tags"
                          : "用相片同標籤幫你整理同保存每一段故事"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-emerald-600 text-2xl mr-4">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {language === "en" ? "Private and secure" : "私隱保護，安全可靠"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Your stories belong to you"
                          : "你嘅故事屬於你自己，我哋重視保密同安全"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-emerald-600 text-2xl mr-4">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {language === "en" ? "Shareable timeline" : "可以分享嘅時間線"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Share with family when you're ready"
                          : "準備好之後，可以同家人朋友一齊睇返呢條時間線"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-emerald-600 text-2xl mr-4">✓</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {language === "en" ? "Culturally sensitive" : "貼近本地文化同情感"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === "en"
                          ? "Built for Hong Kong families"
                          : "專為香港家庭設計，尊重本地語言同文化背景"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          {/* Key Features */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🎤</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === "en" ? "Writing or voice, it's their choice" : "寫低定講出嚟，由佢哋自己揀"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Some like to write, some like to speak. Easily share stories the way they prefer."
                    : "有啲人鍾意寫，有啲人鍾意講，記憶花園都可以配合，用最舒服嘅方式分享故事。"}
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === "en" ? "Find just the right questions" : "搵到啱心情嘅提問"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Choose from our library of culturally-appropriate prompts, or create your own."
                    : "可以喺精心設計、貼近本地文化嘅提問入面揀，或者自己諗問題都得。"}
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {language === "en" ? "Ethical AI at the core" : "以關懷為本嘅 AI 設計"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Built with emotional safety rules: AI is a listener, not a friend. Your privacy is protected."
                    : "AI會做一個細心聆聽者，而唔係假裝朋友；有清晰嘅情緒安全界線，同時重視你嘅私隱。"}
                </p>
              </div>
            </div>
          </div>

          {/* Sample Questions */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  {language === "en" ? "Sample questions" : "示例提問"}
                </h2>
                <p className="text-gray-600 mb-8">
                  {language === "en"
                    ? "Choose from our library of culturally-appropriate prompts, or create your own personalized questions."
                    : "可以喺精心挑選、符合文化背景嘅問題庫入面揀，又或者自己加上專屬提問。"}
                </p>
              </div>
              <div className="marquee relative overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white to-transparent z-10"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white to-transparent z-10"
                  aria-hidden="true"
                />

                <div className="overflow-hidden">
                  <div className="flex flex-col gap-6">
                    {/* Row 1 - Slow */}
                    {(() => {
                      const questions =
                        language === "en"
                          ? [
                              "What fascinated you as a child?",
                              "What's one of the best days you can remember?",
                              "What do you consider your motto?",
                              "What's the best job you ever had?",
                              "Who's been the kindest to you in your life?",
                              "What do you miss most about being a child?",
                              "What are the most important lessons you've learned in life?",
                              "When you think of the word 'home' what place comes to mind?",
                              "What's some of the best advice you've received?",
                              "If you could thank anyone who would it be?",
                              "What's a memory that always makes you smile?",
                              "What tradition from your childhood do you still follow?",
                            ]
                          : [
                              "細個嘅時候，有啲咩特別吸引你？",
                              "你記得最開心嘅一日係點樣？",
                              "如果要用一句座右銘形容自己，你會點講？",
                              "你做過最鍾意嘅工作係邊一份？",
                              "你人生入面，邊個對你最好？",
                              "你最掛住童年入面嘅咩？",
                              "你覺得自己學到最重要嘅人生功課係咩？",
                              "一講起「屋企」，你第一時間諗起邊個地方？",
                              "有人畀過你咩好重要嘅建議？",
                              "如果可以親口多謝一個人，你會揀邊個？",
                              "有咩回憶一諗起就會忍唔住笑？",
                              "童年有冇一啲習慣或者傳統，你而家仲有保留？",
                            ];
                      const duplicated = [...questions, ...questions];
                      return (
                        <div
                          className="marquee-track-slow flex gap-5"
                          style={{ ["--marquee-duration-slow" as any]: "75s" }}
                        >
                          {duplicated.map((question, index) => {
                            const widths = [280, 320, 300, 340, 310, 330, 290, 350];
                            const paddings = [4, 5, 6];
                            const width = widths[index % widths.length];
                            const padding = paddings[index % paddings.length];
                            return (
                              <div
                                key={`row1-${index}`}
                                className="shrink-0 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200"
                                style={{ width: `${width}px`, padding: `${padding * 4}px` }}
                              >
                                <p className="text-gray-700 text-base leading-relaxed">{question}</p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    
                    {/* Row 2 - Medium with offset */}
                    {(() => {
                      const questions =
                        language === "en"
                          ? [
                              "What's a place you've always wanted to visit?",
                              "Who was your favorite teacher and why?",
                              "What's a skill you wish you had learned?",
                              "What's the funniest thing that's happened to you?",
                              "What's something you're proud of but rarely talk about?",
                              "What's a book or movie that changed your perspective?",
                              "What's your favorite way to spend a quiet afternoon?",
                              "What's a recipe or dish that reminds you of home?",
                              "What's something you learned from your grandparents?",
                              "What's a moment when you felt truly at peace?",
                              "What's a hobby you've always wanted to try?",
                              "What's a song that brings back strong memories?",
                            ]
                          : [
                              "有冇一個地方，你一直好想去但仲未去到？",
                              "你最難忘、最鍾意嘅老師係邊位？點解？",
                              "有咩技能係你一直想學但未學到？",
                              "人生入面最搞笑嘅一件事係咩？",
                              "有咩令你好自豪，但平時好少同人講？",
                              "有冇一本書或者一套戲，改變過你睇世界嘅方式？",
                              "你最理想、最舒服嘅一個安靜下午會點過？",
                              "有冇一味菜或者食物，一食就會諗起屋企？",
                              "你喺公公婆婆／爺爺嫲嫲身上學到啲咩？",
                              "有冇一個時刻，令你覺得好平靜、好安穩？",
                              "你一直好想試，但仲未開始嘅興趣係咩？",
                              "有冇一首歌，一聽就勾起好多回憶？",
                            ];
                      const duplicated = [...questions, ...questions];
                      return (
                        <div
                          className="marquee-track flex gap-6 ml-8"
                          style={{ ["--marquee-duration" as any]: "60s" }}
                        >
                          {duplicated.map((question, index) => {
                            const widths = [310, 290, 350, 300, 330, 280, 340, 320];
                            const paddings = [5, 4, 6];
                            const width = widths[index % widths.length];
                            const padding = paddings[index % paddings.length];
                            return (
                              <div
                                key={`row2-${index}`}
                                className="shrink-0 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200"
                                style={{ width: `${width}px`, padding: `${padding * 4}px` }}
                              >
                                <p className="text-gray-700 text-base leading-relaxed">{question}</p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    
                    {/* Row 3 - Fast */}
                    {(() => {
                      const questions =
                        language === "en"
                          ? [
                              "What's a challenge you overcame that shaped you?",
                              "What's something beautiful you noticed today?",
                              "What's a memory you'd like to share with future generations?",
                              "What's a small moment that brought you joy recently?",
                              "What's something you're grateful for this week?",
                              "What's a story from your family that you treasure?",
                              "What's something that always makes you feel nostalgic?",
                              "What's a place that holds special meaning for you?",
                              "What's a piece of wisdom you'd pass on to others?",
                              "What's something that surprised you about yourself?",
                              "What's a tradition you'd like to start?",
                              "What's a memory that connects you to your culture?",
                            ]
                          : [
                              "有咩難關係你捱過之後，覺得自己成長咗好多？",
                              "今日有冇留意到咩細細個但好靚嘅畫面？",
                              "有冇一段回憶係你好想將來同下一代分享？",
                              "最近有冇一個細微但令你覺得好開心嘅時刻？",
                              "呢個星期，你最感恩嘅一件事係咩？",
                              "有冇一個家族故事，你覺得特別值得珍藏？",
                              "有冇啲事情，總係令你覺得好懷念從前？",
                              "世界上有邊個地方，對你嚟講有特別意思？",
                              "如果要你畀一個忠告俾其他人，你會講咩？",
                              "有冇一件事令你發現，原來自己同想像中唔同？",
                              "有冇一個傳統係你想由自己開始、慢慢傳落去？",
                              "有冇一段回憶，令你覺得自己同自己嘅文化好有連結？",
                            ];
                      const duplicated = [...questions, ...questions];
                      return (
                        <div
                          className="marquee-track-fast flex gap-4"
                          style={{ ["--marquee-duration-fast" as any]: "50s" }}
                        >
                          {duplicated.map((question, index) => {
                            const widths = [300, 340, 280, 330, 310, 350, 290, 320];
                            const paddings = [6, 5, 4];
                            const width = widths[index % widths.length];
                            const padding = paddings[index % paddings.length];
                            return (
                              <div
                                key={`row3-${index}`}
                                className="shrink-0 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200"
                                style={{ width: `${width}px`, padding: `${padding * 4}px` }}
                              >
                                <p className="text-gray-700 text-base leading-relaxed">{question}</p>
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

          {/* Founder Story */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-50 rounded-[2rem] p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {language === "en" ? "Built by our family, for yours" : "由我哋一家打造，送俾你哋一家"}
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {language === "en"
                    ? `\"The idea for Memory Garden came from something simple: we wanted to bridge the emotional support gap in Hong Kong. 
We saw elderly experiencing loneliness and teens struggling with emotional expression. 
The more stories they shared, the more connected they felt. That's an experience we wanted everyone to be able to have.\"`
                    : "「記憶花園嘅念頭，其實好簡單：我哋想補回香港喺情感支持上面嘅缺口。我哋見到長者經歷寂寞，青少年又好難安心表達自己嘅情緒。當佢哋慢慢分享更多故事，彼此嘅連結就變得更深。呢種被聆聽同被理解嘅感覺，我哋希望每個人都可以擁有。」"}
                </p>
                <p className="text-gray-600">
                  {language === "en" ? "— Memory Garden Team" : "— 記憶花園團隊"}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-[2rem] p-12 border-2 border-emerald-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === "en" ? "Our Mission" : "我哋嘅初心"}
                </h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>
                      {language === "en"
                        ? "Bridge emotional support gaps in Hong Kong"
                        : "為香港人補回情感支持同陪伴嘅缺口"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>
                      {language === "en"
                        ? "Preserve memories for future generations"
                        : "為下一代好好保留重要嘅回憶同故事"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>
                      {language === "en"
                        ? "Create safe spaces for emotional expression"
                        : "打造一個安全空間，等大家可以放心表達情緒"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>
                      {language === "en"
                        ? "Build culturally-sensitive solutions"
                        : "設計尊重本地文化同語言嘅解決方案"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mb-20 pt-20 border-t border-gray-200">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Your story starts here" : "你嘅故事，可以由呢度開始"}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {language === "en"
                ? "Turn stories into a treasure you'll cherish forever, one conversation at a time."
                : "由一次對話開始，將一個又一個故事，變成你一生可以好好珍藏嘅寶物。"}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link 
                href="/get-started" 
                className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {language === "en" ? "Story Summary Card" : "故事摘要卡"}
              </Link>
              <Link
                href="/memory-conversation?type=new"
                className="inline-block bg-gradient-to-b from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {language === "en" ? "AI Journal" : "AI 日記"}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t-2 border-gray-200 py-12">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <span className="text-2xl">🌱</span>
                <span className="text-xl font-semibold text-gray-800">
                  {translations[language].navigation.memoryGarden}
                </span>
              </div>
              <p className="text-gray-600 mb-2">
                {language === "en"
                  ? "Bridging emotional support gaps through voice-first memory storytelling."
                  : "用聲音同故事，為香港人搭起情感支持同連結嘅橋樑。"}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                {language === "en"
                  ? "© 2026 Memory Garden. Built with care for Hong Kong families."
                  : "© 2026 記憶花園。用心為香港家庭打造。"}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
