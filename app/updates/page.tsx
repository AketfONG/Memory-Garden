'use client';

import React, { useState } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

export default function UpdatesPage() {
  const { language } = useLanguage();
  const t = translations[language];

  const [testerCode, setTesterCode] = useState("");
  const [unlockStatus, setUnlockStatus] = useState<"idle" | "success" | "error">("idle");

  const handleUnlock = () => {
    const trimmed = testerCode.trim();
    // Simple 4-digit tester code; update here if you want multiple codes
    const validCodes = ["0127"];
    if (validCodes.includes(trimmed)) {
      if (typeof window !== "undefined") {
        localStorage.setItem("mg_pro_unlocked", "true");
        localStorage.removeItem("mg_free_image_generations");
      }
      setUnlockStatus("success");
    } else {
      setUnlockStatus("error");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-white flex flex-col lg:overflow-hidden">
      {/* Header */}
      <Navigation showBackButton={true} backButtonText={t.navigation.backToHome} />

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-24 lg:pb-8 lg:overflow-hidden">
        <div className="h-full w-full px-8 py-8">
          <div className="h-full flex flex-col">
            <div className="flex-1 grid lg:grid-cols-2 gap-10 min-h-0">
              {/* Left Column - Title + Coming Soon / Roadmap */}
              <div className="flex flex-col min-h-0 space-y-6 lg:overflow-y-auto lg:pr-1">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
                    {t.updates.title}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed mb-4">
                    {t.updates.subtitle}
                  </p>
                  <Link
                    href="/style-config"
                    className="inline-flex items-center justify-center px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out"
                  >
                    <span className="mr-2">▶</span>
                    <span>
                      {language === "en" ? "Style Configuration" : "風格設定"}
                    </span>
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-8 flex flex-col min-h-0">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {language === "en" ? "Tester Access" : "測試者權限"}
                    </h2>
                    <p className="text-base text-gray-900 leading-relaxed">
                      {language === "en"
                        ? "Enter your 4-digit tester code to unlock additional image generations during testing."
                        : "輸入四位數測試代碼，在測試期間解鎖更多圖片生成功能。"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={4}
                      value={testerCode}
                      onChange={(e) => {
                        setTesterCode(e.target.value.replace(/[^0-9]/g, ""));
                        setUnlockStatus("idle");
                      }}
                      className="w-28 px-4 py-3 border-2 border-gray-300 rounded-full text-center text-lg font-semibold text-gray-800 placeholder-gray-500 bg-white focus:outline-none focus:border-gray-500 transition-colors"
                      placeholder="0000"
                    />
                    <button
                      type="button"
                      onClick={handleUnlock}
                      className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      aria-label="Unlock tester access"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  {unlockStatus === "success" && (
                    <p className="mt-3 text-sm text-emerald-700">
                      {language === "en"
                        ? "Tester mode unlocked. Your image generation limit is now lifted on this browser."
                        : "已成功解鎖測試模式。此瀏覽器上的圖片生成次數限制已被取消。"}
                    </p>
                  )}
                  {unlockStatus === "error" && (
                    <p className="mt-3 text-sm text-red-600">
                      {language === "en"
                        ? "Invalid code. Please check with the maintainer for your tester code."
                        : "代碼無效。請向維護人員確認您的測試代碼。"}
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2rem] p-12 text-white shadow-xl">
                  <h2 className="text-2xl font-semibold mb-2">
                    {language === "en"
                      ? "Sprout 🔍: thank you for growing with us"
                      : "Sprout 🔍：多謝你同我哋一齊種呢個花園"}
                  </h2>
                  <p className="text-base opacity-90 leading-relaxed">
                    {language === "en"
                      ? "Sprout is really grateful you’re testing Memory Garden and helping us make it gentler, clearer, and more Cantonese‑friendly for everyone. Every click, conversation, and card you try plants another seed for the future version we’ll share with more families."
                      : "Sprout 好感激你幫手測試記憶花園，等我哋可以做到更加溫柔、清晰，又更加貼近廣東話使用者嘅需要。你每一次點擊、每一句對話、每一張記憶卡，其實都係為將來同更多家庭分享嘅版本種下一粒新種子。"}
                  </p>
                </div>
              </div>

              {/* Right Column - Version Logs */}
              <div className="flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pr-1 space-y-8 min-h-0">
                  {/* Version v1.0.1 - Latest */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-[2rem] p-8 border-2 border-emerald-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 1.0.1
                          </h2>
                          <p className="text-emerald-600 font-medium">
                            {t.updates.latestVersion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">🎨</span>
                          {t.updates.improvements}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Scrolling Optimization and Bug Fixes"
                              : "滾動優化同錯誤修復"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-emerald-100 rounded-full p-4">
                        <p className="text-emerald-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 31/01/2026
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Version v1.0 - Previous */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 1.0
                          </h2>
                          <p className="text-gray-500 font-medium">
                            {t.updates.previousVersion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">✨</span>
                          {t.updates.newFeatures}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Story Summary Card – create concise memory cards from photos and simple time inputs"
                              : "「故事摘要卡」——由相片同簡單時間輸入，自動變成精簡又有重點嘅記憶卡"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "AI Journal – start free-form conversations with AI to explore and reflect on memories"
                              : "AI 日記——用自由對話方式，慢慢同 AI 傾你嘅生活同回憶，幫你反思同整理情緒"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Functional Image Generation – more accurate, on-demand visuals that reflect the actual content of each memory"
                              : "實用圖片生成——更貼近內容嘅圖片效果，需要先至生成，幫你用畫面記錄重要時刻"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Cantonese Support – full Cantonese interface, prompts, and AI conversations tailored for Hong Kong users"
                              : "廣東話支援——完整廣東話介面、提示同 AI 對話，專為香港用家而設"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Memory Cards – save polished cards from stacks or conversations and share them easily with friends and family"
                              : "記憶卡——由堆疊或對話整理出精緻記憶卡，方便儲存同同家人朋友分享"}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">🎨</span>
                          {t.updates.improvements}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Mobile Optimization – compact UI layouts that adapt gracefully to small screens for stacks, conversations, and the garden"
                              : "手機體驗優化——為堆疊、對話同花園介面重新設計緊湊版版面，更適合細屏使用"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Updating UI elements across pages to match the new rounded, soft card style and typography"
                              : "全面更新介面元素，統一用更圓潤柔和嘅卡片風格同字體設計"}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-gray-500 mr-2">📝</span>
                          {t.updates.notes}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Removed Legacy Pages"
                              : "移除舊版頁面"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-200 rounded-full p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 29/01/2026
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Version v0.5 */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 0.5
                          </h2>
                          <p className="text-gray-600 font-medium">
                            {t.updates.previousVersion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">🎨</span>
                          {t.updates.improvements}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "UI and interface overhaul, featuring completely new user experiences and non-scrollable page view"
                              : "重新設計整體介面，帶來全新使用體驗，同時引入不需滾動嘅整頁版面呈現"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-200 rounded-full p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 09/01/2026
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Version v0.4 */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 0.4
                          </h2>
                          <p className="text-gray-600 font-medium">
                            {t.updates.previousVersion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">✨</span>
                          {t.updates.newFeatures}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Voice Memory Interaction - Talk to Sprout about your memories with your voice"
                              : "語音記憶互動——用自己把聲同 Sprout 講返你嘅回憶"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Memory Cards - Visual memory cards with image support in a dedicated view"
                              : "記憶卡——有專屬版面顯示支援相片嘅視覺記憶卡"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Memory preview page for adding media after voice conversations"
                              : "記憶預覽頁面，可喺語音對話之後再補充媒體檔案"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-200 rounded-full p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 25/11/2025
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Version v0.3 */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 0.3
                          </h2>
                          <p className="text-gray-600 font-medium">
                            {t.updates.previousVersion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">✨</span>
                          {t.updates.newFeatures}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "AI text input to conversation using Google AI Studio"
                              : "加入 AI 文字對話功能（使用 Google AI Studio）"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Media preview area"
                              : "媒體預覽區域"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Style configuration page for easier development"
                              : "風格設定頁面，方便之後開發調整樣式"}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">🎨</span>
                          {t.updates.improvements}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en" ? "UI refinements" : "介面細節優化"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-200 rounded-full p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 23/08/2025
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Version v0.2 */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 0.2
                          </h2>
                          <p className="text-gray-600 font-medium">
                            {t.updates.previousVersion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">✨</span>
                          {t.updates.newFeatures}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "My Garden for previous memory generations"
                              : "「我的花園」頁面，可重溫之前生成嘅記憶"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Simple Mode for memory creation"
                              : "簡易模式建立記憶"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Refined date specification"
                              : "更清晰嘅日期輸入方式"}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-emerald-500 mr-2">🎨</span>
                          {t.updates.improvements}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-emerald-500 mr-3">•</span>
                            {language === "en"
                              ? "Optimised buttons, mobile view, navigation bar elements"
                              : "優化按鈕樣式、手機版版面同導覽列元素"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-200 rounded-full p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 13/07/2025
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Version v0.1 */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 0.1
                          </h2>
                          <p className="text-gray-600 font-medium">
                            {t.updates.previousVersion}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-gray-500 mr-2">✨</span>
                          {t.updates.newFeatures}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Navigation Bar AI integration"
                              : "導覽列 AI 對話入口整合"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Mobile version Navigation Bar"
                              : "手機版導覽列設計"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Multiple selection of Memory Category and Emotions"
                              : "記憶類別同情緒支援多重選擇"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en" ? "Language Switch" : "語言切換功能"}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-gray-500 mr-2">🎨</span>
                          {t.updates.improvements}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Added floating when hovering over blocks"
                              : "卡片加入浮動懸停效果"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Unified colour schemes, button styles and UI design of the website"
                              : "統一網站色系、按鈕樣式同整體 UI 設計"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Improved chat UI, Navigation Bar and Media Player"
                              : "改善聊天介面、導覽列同媒體播放器體驗"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Changed Emojis on buttons for better readability"
                              : "調整按鈕上的表情符號，提升可讀性"}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-gray-500 mr-2">📝</span>
                          {t.updates.notes}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Disabled Overscroll and Scroll Bar"
                              : "關閉過度滾動效果同顯式卷軸"}
                          </li>
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Discarded legacy pages and interfaces in favour of the new Memory Garden flows"
                              : "棄用舊版頁面同介面，全面改用新記憶花園流程"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-200 rounded-full p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 28/06/2025
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Version v0.0 */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-8 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">🌱</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {t.updates.version} 0
                          </h2>
                          <p className="text-gray-600 font-medium">
                            {t.updates.initialPrototype}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="text-gray-500 mr-2">🚀</span>
                          {t.updates.foundation}
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start">
                            <span className="text-gray-500 mr-3">•</span>
                            {language === "en"
                              ? "Defined website design, Memory Data Collection, Memory Generation, Home Page, Features Page, Tour Page and About Page"
                              : "確立網站設計方向、記憶資料收集流程、記憶生成流程，以及首頁、功能頁、導覽頁同關於頁嘅初版結構"}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gray-200 rounded-full p-4">
                        <p className="text-gray-700 text-sm">
                          <strong>{t.updates.releaseDate}:</strong> 27/06/2025
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}