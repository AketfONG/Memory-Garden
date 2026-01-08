"use client";
import React from "react";
import Navigation from "./components/Navigation";
import Link from "next/link";
import { PRESET_STACKS } from "./utils/presetStacks";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navigation fullWidth={true} primaryAction={{ text: "Get Started", href: "/get-started", variant: "primary" }} />

      {/* Hero Section */}
      <main className="pt-26">
        <div className="container mx-auto px-6 py-16">
          {/* Hero */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="grid lg:grid-cols-[3fr_2fr] gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Let your cherished memories blossom
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                  Learn more about the people you love most, and preserve their stories and memories for generations.
                </p>
                <Link 
                  href="/get-started" 
                  className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
              <div className="text-center lg:text-right">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-12 border-2 border-emerald-100">
                  <p className="text-4xl font-bold text-emerald-600 mb-2">
                    <span className="text-5xl">Thousands</span>
                  </p>
                  <p className="text-xl text-gray-700 mb-4">of memories preserved</p>
                  <p className="text-gray-600">Trusted by families across Hong Kong</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Memory Cards */}
          <div className="w-full mb-20 py-12 -mx-6 px-6">
            <div className="w-full">
              <div className="marquee relative overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white via-white to-transparent z-10"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white via-white to-transparent z-10"
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
                                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{stack.title}</h3>
                                  <span className="text-xs text-gray-500 ml-2">{stack.vagueTime || stack.startDate}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                                  {stack.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{stack.mediaFiles.length} items</span>
                                  {stack.categories.length > 0 && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                                      {stack.categories[0]}
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
          </div>

          {/* Testimonials */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
                <p className="text-gray-700 italic mb-4">
                  "This has been my favorite gift ever! I laughed, cried, reflected and became more grateful for my life!"
                </p>
                <p className="text-sm text-gray-600">— Elderly user, Hong Kong</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
                <p className="text-gray-700 italic mb-4">
                  "It's wonderful to know my children and future generations will get a feel for who I am rather than just being a name."
                </p>
                <p className="text-sm text-gray-600">— Grandmother, 72</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
                <p className="text-gray-700 italic mb-4">
                  "Receiving these stories was like getting a hug in my email! My teen finally has a safe space to express themselves."
                </p>
                <p className="text-sm text-gray-600">— Parent, Hong Kong</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div id="how-it-works" className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How it works</h2>
            
            <div className="grid lg:grid-cols-2 gap-16 mb-16">
              {/* For Elderly */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">As a gift for elderly</h3>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100">
                  <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">1</div>
                      <h4 className="text-xl font-semibold text-gray-900">Choose memories to revisit</h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      Upload old photos or videos. We'll help select emotionally positive content and prepare gentle questions.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">2</div>
                      <h4 className="text-xl font-semibold text-gray-900">Speak or record stories</h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      They can share in the way that's best for them: speak naturally, record their voice, or have a conversation. No typing required.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-emerald-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">3</div>
                      <h4 className="text-xl font-semibold text-gray-900">Preserve their memories</h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      You'll have their stories in their voice preserved in beautiful memory cards you can read, reread and pass down.
                    </p>
                  </div>
                  </div>
                </div>
              </div>
              
              {/* For Teens */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">For teens</h3>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                  <div className="space-y-8">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">1</div>
                      <h4 className="text-xl font-semibold text-gray-900">Get inspired</h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      Choose prompts that bring your story to life, and we'll keep you motivated with gentle reminders.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">2</div>
                      <h4 className="text-xl font-semibold text-gray-900">Write or record stories</h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      You can share in the way that's best for you: chat with AI, record your voice, or add photos and videos.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 shadow-lg">3</div>
                      <h4 className="text-xl font-semibold text-gray-900">Build your timeline</h4>
                    </div>
                    <p className="text-gray-600 ml-14">
                      After recording your memories, you can see your stories preserved in a beautiful timeline to share and pass down.
                    </p>
                  </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
              
          {/* What's Included */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">What's included?</h2>
                <p className="text-xl text-gray-600 mb-8">
                  Everything you need to create a keepsake memory collection
                </p>
              </div>
              <div className="bg-gray-50 rounded-3xl p-10">
                <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <span className="text-emerald-600 text-2xl mr-4">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Voice-first storytelling</h4>
                    <p className="text-sm text-gray-600">Speak naturally, no typing required</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-600 text-2xl mr-4">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI-guided memory recall</h4>
                    <p className="text-sm text-gray-600">Gentle questions that spark stories</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-600 text-2xl mr-4">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Beautiful memory cards</h4>
                    <p className="text-sm text-gray-600">Stories preserved with photos and tags</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-600 text-2xl mr-4">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Private and secure</h4>
                    <p className="text-sm text-gray-600">Your stories belong to you</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-600 text-2xl mr-4">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Shareable timeline</h4>
                    <p className="text-sm text-gray-600">Share with family when you're ready</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-emerald-600 text-2xl mr-4">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Culturally sensitive</h4>
                    <p className="text-sm text-gray-600">Built for Hong Kong families</p>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Writing or voice, it's their choice</h3>
                <p className="text-gray-600">
                  Some like to write, some like to speak. Easily share stories the way they prefer.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💡</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Find just the right questions</h3>
                <p className="text-gray-600">
                  Choose from our library of culturally-appropriate prompts, or create your own.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Ethical AI at the core</h3>
                <p className="text-gray-600">
                  Built with emotional safety rules: AI is a listener, not a friend. Your privacy is protected.
                </p>
              </div>
            </div>
          </div>

          {/* Sample Questions */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Sample questions</h2>
                <p className="text-gray-600 mb-8">
                  Choose from our library of culturally-appropriate prompts, or create your own personalized questions.
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

                <div className="overflow-x-auto">
                  <div className="flex flex-col gap-6">
                    {/* Row 1 - Slow */}
                    {(() => {
                      const questions = [
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
                        "What tradition from your childhood do you still follow?"
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
                                className="shrink-0 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
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
                      const questions = [
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
                        "What's a song that brings back strong memories?"
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
                                className="shrink-0 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
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
                      const questions = [
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
                        "What's a memory that connects you to your culture?"
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
                                className="shrink-0 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
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

          {/* Trust Section */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Trusted by families</h2>
                <p className="text-lg text-gray-600">
                  We're committed to your privacy, security, and satisfaction. Your stories are yours, always.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">30-day</div>
                <p className="text-gray-600">Money-back guarantee</p>
                </div>
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">No tech</div>
                <p className="text-gray-600">savvy needed</p>
                </div>
              <div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">Your stories</div>
                <p className="text-gray-600">belong to you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Story */}
          <div className="max-w-7xl mx-auto mb-20 pt-20 border-t border-gray-200">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-50 rounded-3xl p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Built by our family, for yours</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  "The idea for Memory Garden came from something simple: we wanted to bridge the emotional support gap in Hong Kong. 
                  We saw elderly experiencing loneliness and teens struggling with emotional expression. 
                  The more stories they shared, the more connected they felt. That's an experience we wanted everyone to be able to have."
                </p>
                <p className="text-gray-600">— Memory Garden Team</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-12 border-2 border-emerald-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>Bridge emotional support gaps in Hong Kong</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>Preserve memories for future generations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>Create safe spaces for emotional expression</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3">✓</span>
                    <span>Build culturally-sensitive solutions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mb-20 pt-20 border-t border-gray-200">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your story starts here</h2>
            <p className="text-xl text-gray-600 mb-8">
              Turn stories into a treasure you'll cherish forever, one conversation at a time.
            </p>
            <Link 
              href="/get-started" 
              className="inline-block bg-gradient-to-b from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-gray-200 py-12">
        <div className="container mx-auto px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-2xl">🌱</span>
              <span className="text-xl font-semibold text-gray-800">Memory Garden</span>
            </div>
            <p className="text-gray-600 mb-2">Bridging emotional support gaps through voice-first memory storytelling.</p>
            <p className="text-sm text-gray-500 mt-4">&copy; 2026 Memory Garden. Built with care for Hong Kong families.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
