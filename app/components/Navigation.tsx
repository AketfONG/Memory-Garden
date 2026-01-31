"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

interface NavigationProps {
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  showStartGrowing?: boolean;
  fullWidth?: boolean;
  primaryAction?: {
    text: string;
    href: string;
    variant?: "primary" | "secondary";
  };
}

interface PopupMessage {
  id: number;
  type: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

// Feature flag for the header chatbot. Set to true to re-enable the popup chat.
const NAV_CHAT_ENABLED = false;

export default function Navigation({ 
  showBackButton = false, 
  backButtonText = "Back to Home",
  backButtonHref = "/",
  showStartGrowing = false,
  fullWidth = false,
  primaryAction
}: NavigationProps) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnimating, setMenuAnimating] = useState('none');
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [aiPopupAnimating, setAIPopupAnimating] = useState('none');
  const [aiMessage, setAiMessage] = useState('');
  const [popupMessages, setPopupMessages] = useState<PopupMessage[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = useRef<Element | null>(null);
  const handleLangSwitch = () => {
    if (typeof window !== 'undefined') {
      const message =
        language === 'en'
          ? 'Switching language will clear all saved memories and stacks on this device.\n\nDo you want to continue?'
          : '切換語言會清除此裝置上儲存嘅所有記憶同堆疊。\n\n確定要繼續嗎？';
      const confirmed = window.confirm(message);
      if (!confirmed) return;
    }
    setLanguage(language === 'en' ? 'zh' : 'en');
  };
  const handleMobileToggle = () => {
    if (!mobileOpen) {
      setMobileOpen(true);
      setMenuAnimating('in');
    } else {
      setMobileOpen(false);
      setMenuAnimating('out');
      setTimeout(() => {
        setMenuAnimating('none');
      }, 180);
    }
  };
  const handleAIPopup = () => {
    if (!NAV_CHAT_ENABLED) {
      return;
    }
    if (!showAIPopup) {
      setShowAIPopup(true);
      setAIPopupAnimating('in');
      // Clear previous chat when opening
      setPopupMessages([
        {
          id: 1,
          type: 'assistant',
          content: "Hi! I'm Sprout, your Memory Garden assistant! 🌱 I'm here to help you navigate and make the most of your experience.",
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'assistant',
          content: "I can help you with: • Planting memories • Exploring your garden • Understanding features • Troubleshooting • And much more! What would you like to know?",
          timestamp: new Date()
        }
      ]);
    } else {
      setAIPopupAnimating('out');
      setTimeout(() => {
        setShowAIPopup(false);
        setAIPopupAnimating('none');
      }, 350);
    }
  };

  const handleAIMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiMessage.trim()) {
      // Add user message
      const userMessage: PopupMessage = {
        id: popupMessages.length + 1,
        type: 'user',
        content: aiMessage,
        timestamp: new Date()
      };
      
      setPopupMessages(prev => [...prev, userMessage]);
      const currentMessage = aiMessage;
      setAiMessage('');

      try {
        // Prepare conversation history for LLM (include the new user message)
        const updatedMessages = [...popupMessages, userMessage];
        const conversationHistory = updatedMessages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

        // Call LLM API
        const response = await fetch('/api/nav-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            conversationHistory
          }),
        });

        const result = await response.json();

        if (result.success) {
          const aiResponse: PopupMessage = {
            id: popupMessages.length + 2,
            type: 'assistant',
            content: result.ai_response,
            timestamp: new Date()
          };
          setPopupMessages(prev => [...prev, aiResponse]);
        } else {
          // Fallback response if LLM fails
          const aiResponse: PopupMessage = {
            id: popupMessages.length + 2,
            type: 'assistant',
            content: "I'm having trouble connecting to my AI services right now. I'm here to help you navigate Memory Garden! Ask me about planting memories, viewing your garden, taking a tour, or any other features. 🌱",
            timestamp: new Date()
          };
          setPopupMessages(prev => [...prev, aiResponse]);
        }
      } catch (error) {
        console.error('Navigation chat error:', error);
        // Fallback response
        const aiResponse: PopupMessage = {
          id: popupMessages.length + 2,
          type: 'assistant',
          content: "I'm experiencing some technical difficulties. I'm here to help you navigate Memory Garden! Ask me about planting memories, viewing your garden, taking a tour, or any other features. 🌱",
          timestamp: new Date()
        };
        setPopupMessages(prev => [...prev, aiResponse]);
      }
    }
  };

  useEffect(() => {
    if (!NAV_CHAT_ENABLED || !(showAIPopup || aiPopupAnimating === 'out')) return;
    function handle(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.speech-bubble') && !(e.target as HTMLElement).closest('[aria-label="Open Memory Garden AI"]')) {
        handleAIPopup();
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [showAIPopup, aiPopupAnimating]);

  useEffect(() => {
    if (!(mobileOpen || menuAnimating === 'out')) return;
    function handle(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('[aria-label="Open navigation menu"]') && !(e.target as HTMLElement).closest('[data-mobile-menu]')) {
        setMobileOpen(false);
        setMenuAnimating('out');
        setTimeout(() => {
          setMenuAnimating('none');
        }, 180);
      }
    }
    window.addEventListener('mousedown', handle);
    return () => window.removeEventListener('mousedown', handle);
  }, [mobileOpen, menuAnimating]);

  useEffect(() => {
    // Prevent background scroll when popup is open
    if (NAV_CHAT_ENABLED && (showAIPopup || aiPopupAnimating === 'in')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAIPopup, aiPopupAnimating]);

  // Show nav shadow when content is scrolled (window or page scroll container)
  useEffect(() => {
    const updateScrolled = () => {
      const windowScrolled = typeof window !== "undefined" && window.scrollY > 0;
      const root = scrollRootRef.current;
      const containerScrolled = root ? (root as HTMLElement).scrollTop > 0 : false;
      setIsScrolled(windowScrolled || containerScrolled);
    };
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    const attachScrollRoot = () => {
      const el = document.querySelector("[data-nav-scroll-root]");
      if (el && el !== scrollRootRef.current) {
        scrollRootRef.current?.removeEventListener("scroll", updateScrolled);
        el.addEventListener("scroll", updateScrolled, { passive: true });
        scrollRootRef.current = el;
        updateScrolled();
      }
    };
    attachScrollRoot();
    const t = setTimeout(attachScrollRoot, 250);

    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", updateScrolled);
      scrollRootRef.current?.removeEventListener("scroll", updateScrolled);
      scrollRootRef.current = null;
    };
  }, [pathname]);

  return (
    <header className={`fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-md z-50 w-full transition-shadow duration-300 ${isScrolled ? "shadow-lg" : ""}`}>
      <nav className={`flex items-center justify-between px-6 py-4 h-16 w-full`}>
        <div className="flex items-center space-x-5 relative z-50">
          <Link href="/">
            <button
              type="button"
              className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-lg hover:scale-120 transition-all duration-300 focus:outline-none"
              aria-label="Go to home"
            >
              <span className="text-emerald-600 font-bold text-lg">🌱</span>
            </button>
          </Link>
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-emerald-600 transition-all duration-200 ease-in-out">
            {translations[language].navigation.memoryGarden}
          </Link>
          {NAV_CHAT_ENABLED && (showAIPopup || aiPopupAnimating === 'out') && (
          <div
              className={`absolute left-0 top-full mt-3 z-50 min-w-[390px] max-w-md min-h-[300px] bg-white rounded-[2rem] shadow-2xl border-2 border-emerald-100 p-5 speech-bubble flex flex-col justify-between max-h-[80vh] overflow-hidden ${aiPopupAnimating === 'in' ? 'animate-slide-down' : aiPopupAnimating === 'out' ? 'animate-slide-up' : ''}`}
              onAnimationEnd={() => { if (aiPopupAnimating === 'out') setAIPopupAnimating('none'); }}
              style={{
                maxHeight: 'calc(100vh - 100px)',
                top: 'calc(100% + 12px)'
              }}
            >
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-emerald-600 text-2xl">🌱</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 leading-tight">Sprout</div>
                    <div className="text-xs text-emerald-500 font-medium">Your nurturing companion</div>
                  </div>
                </div>
                
                {/* Scrollable Messages */}
                <div className="h-64 overflow-y-auto overscroll-contain space-y-3 mb-3 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {popupMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                          message.type === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-gray-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chat input box */}
              <form onSubmit={handleAIMessageSubmit} className="mt-3 flex space-x-3">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-gradient-to-b from-emerald-500 to-green-600 text-white w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-8">
          <Link href="/updates" className="md:hidden text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out font-medium">
            v1.0
          </Link>
          <button
            onClick={handleLangSwitch}
            className="md:hidden text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out font-medium bg-transparent border-none outline-none focus:outline-none"
            aria-label="Switch language"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
            onClick={handleMobileToggle}
            aria-label="Open navigation menu"
          >
            <span
              className={`block w-6 h-0.5 bg-black rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-0.5' : 'mb-1'}`}
              style={{}}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-black rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'mb-1'}`}
              style={{}}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-black rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-0.5' : ''}`}
              style={{}}
            ></span>
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/updates" className="text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out font-medium">
            v1.0
          </Link>
          <button
            onClick={handleLangSwitch}
            className="text-gray-600 hover:text-emerald-600 transition-all duration-200 ease-in-out font-medium bg-transparent border-none outline-none focus:outline-none"
            aria-label="Switch language"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>
          {showStartGrowing && (
            <Link href="/plant" className="bg-gradient-to-b from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium">
              {translations[language].navigation.startGrowing}
            </Link>
          )}
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className={
                primaryAction.variant === "primary"
                  ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                  : "border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105 font-medium"
              }
            >
              {primaryAction.text}
            </Link>
          )}
          {showBackButton && (
            <Link href={backButtonHref} className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105 font-medium">
              {translations[language].navigation.backToHome}
            </Link>
          )}
        </div>
        {(mobileOpen || menuAnimating === 'out') && (
          <div
            className={`absolute top-16 left-0 w-full bg-white shadow-lg rounded-b-3xl flex flex-col items-center py-6 space-y-4 z-40 md:hidden ${menuAnimating === 'in' ? 'animate-slide-down' : menuAnimating === 'out' ? 'animate-slide-up' : ''}`}
            onAnimationEnd={() => { 
              if (menuAnimating === 'out') {
                setMenuAnimating('none');
                setMobileOpen(false);
              }
            }}
            ref={menuRef}
            data-mobile-menu
          >
            {showStartGrowing && (
              <Link href="/plant" className="bg-gradient-to-b from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium" onClick={()=>setMobileOpen(false)}>
                {translations[language].navigation.startGrowing}
              </Link>
            )}
            {primaryAction && (
              <Link
                href={primaryAction.href}
                className={
                  primaryAction.variant === "primary"
                    ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                    : "border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105 font-medium"
                }
                onClick={()=>setMobileOpen(false)}
              >
                {primaryAction.text}
              </Link>
            )}
            {showBackButton && (
              <Link href={backButtonHref} className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-6 py-2 rounded-full transition-all duration-300 hover:border-emerald-300 hover:scale-105 font-medium" onClick={()=>setMobileOpen(false)}>
                {translations[language].navigation.backToHome}
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
} 