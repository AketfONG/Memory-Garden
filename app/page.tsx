"use client";
import React from "react";
import Navigation from "./components/Navigation";
import { useLanguage } from "./contexts/LanguageContext";
import { translations } from "./translations";

export default function Home() {
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
                  Nurture Your{' '}
                  <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                    Memories
                  </span>{' '}
                  Like a Garden
                </>
              ) : (
                <>
                  像花園一樣培育您的{' '}
                  <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                    記憶
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/plant" className="w-fit inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                <span className="text-emerald-100 transition-all duration-300 hover:drop-shadow-md">🪴</span> {t.hero.plantFirstMemory}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.features.gentleGrowth.title}</h3>
                <p className="text-gray-600 leading-relaxed">{t.features.gentleGrowth.description}</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🌸</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.features.bloomingConnections.title}</h3>
                <p className="text-gray-600 leading-relaxed">{t.features.bloomingConnections.description}</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🌿</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.features.peacefulSanctuary.title}</h3>
                <p className="text-gray-600 leading-relaxed">{t.features.peacefulSanctuary.description}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl">🧘</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.features.deepReflection.title}</h3>
                <p className="text-gray-600 leading-relaxed">{t.features.deepReflection.description}</p>
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
