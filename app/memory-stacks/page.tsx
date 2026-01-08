"use client";

import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { stackStorage, type MemoryStack as StackData } from "../utils/stackStorage";
import { PRESET_STACKS } from "../utils/presetStacks";

interface MemoryStack {
  id: string;
  title: string;
  count: number;
  date: string;
  preview: string;
  summary?: string;
}

export default function MemoryStacks() {
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [memoryStacks, setMemoryStacks] = useState<MemoryStack[]>([]);

  useEffect(() => {
    // Initialize preset stacks if no stacks exist
    stackStorage.initializePresets(PRESET_STACKS);

    try {
      const stacks: StackData[] = stackStorage.getAllStacks();

      const displayStacks: MemoryStack[] = stacks.map((stack) => {
        // Choose an emoji preview based on category, falling back to a generic icon
        const category = stack.categories?.[0] || stack.customCategory || "";
        let preview = "🖼️";
        if (category === "family") preview = "👨‍👩‍👧‍👦";
        else if (category === "friends") preview = "👥";
        else if (category === "travel" || category === "nature") preview = "✈️";
        else if (category === "achievement" || category === "work") preview = "🏆";
        else if (category === "love") preview = "💕";

        const mediaCount = stack.mediaFiles?.length || 0;

        const dateLabel =
          stack.vagueTime ||
          stack.startDate ||
          (stack.timestamp ? new Date(stack.timestamp).toLocaleDateString() : "");

        return {
          id: stack.id,
          title: stack.title || "Untitled Stack",
          count: mediaCount,
          date: dateLabel || "No date set",
          preview,
          summary: stack.description || "",
        };
      });

      setMemoryStacks(displayStacks);
    } catch (error) {
      console.error("Failed to load stacks:", error);
      setMemoryStacks([]);
    }
  }, []);

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
      "Are you sure you want to remove this memory stack?"
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

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <Navigation
        fullWidth={true}
        primaryAction={{ text: "Back to Home", href: "/", variant: "secondary" }}
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
                    Your Memory Stacks
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Your imported memories are organised into stacks using their photos and dates.
                  </p>
                </div>

                {/* Memory Stacks Grid (scrollable) */}
                <div className="flex-1 overflow-y-auto pr-2">
                  {memoryStacks.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm text-center px-4">
                        No memory stacks yet. Import memories or plant a memory to see them here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {memoryStacks.map((stack) => (
                        <div
                          key={stack.id}
                          onClick={() => handleStackSelect(stack.id)}
                          className={`rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 flex flex-col relative ${
                            selectedStack === stack.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-4xl">{stack.preview}</div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                {stack.count} {stack.count === 1 ? "item" : "items"}
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
                                handleDeleteStack(stack.id);
                              }}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
              <div className="flex flex-col h-full min-h-0">
                {/* Choose Stack Option */}
                <div
                  className={`rounded-3xl p-10 mb-6 border transition-all duration-300 ${
                    selectedStack
                      ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      selectedStack ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    Choose a Stack
                  </h3>
                  <p
                    className={`text-base leading-relaxed mb-6 ${
                      selectedStack ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    Select a memory stack from the left, and AI will ask you questions about it to
                    help you explore and expand those memories.
                  </p>
                  {selectedStack ? (
                    <button
                      onClick={handleStartConversation}
                      className="w-full bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Start Conversation About This Stack
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                    >
                      Start Conversation About This Stack
                    </button>
                  )}
                </div>

                {/* Random Pick Option */}
                <div
                  className={`rounded-3xl p-10 mb-6 border transition-all duration-300 ${
                    selectedStack
                      ? "bg-gray-100 border-gray-200"
                      : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      selectedStack ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    Random Pick
                  </h3>
                  <p
                    className={`text-base leading-relaxed mb-6 ${
                      selectedStack ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Let AI randomly select a memory stack for you. Discover memories you might have
                    forgotten about.
                  </p>
                  {selectedStack ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                    >
                      Pick Random Stack
                    </button>
                  ) : (
                    <button
                      onClick={handleRandomPick}
                      className="w-full bg-gradient-to-b from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Pick Random Stack
                    </button>
                  )}
                </div>

                {/* New Memory Option */}
                <div
                  className={`rounded-3xl p-10 mb-6 border transition-all duration-300 ${
                    selectedStack
                      ? "bg-gray-100 border-gray-200"
                      : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      selectedStack ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    New Memory
                  </h3>
                  <p
                    className={`text-base leading-relaxed mb-6 ${
                      selectedStack ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Create a memory about something that probably happened but wasn't included in
                    your imported media. AI will help you recall and document it.
                  </p>
                  {selectedStack ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                    >
                      Create New Memory
                    </button>
                  ) : (
                    <button
                      onClick={handleNewMemory}
                      className="w-full bg-gradient-to-b from-purple-400 to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Create New Memory
                    </button>
                  )}
                </div>

                {/* Action Buttons - Pushed to bottom */}
                <div className="mt-auto flex gap-5">
                  <Link
                    href="/get-started"
                    className="flex-1 text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    Back
                  </Link>
                  {selectedStack ? (
                    <Link
                      href={`/memory-conversation?type=stack&stack=${selectedStack}`}
                      className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Start Conversation
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="flex-1 text-center bg-gray-300 text-gray-500 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 cursor-not-allowed"
                    >
                      Start Conversation
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


