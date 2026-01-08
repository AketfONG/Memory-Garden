"use client";
import React from "react";
import Navigation from "../components/Navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

export default function OldHome() {
  const { language } = useLanguage();
  const t = translations[language].home;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation showStartGrowing={true} />

      {/* Hero Section */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="text-6xl mb-4 block">🌿</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              {language === 'en' ? (
                <>
                  Nurture{' '}
                  <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                    Memories
                  </span>{' '}
                  and Your Connections
                </>
              ) : (
                <>
                  培育{' '}
                  <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                    記憶
                  </span>{' '}
                  和您的聯繫
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/memory-voice" className="w-fit bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-3">
                <span>🎤</span>
                <span>Voice Memory Interaction</span>
              </a>
              <a href="/garden" className="w-fit inline-block border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                🌱 {t.hero.viewMyGarden}
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="mt-32">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">
              {t.features.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Voice Memory Interaction */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 flex flex-col h-full">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🎤</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {language === 'en' ? 'Voice Memory Interaction' : '語音記憶互動'}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1 mb-4">
                  {language === 'en' 
                    ? 'Talk to Sprout about your memories with your voice. Have natural conversations and share your experiences through voice interaction.'
                    : '用您的聲音與 Sprout 談論您的記憶。通過語音互動進行自然對話並分享您的經歷。'}
                </p>
                <a 
                  href="/memory-voice" 
                  className="mt-auto inline-block text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 transition-colors duration-300 ease-in-out"
                >
                  {language === 'en' ? 'Try it now' : '立即試用'}
                  <svg className="w-4 h-4 inline-block transition-colors duration-300 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
              {/* Memory Cards */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 flex flex-col h-full">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🖼️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {language === 'en' ? 'Memory Cards' : '記憶卡片'}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1 mb-4">
                  {language === 'en' 
                    ? 'Visual memory cards with image support in a dedicated view. Browse your memories as beautiful, visual cards that bring your experiences to life.'
                    : '帶有圖像支持的視覺記憶卡片專用視圖。以美麗的視覺卡片瀏覽您的記憶，讓您的經歷栩栩如生。'}
                </p>
                <a 
                  href="/garden?view=cards" 
                  className="mt-auto inline-block text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 transition-colors duration-300 ease-in-out"
                >
                  {language === 'en' ? 'View cards' : '查看卡片'}
                  <svg className="w-4 h-4 inline-block transition-colors duration-300 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Memory Preview */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 flex flex-col h-full">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">📸</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {language === 'en' ? 'Memory Preview' : '記憶預覽'}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1 mb-4">
                  {language === 'en' 
                    ? 'Add media after voice conversations. Review and enhance your memories with photos and videos in a dedicated preview page.'
                    : '在語音對話後添加媒體。在專用的預覽頁面中查看並用照片和視頻增強您的記憶。'}
                </p>
                <a 
                  href="/memory-preview" 
                  className="mt-auto inline-block text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 transition-colors duration-300 ease-in-out"
                >
                  {language === 'en' ? 'Learn more' : '了解更多'}
                  <svg className="w-4 h-4 inline-block transition-colors duration-300 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Take a Tour Button */}
            <div className="text-center mt-12">
              <a href="/tour" className="w-fit inline-block border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                ▶️ {t.features.takeTour}
              </a>
            </div>
          </div>

          {/* Emotional Journey Section */}
          <div className="mt-32 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-12 mb-16 backdrop-blur-md max-w-7xl mx-auto">
            <div className="text-center">
              <span className="text-4xl mb-6 block">💚</span>
              <h2 className="text-3xl font-bold text-gray-800 mb-12">{t.emotionalJourney.title}</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t.emotionalJourney.description}
              </p>
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-emerald-700 mb-3">🌱 {t.emotionalJourney.planting.title}</h3>
                  <p className="text-gray-600">{t.emotionalJourney.planting.description}</p>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-emerald-700 mb-3">💧 {t.emotionalJourney.nurturing.title}</h3>
                  <p className="text-gray-600">{t.emotionalJourney.nurturing.description}</p>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-emerald-700 mb-3">🌸 {t.emotionalJourney.blooming.title}</h3>
                  <p className="text-gray-600">{t.emotionalJourney.blooming.description}</p>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-emerald-700 mb-3">🌿 {t.emotionalJourney.growing.title}</h3>
                  <p className="text-gray-600">{t.emotionalJourney.growing.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-12 mb-16 text-white shadow-xl max-w-7xl mx-auto">
              <span className="text-5xl mb-6 block">🌿</span>
              <h2 className="text-3xl font-bold mb-12">{t.cta.title}</h2>
              <p className="text-lg mb-8 opacity-95 leading-relaxed">
                {t.cta.description}
              </p>
              <a href="/plant" className="w-fit inline-block bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 text-emerald-600 px-12 py-5 rounded-full text-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                🌱 {t.cta.startGrowingToday}
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-16 mt-32 border-t-2 border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-semibold text-gray-800">{translations[language].navigation.memoryGarden}</span>
          </div>
          <p className="text-gray-600">{t.footer.tagline}</p>
          <p className="text-sm text-gray-500 mt-4">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

