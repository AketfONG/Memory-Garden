"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { memoryStorage, type SavedMemory, type MemoryMessage } from "../utils/memoryStorage";
import { stackStorage, type MemoryStack as StackData } from "../utils/stackStorage";
import { useLanguage } from "../contexts/LanguageContext";

// Type definitions for Speech Recognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

function MemoryConversationInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "stack"; // stack, random, new
  const stackId = searchParams.get("stack");
  const { language } = useLanguage();
  const [languageReady, setLanguageReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [voiceHints, setVoiceHints] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isMockLoading, setIsMockLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [selectedMemoryStack, setSelectedMemoryStack] = useState<StackData | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const initialGreetingSentRef = useRef(false);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  // Wait until the UI language has been hydrated / stabilised so
  // we don't send an English greeting if the user is actually in Cantonese.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("mg_language");
    if (!stored || stored === language) {
      setLanguageReady(true);
    }
  }, [language]);

  // Helper: format titles like memory stacks (title case, clean spacing, max ~8 words)
  const formatTitleCase = (value: string) => {
    return value
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim().length > 0)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper: fix spacing for Chinese/CJK text (e.g. "藝 廊 開 幕" -> "藝廊開幕")
  const fixCJKSpacing = (value: string): string => {
    if (!value || !/[\u3400-\u9FFF]/.test(value)) return value;
    let cleaned = value;
    const cjkGap = /([\u3400-\u9FFF])\s+([\u3400-\u9FFF])/g;
    while (cjkGap.test(cleaned)) {
      cleaned = cleaned.replace(cjkGap, "$1$2");
    }
    return cleaned;
  };

  const normalizeTitleForCard = (rawTitle: string): string => {
    if (!rawTitle) return "";
    // Collapse multiple spaces and trim
    let cleaned = rawTitle.replace(/\s+/g, " ").trim();
    cleaned = fixCJKSpacing(cleaned);
    // Limit to first 8 words to match stack behaviour (applies mainly to English)
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length > 8) {
      cleaned = words.slice(0, 8).join(" ");
    }
    // Apply title case rules for non-CJK text; CJK characters are unaffected
    return formatTitleCase(cleaned);
  };

  const normalizeSummaryForCard = (rawSummary: string): string => {
    if (!rawSummary) return "";
    let cleaned = rawSummary.replace(/\s+/g, " ").trim();
    cleaned = fixCJKSpacing(cleaned);

    // Avoid lifeless "The user ..." phrasing
    cleaned = cleaned.replace(/^the user\s+/i, "").replace(/^user\s+/i, "");
    cleaned = cleaned.replace(/\bthe user\b/gi, "they");

    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
  };

  // Get page title based on type
  const getPageTitle = () => {
    switch (type) {
      case "random":
        return language === "en" ? "Random Memory Discovery" : "隨機發現一段回憶";
      case "new":
        return language === "en" ? "Create New Memory" : "建立新回憶";
      default:
        return language === "en" ? "Memory Conversation" : "記憶對話";
    }
  };

  // Load selected memory stack
  useEffect(() => {
    if (stackId && (type === "stack" || type === "random")) {
      try {
        const stack = stackStorage.getStack(stackId);
        setSelectedMemoryStack(stack);
      } catch (e) {
        console.error("Failed to load memory stack:", e);
        setSelectedMemoryStack(null);
      }
    } else if (type === "new") {
      setSelectedMemoryStack(null);
    }
  }, [stackId, type]);

  // When coming from a stack (including random pick), use AI to greet the user with a stack-specific question
  useEffect(() => {
    if (
      !languageReady ||
      (type !== "stack" && type !== "random") ||
      !selectedMemoryStack ||
      conversationHistory.length > 0
    ) {
      return;
    }

    // Prevent duplicate greetings in StrictMode / double effects
    if (initialGreetingSentRef.current) return;

    let cancelled = false;

    const generateGreeting = async () => {
      const whenText =
        selectedMemoryStack.vagueTime ||
        selectedMemoryStack.startDate ||
        (selectedMemoryStack.timestamp
          ? new Date(selectedMemoryStack.timestamp).toLocaleDateString()
          : "a meaningful time in your life");

      const categoryText =
        selectedMemoryStack.categories && selectedMemoryStack.categories.length > 0
          ? selectedMemoryStack.categories[0]
          : "";

      const contextText = `Memory stack title: ${
        selectedMemoryStack.title || "Untitled Stack"
      }
When: ${whenText}
Summary: ${selectedMemoryStack.description || "No summary yet"}
Categories: ${(selectedMemoryStack.categories || []).join(", ") || "none"}
Media count: ${selectedMemoryStack.mediaFiles?.length || 0}`;

      const languageHintForGreeting =
        language === "en"
          ? ""
          : "Reply in Cantonese using Traditional Chinese characters, with a warm, natural Hong Kong tone.\n\n";

      const prompt = `
You are Sprout, a warm, active-listener companion in Memory Garden.

Context about the memory stack:
${contextText}

Write exactly ONE short message to the user that:
- briefly greets them
- reflects or acknowledges the kind of memory this is
- ends with a thought-provoking question that helps them start talking about this memory

The message should be 1–2 sentences, friendly, and speak directly to "you".
${languageHintForGreeting}Return ONLY the message text, nothing else.`;

      try {
        setIsAIGenerating(true);
        const response = await fetch("/api/google-ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: prompt,
            conversationHistory: [],
          }),
        });

        let aiGreeting = "";

        if (response.ok && response.body) {
          const reader = response.body.getReader();
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
                if ((parsed.type === "chunk" || parsed.type === "content") && parsed.content) {
                  aiGreeting += parsed.content;
                } else if (parsed.type === "complete" && parsed.content) {
                  aiGreeting += parsed.content;
                }
              } catch {
                // ignore malformed lines
              }
            }
          }
        }

        const finalGreeting = aiGreeting.trim();
        if (!cancelled && finalGreeting) {
          initialGreetingSentRef.current = true;
          setConversationHistory((prev) => [
            ...prev,
            { role: "assistant", content: finalGreeting },
          ]);
        }
      } catch (error) {
        console.error("Error generating initial stack greeting:", error);
      } finally {
        if (!cancelled) {
          setIsAIGenerating(false);
        }
      }
    };

    generateGreeting();

    return () => {
      cancelled = true;
    };
  }, [type, selectedMemoryStack, conversationHistory.length, languageReady]);

  // When creating a new memory, use AI to greet the user with a caring, open journaling question
  useEffect(() => {
    if (!languageReady || type !== "new" || conversationHistory.length > 0) return;

    // Prevent duplicate greetings in StrictMode / double effects
    if (initialGreetingSentRef.current) return;

    let cancelled = false;

    const generateNewMemoryGreeting = async () => {
      const languageHintForNew =
        language === "en"
          ? ""
          : "Reply in Cantonese using Traditional Chinese characters, with a warm, natural Hong Kong tone.\n\n";

      const prompt = `
You are Sprout, a gentle, caring companion in Memory Garden.

The user is starting a brand new memory. They may want to talk about their daily life, mood, or something interesting that happened recently.

Write exactly ONE short message that:
- warmly greets them
- shows that you care about how they're doing
- invites them to share about their day, mood, or a recent moment that felt meaningful
- ends with an open, thought-provoking question

Keep it 1–2 sentences, and speak directly to "you".
${languageHintForNew}Return ONLY the message text, nothing else.`;

      try {
        setIsAIGenerating(true);
        const response = await fetch("/api/google-ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: prompt,
            conversationHistory: [],
          }),
        });

        let aiGreeting = "";

        if (response.ok && response.body) {
          const reader = response.body.getReader();
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
                if ((parsed.type === "chunk" || parsed.type === "content") && parsed.content) {
                  aiGreeting += parsed.content;
                } else if (parsed.type === "complete" && parsed.content) {
                  aiGreeting += parsed.content;
                }
              } catch {
                // ignore malformed lines
              }
            }
          }
        }

        const finalGreeting = aiGreeting.trim();
        if (!cancelled && finalGreeting) {
          initialGreetingSentRef.current = true;
          setConversationHistory((prev) => [
            ...prev,
            { role: "assistant", content: finalGreeting },
          ]);
        }
      } catch (error) {
        console.error("Error generating new-memory greeting:", error);
      } finally {
        if (!cancelled) {
          setIsAIGenerating(false);
        }
      }
    };

    generateNewMemoryGreeting();

    return () => {
      cancelled = true;
    };
  }, [type, conversationHistory.length, languageReady]);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [conversationHistory, transcript, isProcessingText, isAIGenerating, isMockLoading]);

  // Get voice hints based on type and language
  useEffect(() => {
    const hintsEn = {
      stack: [
        "What was happening in this memory?",
        "Who was with you?",
        "How did you feel?",
        "What made this moment special?",
        "Tell me more about this experience",
      ],
      random: [
        "What comes to mind when you see this?",
        "What do you remember about this?",
        "Can you describe what happened?",
        "Who was there with you?",
        "What was the best part?",
      ],
      new: [
        "What memory would you like to share?",
        "When did this happen?",
        "Who was involved?",
        "What made it memorable?",
        "Tell me the story",
      ],
    } as const;

    const hintsZh = {
      stack: [
        "呢段回憶入面發生緊咩事？",
        "當時邊個喺你身邊？",
        "你嗰刻嘅感受係點樣？",
        "咩令到呢一刻咁特別、咁難忘？",
        "可以同我多講少少呢段經歷嗎？",
      ],
      random: [
        "見到呢張相／呢段片，你第一時間諗起咩？",
        "你仲記得當時發生過啲咩？",
        "可以大概形容下當時發生咗咩事嗎？",
        "嗰陣時有啲咩人一齊喺度？",
        "呢件事入面，你最鍾意邊一個部分？",
      ],
      new: [
        "今日你最想分享邊一段回憶？",
        "呢件事大約係幾時發生？",
        "當時仲有邊啲人一齊參與？",
        "咩令到呢件事咁深刻、咁難忘？",
        "不如由頭開始，同我慢慢講呢個故事。",
      ],
    } as const;

    const source = language === "en" ? hintsEn : hintsZh;
    setVoiceHints([...(source[type as keyof typeof source] || source.stack)]);
  }, [type, language]);

  // Initialize speech recognition (and keep its language in sync with UI language)
  useEffect(() => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
      return;
    }

      const SpeechRecognition = (window as any).webkitSpeechRecognition;

    // If we already have an instance, just update its language when UI language changes
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "en" ? "en-US" : "zh-HK";
      return;
    }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
    // Use Cantonese when the interface is in Cantonese, otherwise English
    recognition.lang = language === "en" ? "en-US" : "zh-HK";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event: any) => {
      // Ignore benign errors like "aborted" or "no-speech" so the user
      // doesn't see scary logs when they simply stop or stay silent.
      const code = event?.error;
      if (code !== "aborted" && code !== "no-speech") {
        console.error("Speech recognition error:", code);
      }
      // For silent / aborted sessions, clear any partial transcript
      if (code === "no-speech" || code === "aborted") {
        setTranscript("");
      }
        setIsListening(false);
      };

      recognition.onend = () => {
      // When recognition naturally ends (e.g. after silence), stop "listening"
      // and clear any leftover interim text so the next tap starts fresh.
        setIsListening(false);
      setTranscript("");
      };

      recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("");
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
  };

  // After speech recognition finishes updating `transcript`, send it to AI once user stops talking
  useEffect(() => {
    // If we're not currently listening and we have a non-empty final transcript,
    // treat it like a normal user message
    if (!isListening && transcript.trim()) {
      processUserMessage(transcript.trim());
      setTranscript("");
    }
    // We intentionally depend on `isListening` and `transcript` only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  const handleMockConversation = async () => {
    if (isMockLoading) return;
    setIsMockLoading(true);

    try {
      let contextText = "";

      if (stackId) {
        const stack = stackStorage.getStack(stackId);
        if (stack) {
          const when =
            stack.vagueTime ||
            stack.startDate ||
            (stack.timestamp ? new Date(stack.timestamp).toLocaleDateString() : "unknown time");

          const mediaSummary = stack.mediaFiles?.length
            ? `${stack.mediaFiles.length} media files (e.g. ${stack.mediaFiles
                .slice(0, 3)
                .map((m) => m.name)
                .join(", ")})`
            : "no media files";

          contextText = `Memory stack title: ${stack.title || "Untitled Stack"}
When: ${when}
Summary: ${stack.description || "No summary yet"}
Categories: ${(stack.categories || []).join(", ") || "none"}
Media: ${mediaSummary}`;
        }
      }

      const languageHintForMock =
        language === "en"
          ? ""
          : "Write all messages in Cantonese using Traditional Chinese characters, with a warm, natural Hong Kong tone.\n\n";

      const systemPrompt = `
You are creating a short, gentle mock conversation about a personal memory for an elderly-friendly app.

Context about the memory:
${contextText || "No specific memory context was provided. Use a generic warm memory."}

Return ONLY a JSON array called messages, with 4 to 6 turns, where each item has:
{ "role": "user" | "assistant", "content": "<the message text>" }

The conversation should:
- Feel natural and warm
- Talk specifically about this memory (people, feelings, details)
- Keep each message short (1–2 sentences)
${languageHintForMock}`;

      const response = await fetch("/api/google-ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: systemPrompt,
          conversationHistory: [],
        }),
      });

      const newMessages: Array<{ role: string; content: string }> = [];

      if (response.ok && response.body) {
        const reader = response.body.getReader();
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

                // Clean possible markdown fences
                content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

                const firstBracket = content.indexOf("[");
                const lastBracket = content.lastIndexOf("]");
                if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                  content = content.slice(firstBracket, lastBracket + 1);
                }

                try {
                  const parsedMessages = JSON.parse(content);
                  if (Array.isArray(parsedMessages)) {
                    parsedMessages.forEach((msg) => {
                      if (
                        msg &&
                        (msg.role === "user" || msg.role === "assistant") &&
                        typeof msg.content === "string"
                      ) {
                        newMessages.push({ role: msg.role, content: msg.content });
                      }
                    });
                  }
                } catch (e) {
                  console.warn("Failed to parse mock conversation JSON:", e);
                }
              }
            } catch {
              // ignore malformed lines
            }
          }
        }
      }

      if (!newMessages.length) {
        // Fallback simple conversation
        newMessages.push(
          { role: "user", content: "I remember this moment so clearly." },
          { role: "assistant", content: "Tell me more about what was happening then." },
          {
            role: "user",
            content: "We were together as a family, and it felt very warm and peaceful.",
          },
          {
            role: "assistant",
            content: "That sounds like a very special time. What do you cherish most about it?",
          }
        );
      }

      setConversationHistory(newMessages);
      setTranscript("");
    } catch (error) {
      console.error("Error creating mock conversation:", error);
    } finally {
      setIsMockLoading(false);
    }
  };

  // Core handler for sending a user message (text or speech) to the AI
  const processUserMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isProcessingText) return;

    setIsProcessingText(true);

    // Add user message to conversation history
    const newUserMessage = { role: "user", content: userMessage.trim() };
    setConversationHistory((prev) => [...prev, newUserMessage]);

    try {
      // Get context from base memory if available
      let contextText = "";
      if (stackId) {
        const stack = stackStorage.getStack(stackId);
        if (stack) {
          const when =
            stack.vagueTime ||
            stack.startDate ||
            (stack.timestamp ? new Date(stack.timestamp).toLocaleDateString() : "unknown time");

          const mediaSummary = stack.mediaFiles?.length
            ? `${stack.mediaFiles.length} media files`
            : "no media files";

          contextText = `Memory stack title: ${stack.title || "Untitled Stack"}
When: ${when}
Summary: ${stack.description || "No summary yet"}
Categories: ${(stack.categories || []).join(", ") || "none"}
Media: ${mediaSummary}`;
        }
      }

      // Prepare conversation history for API
      const conversationHistoryForAPI = [
        ...conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: userMessage.trim() },
      ];

      const systemPromptBase =
        type === "new"
          ? `You are a gentle, caring companion helping someone reflect on their daily life, mood, and recent experiences.

For EVERY response you give:
- Start by briefly reflecting or paraphrasing what the user just said (active listening, showing you truly heard them)
- Then add 1–2 short, thoughtful observations or validations (e.g. why this might matter, what it says about them, what feelings might be present)
- Finish with exactly ONE open, thought-provoking question about their day, feelings, or a recent moment they mentioned
- Aim for about 2–4 sentences total
- Speak directly to \"you\"
Always end your message with the question.`
          : contextText
        ? `You are a gentle, caring companion helping someone explore their memories. 

Context about the memory they're discussing:
${contextText}

For EVERY response you give:
- Start by briefly reflecting or paraphrasing what the user just said (active listening, showing you truly heard them)
- Then add 1–2 short, thoughtful observations or gentle insights about this memory (e.g. what it might mean, what emotions are present, why it might be important)
- Finish with exactly ONE open, thought-provoking question that helps them go a bit deeper into this memory
- Aim for about 2–4 sentences total
- Speak directly to \"you\"
Always end your message with the question.`
          : `You are a gentle, caring companion helping someone explore their memories.

For EVERY response you give:
- Start by briefly reflecting or paraphrasing what the user just said (active listening, showing you truly heard them)
- Then add 1–2 short, thoughtful observations or gentle insights about this memory (e.g. what it might mean, what emotions are present, why it might be important)
- Finish with exactly ONE open, thought-provoking question that helps them go a bit deeper into this memory
- Aim for about 2–4 sentences total
- Speak directly to \"you\"
Always end your message with the question.`;

      const systemPrompt =
        language === "en"
          ? systemPromptBase
          : `${systemPromptBase}

IMPORTANT LANGUAGE INSTRUCTION:
- Reply in Cantonese, using Traditional Chinese characters.
- Use a warm, natural tone that feels like a caring Hong Kong friend chatting in Cantonese.`;

      // Call AI API – instructing it via the message content to behave as an active listener
      const response = await fetch("/api/google-ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${systemPrompt}

User just said:
"${userMessage.trim()}"

Respond with exactly ONE short message that follows the rules above. Return ONLY the message text.`,
          conversationHistory: conversationHistoryForAPI,
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let aiResponse = "";

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
              if (parsed.type === "content" && parsed.content) {
                aiResponse += parsed.content;
              } else if (parsed.type === "complete" && parsed.content) {
                aiResponse += parsed.content;
              }
            } catch {
              // ignore malformed lines
            }
          }
        }

        if (aiResponse.trim()) {
          // Add AI response to conversation history
          setConversationHistory((prev) => [
            ...prev,
            { role: "assistant", content: aiResponse.trim() },
          ]);
        }
      }
    } catch (error) {
      console.error("Error processing text input:", error);
      // Add error message to conversation
      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
              content:
                language === "en"
                  ? "I'm sorry, I couldn't process that. Could you try again?"
                  : "唔好意思，啱啱嗰句我未能成功處理，可以再試講多一次嗎？",
        },
      ]);
    } finally {
      setIsProcessingText(false);
    }
  };

  // Handle text input submission
  const handleTextInput = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = textInput.trim();
    if (!message) return;
    setTextInput("");
    await processUserMessage(message);
  };

  // Create a simple summary from the conversation history
  const createConversationSummary = () => {
    const allMessages = [
      ...conversationHistory.map((m) => m.content),
      transcript.trim() ? transcript.trim() : "",
    ].filter(Boolean);

    if (allMessages.length === 0) {
      return "A warm conversation about your memories.";
    }

    const fullText = allMessages.join(" ");
    const maxLength = 260;
    return fullText.length > maxLength ? `${fullText.slice(0, maxLength)}...` : fullText;
  };

  const handleSaveMemory = async () => {
    if (isSaving) return;
    
    // Check if there's any **user** conversation content before saving
    // (assistant greetings/questions alone should NOT count as content)
    const hasContent =
      conversationHistory.some(
        (m) => m.role === "user" && m.content && m.content.trim().length > 0
      ) ||
      (transcript && transcript.trim().length > 0);

    // If there's NO conversation:
    if (!hasContent) {
      // Case 1: Coming from a stack (or random stack) – create a memory card directly from the stack (including its images)
      if (stackId && (type === "stack" || type === "random")) {
        try {
          const stack = stackStorage.getStack(stackId);
          if (!stack) {
            console.warn("No stack found for stackId when saving memory without conversation.");
            if (typeof window !== "undefined") {
              window.location.href = "/memory-garden";
            }
            return;
          }

          // Build memory data directly from the stack
          const memoryData = {
            title: stack.title || "New Memory",
            description: stack.description || "",
            startDate: stack.startDate || "",
            startTime: stack.startTime || "",
            endDate: stack.endDate || "",
            endTime: stack.endTime || "",
            vagueTime: stack.vagueTime || "",
            categories: stack.categories || [],
            customCategory: stack.customCategory || "",
            customEmotion: stack.customEmotion || "",
            tags: stack.tags || "",
            mediaFiles: stack.mediaFiles || [],
            mode: "simple" as const,
            timestamp: new Date().toISOString(),
          };

          // Save memory with empty chat history and no AI insights
          const memoryId = memoryStorage.saveMemory(memoryData, [], "");

          // Copy any stored stack images into the new memory's image storage
          if (typeof window !== "undefined") {
            try {
              const stackImageStorageKey = `stack_images_${stackId}`;
              const memoryImageStorageKey = `memory_images_${memoryId}`;
              const storedStackImages = localStorage.getItem(stackImageStorageKey);
              if (storedStackImages) {
                localStorage.setItem(memoryImageStorageKey, storedStackImages);
              }
            } catch (e) {
              console.error("Error copying stack images to memory:", e);
            }
          }

          if (typeof window !== "undefined") {
            window.location.href = "/memory-garden";
          }
          return;
        } catch (e) {
          console.error("Error saving direct memory from stack:", e);
          if (typeof window !== "undefined") {
            window.location.href = "/memory-garden";
          }
          return;
        }
      }

      // Case 2: New memory with no input – do NOT create a card, just go back
      if (typeof window !== "undefined") {
        window.location.href = "/memory-garden";
      }
      return;
    }
    
    setIsSaving(true);

    try {
      const fallbackSummary = createConversationSummary();

      const now = new Date();
      const chatHistory: MemoryMessage[] = [
        ...conversationHistory.map((msg, index) => ({
          id: index,
          type: msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: msg.content,
          timestamp: now,
        })),
        ...(transcript.trim()
          ? [
              {
                id: conversationHistory.length,
                type: "user" as const,
                content: transcript.trim(),
                timestamp: now,
              },
            ]
          : []),
      ];

      let baseMemory: SavedMemory | null = null;
      if (stackId && type === "stack") {
        try {
          baseMemory = memoryStorage.getMemory(stackId);
        } catch (e) {
          console.error("Failed to load base memory for stack:", e);
        }
      }

      // Build conversation text for AI summarization
      // Filter out initial greetings and focus on actual user content
      const allUserMessages = [
        ...conversationHistory.filter((m) => m.role === "user").map((m) => m.content),
        transcript.trim() ? transcript.trim() : "",
      ].filter(Boolean);
      
      const assistantMessages = conversationHistory
        .filter((m) => m.role === "assistant")
        .map((m) => m.content);
      
      // Build conversation text with user messages and relevant assistant responses (skip first greeting)
      let conversationText = "";
      if (allUserMessages.length > 0) {
        const conversationParts: string[] = [];
        
        // Add user messages
        allUserMessages.forEach((msg) => {
          conversationParts.push(`User: ${msg}`);
        });
        
        // Add assistant responses (skip the first one which is usually the greeting)
        if (assistantMessages.length > 1) {
          assistantMessages.slice(1).forEach((msg) => {
            conversationParts.push(`Assistant: ${msg}`);
          });
        }
        
        conversationText = conversationParts.join("\n").slice(0, 1500);
      }

      // Build context for AI (stack-based or new memory)
      let contextText = "";
      if (stackId) {
        const stack = stackStorage.getStack(stackId);
        if (stack) {
          const when =
            stack.vagueTime ||
            stack.startDate ||
            (stack.timestamp ? new Date(stack.timestamp).toLocaleDateString() : "unknown time");

          const mediaSummary = stack.mediaFiles?.length
            ? `${stack.mediaFiles.length} media files`
            : "no media files";

          contextText = `Memory stack title: ${stack.title || "Untitled Stack"}
When: ${when}
Summary: ${stack.description || "No summary yet"}
Categories: ${(stack.categories || []).join(", ") || "none"}
Media: ${mediaSummary}`;
        }
      }

      // Ask AI (GPT-4o-mini via Replicate) to generate a title, summary, and tags for the memory card
      let generatedTitle = baseMemory?.title || (stackId ? "New Memory From Stack" : "New Memory");
      let generatedSummary = fallbackSummary;
      // Start with any existing tags, but we will prefer fresh AI-generated tags
      let generatedTags = baseMemory?.tags || "";

      try {
        // Only generate summary if there's actual user content
        console.log("Conversation text for summary:", conversationText);
        console.log("User messages count:", allUserMessages.length);
        
        if (!conversationText || conversationText.trim().length === 0) {
          // If no user content, use a generic summary and leave tags empty
          console.log("No conversation text, using fallback");
          generatedTitle = "New Memory";
          generatedSummary = "A moment you wanted to remember.";
          generatedTags = "";
        } else {
          const languageRuleForSummary =
            language === "en"
              ? "- Write the title, summary, and tags in natural, warm English."
              : "- 用自然、溫暖嘅廣東話（繁體中文）去寫標題、摘要同標籤，用貼近香港人語氣。";

          const summaryPrompt = `
You are Sprout, a gentle, reflective companion in Memory Garden.

${contextText ? `Context about the memory:\n${contextText}\n` : ""}

Here is the conversation between the user and Sprout (assistant):
\"\"\" 
${conversationText}
\"\"\"

IMPORTANT: Create a memory card summary based on what the USER actually shared, NOT the assistant's questions or greetings.

Based on the user's words, create a concise memory card description with this exact JSON shape:
{
  "title": "<short warm title (3-8 words) that captures the essence of what the user shared>",
              "summary": "<1-3 sentence summary describing what this memory is about based on the person's words, written as a warm narrative. Do NOT use phrases like 'the user' or 'you'; instead, describe them naturally (e.g. 'They...', 'This memory captures...'). Do NOT repeat the assistant's questions>",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- The title should reflect what the user actually shared, not generic greetings
- The summary should describe the memory content based on user input, not assistant prompts
- Do NOT include backticks or markdown, only return the JSON object
- Choose tags that are short, lowercase phrases (e.g. "family", "childhood", "holiday", "gratitude")
- If the user only shared minimal information, create a simple but meaningful summary
- ${languageRuleForSummary}
`;

          // Use the non-streaming stack-summarize API (Replicate GPT-4o-mini) for robust parsing
          const summaryResponse = await fetch("/api/stack-summarize", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
              prompt: summaryPrompt,
                }),
              });

          if (summaryResponse.ok) {
            const data = await summaryResponse.json();
            console.log("Conversation stack-summarize result:", data);

            if (data.success) {
              if (data.title && typeof data.title === "string" && data.title.trim().length > 0) {
                generatedTitle = data.title.trim();
              }
              if (data.summary && typeof data.summary === "string" && data.summary.trim().length > 0) {
                generatedSummary = normalizeSummaryForCard(data.summary);
              }
              if (Array.isArray(data.tags)) {
                // Normalise and keep ONLY the tags the AI actually generated
                let tagsArr = data.tags
                  .filter((t: unknown) => typeof t === "string" && t.trim().length > 0)
                  .map((t: string) => t.trim().toLowerCase());

                // Truncate if there are too many (max 3 for UI)
                if (tagsArr.length > 3) {
                  tagsArr = tagsArr.slice(0, 3);
                }

                generatedTags = tagsArr.join(", ");
                  }
                } else {
              console.error("Conversation stack-summarize error:", data.error || data.details);
              generatedTitle = "New Memory";
              generatedSummary = "A moment you wanted to remember.";
              generatedTags = "";
                }
              } else {
            const errorText = await summaryResponse.text().catch(() => "Unknown error");
            console.error("Conversation stack-summarize HTTP error:", summaryResponse.status, errorText);
            generatedTitle = "New Memory";
            generatedSummary = "A moment you wanted to remember.";
            generatedTags = "";
          }
        }
      } catch (summaryError) {
        console.error("Error generating AI summary/title/tags:", summaryError);
        // Fallback on error – use simple, neutral summary and derive tags from content
        generatedTitle = "New Memory";
        generatedSummary = "A moment you wanted to remember.";
        generatedTags = "";
      }

      // After AI call, normalize title and tags for storage/display
      if (generatedTitle) {
        generatedTitle = normalizeTitleForCard(generatedTitle);
      }
      // Ensure we end up with at least one meaningful, content-based tag
      const buildHeuristicTags = (): string => {
        const source =
          (generatedSummary ||
            fallbackSummary ||
            contextText ||
            conversationText ||
            generatedTitle ||
            "").toLowerCase();

        // High-priority multi-word phrases to preserve as-is when present
        const phraseCandidates = ["secondary school", "primary school", "high school", "mainland", "hong kong"];
        const phrases: string[] = [];
        for (const phrase of phraseCandidates) {
          if (source.includes(phrase) && !phrases.includes(phrase)) {
            phrases.push(phrase);
          }
        }

        const stopwords = new Set([
          "the",
          "and",
          "with",
          "this",
          "that",
          "from",
          "about",
          "your",
          "their",
          "for",
          "into",
          "over",
          "under",
          "around",
          "very",
          "really",
          "just",
          "been",
          "being",
          "have",
          "has",
          "had",
          "was",
          "were",
          "are",
          "is",
          "a",
          "an",
          "of",
          "in",
          "on",
          "at",
          "to",
          "it",
          "as",
          "up",
          "out",
          "by",
        ]);

        const words = source
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 3 && !stopwords.has(w));

        const unique: string[] = [...phrases];
        for (const w of words) {
          if (!unique.includes(w)) {
            unique.push(w);
            if (unique.length >= 3) break;
          }
        }
        return unique.join(", ");
      };

      if (generatedTags) {
        // Final normalisation: lower-case, trim, cap at 3 tags
        let tagsArr = generatedTags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0);

        if (tagsArr.length > 3) {
          tagsArr = tagsArr.slice(0, 3);
        }

        generatedTags = tagsArr.join(", ");
      }

      if (!generatedTags || !generatedTags.trim()) {
        // As a final fallback, derive 1–3 tags from the actual content
        generatedTags = buildHeuristicTags();
      }

      // Check for images from memory stack first, then base memory
      let existingImages: Array<{ name: string; type: string; size: number; data: string }> = [];
      
      // Priority 1: Check for stack images (from get-started page)
      if (stackId && typeof window !== "undefined") {
        try {
          const stackImageStorageKey = `stack_images_${stackId}`;
          const storedStackImages = localStorage.getItem(stackImageStorageKey);
          if (storedStackImages) {
            const parsedStackImages = JSON.parse(storedStackImages);
            if (Array.isArray(parsedStackImages) && parsedStackImages.length > 0) {
              existingImages = parsedStackImages
                .filter((img: any) => img && img.data)
                .map((img: { data: string; name?: string }) => {
                  const base64Data = img.data.includes(",")
                    ? img.data.split(",")[1]
                    : img.data;
                  return {
                    name: img.name || `stack-image-${Date.now()}.png`,
                    type: "image/png",
                    size: Math.floor((base64Data.length * 3) / 4),
                    data: base64Data,
                  };
                });
              console.log(`Found ${existingImages.length} images from stack`);
            }
          }
        } catch (e) {
          console.error("Error loading stack images:", e);
        }
      }
      
      // Priority 2: Check for base memory images if no stack images found
      if (existingImages.length === 0) {
      const existingImageFiles = (baseMemory?.mediaFiles || []).filter((file) =>
        file.type.startsWith("image")
      );
      
      if (existingImageFiles.length > 0 && stackId && typeof window !== "undefined") {
        try {
          const baseImageStorageKey = `memory_images_${stackId}`;
          const storedImages = localStorage.getItem(baseImageStorageKey);
          if (storedImages) {
            const parsedImages = JSON.parse(storedImages);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              existingImages = parsedImages
                .filter((img: any) => img && img.data)
                .map((img: { data: string; name?: string }) => {
                  const base64Data = img.data.includes(",")
                    ? img.data.split(",")[1]
                    : img.data;
                  return {
                    name: img.name || `existing-image-${Date.now()}.png`,
                    type: "image/png",
                    size: Math.floor((base64Data.length * 3) / 4),
                    data: base64Data,
                  };
                });
                console.log(`Found ${existingImages.length} images from base memory`);
            }
          }
        } catch (e) {
            console.error("Error loading base memory images:", e);
          }
        }
      }

      // Only use existing images from the originating stack/base memory.
      // We no longer auto-generate new images here; users can generate images later from the Memory Garden cards.
      const imagesToUse = existingImages;
      console.log(`Images to use when saving memory: ${imagesToUse.length} (existing only, no auto-generation)`);
      
      // Keep original media files; do not append generated ones.
      const allMediaFiles = baseMemory?.mediaFiles || [];

      const memoryData = {
        title: generatedTitle,
        description: generatedSummary,
        startDate: baseMemory?.startDate || "",
        startTime: baseMemory?.startTime || "",
        endDate: baseMemory?.endDate || "",
        endTime: baseMemory?.endTime || "",
        vagueTime: baseMemory?.vagueTime || "",
        categories: baseMemory?.categories || [],
        customCategory: baseMemory?.customCategory || "",
        customEmotion: baseMemory?.customEmotion || "",
        tags: generatedTags || "",
        mediaFiles: allMediaFiles,
        mode: baseMemory?.mode || "simple",
        timestamp: new Date().toISOString(),
      };

      // Save memory to get the ID
      const memoryId = memoryStorage.saveMemory(memoryData, chatHistory, "");

      // Store image data in localStorage with memory ID (existing images only; generation happens later from cards)
      if (typeof window !== "undefined") {
        const imageStorageKey = `memory_images_${memoryId}`;
        
        if (imagesToUse.length > 0) {
          const imagesToStore = imagesToUse.map((img) => ({
            name: img.name,
            data: img.data,
          }));
          localStorage.setItem(
            imageStorageKey,
            JSON.stringify(imagesToStore)
          );
          console.log(`Saved ${imagesToStore.length} images for memory ${memoryId}`);
        } else {
          console.warn(`No images to save for memory ${memoryId}. Existing: ${existingImages.length}, Has conversation: ${conversationHistory.length > 0}`);
        }
      }

      if (typeof window !== "undefined") {
        window.location.href = "/memory-garden";
      }
    } catch (error) {
      console.error("Error saving memory from conversation:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/memory-garden";
      }
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="h-full w-full">
            <div className="grid lg:grid-cols-2 gap-12 h-full w-full">
              {/* Left Column - Voice Input */}
              <div className="hidden lg:flex flex-col h-full">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {getPageTitle()}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {language === "en"
                      ? "Speak freely about your memories. AI will listen and help you explore them."
                      : "可以自由咁講你嘅回憶，Sprout 會細心聽你分享，同你一齊探索入面嘅意義。"}
                  </p>
                </div>

                {/* Selected Memory Stack Info */}
                {(selectedMemoryStack || type === "new") && (
                  <div
                    className={`mb-6 rounded-[2rem] p-6 border-2 transition-all duration-300 ${
                      type === "new"
                        ? "border-purple-200 bg-purple-50"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    {type === "new" ? (
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                            🔮
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {language === "en" ? "New Memory" : "新回憶"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {language === "en" ? "Creating a fresh memory" : "建立一段全新、未曾記錄嘅回憶"}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {language === "en"
                            ? "Share a memory that wasn't captured in your uploaded media. Tell us about a moment you'd like to preserve."
                            : "分享一段未曾喺相片或影片入面記錄低嘅回憶，可以係你想好好保存、唔想忘記嘅一個時刻。"}
                        </p>
                      </div>
                    ) : selectedMemoryStack ? (
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                            {(() => {
                              const category =
                                selectedMemoryStack.categories?.[0] ||
                                selectedMemoryStack.customCategory ||
                                "";
                              if (category === "family") return "👨‍👩‍👧‍👦";
                              if (category === "friends") return "👥";
                              if (category === "travel" || category === "nature") return "✈️";
                              if (category === "achievement" || category === "work") return "🏆";
                              if (category === "love") return "💕";
                              return "🖼️";
                            })()}
                          </div>
                          <div className="flex-1">
                            {(() => {
                              // Localised labels for demo stacks when viewing in Cantonese
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

                              const zh = demoLocale[selectedMemoryStack.title];
                              const displayTitle =
                                language === "en" || !zh
                                  ? selectedMemoryStack.title ||
                                    (language === "en" ? "Untitled Memory" : "未命名回憶")
                                  : zh.titleZh;

                              // Prefer concrete dates over vague labels like "Last summer"
                              let dateLabel = "";
                              if (selectedMemoryStack.startDate) {
                                dateLabel = selectedMemoryStack.startDate;
                              } else if (selectedMemoryStack.timestamp) {
                                dateLabel = new Date(
                                  selectedMemoryStack.timestamp
                                ).toLocaleDateString();
                              } else if (selectedMemoryStack.vagueTime) {
                                dateLabel = selectedMemoryStack.vagueTime;
                              } else {
                                dateLabel = language === "en" ? "No date" : "未有日期";
                              }

                              return (
                                <>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {displayTitle}
                                  </h3>
                            <p className="text-sm text-gray-600">
                                    {dateLabel}
                                    {selectedMemoryStack.mediaFiles?.length
                                      ? language === "en"
                                        ? ` • ${selectedMemoryStack.mediaFiles.length} media`
                                        : ` • ${selectedMemoryStack.mediaFiles.length} 個媒體`
                                      : ""}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        {(() => {
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

                          const zh = demoLocale[selectedMemoryStack.title];
                          const displayDescription =
                            language === "en" || !zh
                              ? selectedMemoryStack.description
                              : zh.descriptionZh;

                          return selectedMemoryStack.description ? (
                          <p className="text-gray-700 text-sm leading-relaxed mt-2">
                              {displayDescription}
                          </p>
                          ) : null;
                        })()}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Voice Input Area */}
                <div className="flex-1 flex flex-col">
                  {/* Voice Hints */}
                  <div className="hidden lg:block bg-gradient-to-br from-emerald-50 to-green-50 rounded-[2rem] p-8 mb-6 border-2 border-emerald-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {language === "en"
                        ? "💡 You can say things like:"
                        : "💡 你可以咁樣開始講："}
                    </h3>
                    <div className="space-y-2">
                      {voiceHints.map((hint, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-emerald-600 mr-3">•</span>
                          <p className="text-gray-700 text-base">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Voice Control Button */}
                  <div className="flex-1 flex items-center justify-center">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isListening
                          ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                          : "bg-gradient-to-b from-emerald-500 to-green-600 text-white hover:scale-105"
                      }`}
                    >
                      {isListening ? "⏹️" : "🎤"}
                    </button>
                  </div>

                  {/* Status */}
                  <div className="hidden lg:block text-center mt-6">
                    <p className="text-lg font-semibold text-gray-700">
                      {isListening ? (
                        <span className="text-red-600">
                          {language === "en"
                            ? "● Listening... Speak now"
                            : "● 聽緊你講說話，可以開始分享喇"}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {language === "en"
                            ? "Click the microphone to start"
                            : "撳一下咪高峰就可以開始講喇"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Transcription */}
              <div className="flex flex-col h-full min-h-0">
                <div className="hidden lg:flex mb-8 flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {language === "en" ? "Your Conversation" : "你同 Sprout 嘅對話"}
                    </h2>
                    <p className="text-gray-600">
                      {language === "en"
                        ? "See what you've said and continue the conversation"
                        : "睇返之前講過啲咩，繼續慢慢傾落去。"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMockConversation}
                    disabled={isMockLoading}
                    className="inline-flex items-center justify-center px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isMockLoading
                      ? language === "en"
                        ? "Creating mock conversation..."
                        : "正為你建立示範對話⋯⋯"
                      : language === "en"
                      ? "▶ Mock Conversation"
                      : "▶ 示範對話"}
                  </button>
                </div>

                {/* Transcription Display */}
                <div className="flex-1 bg-white rounded-[2rem] shadow-xl border-2 border-emerald-100 overflow-hidden mb-6 flex flex-col">
                  {/* Chat Header */}
                  <div className="bg-white p-6 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-base">🌱</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">Sprout</h3>
                        <p className="text-xs text-emerald-500 font-medium">
                          {language === "en" ? "Your nurturing companion" : "陪你慢慢整理回憶嘅小夥伴"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white min-h-0">
                    {conversationHistory.length === 0 && !transcript ? (
                      <div className="h-full flex flex-col justify-center">
                        <p className="text-gray-400 text-center mb-6">
                          {language === "en" ? (
                            <>
                              Your conversation will appear here.
                              <br />
                          Start speaking or use the mock conversation to see an example.
                            </>
                          ) : (
                            <>
                              你同 Sprout 嘅對話會顯示喺呢度。
                              <br />
                              可以開始講說話，或者用示範對話睇下個例子。
                            </>
                          )}
                        </p>
                        <div className="bg-white rounded-[2rem] p-6 border-2 border-dashed border-gray-300">
                          <div className="flex items-center mb-2">
                            <span className="text-gray-400 font-semibold mr-2">
                              {language === "en" ? "Example:" : "示例："}
                            </span>
                            <span className="text-xs text-gray-400">
                              {language === "en" ? "Preview" : "預覽"}
                            </span>
                          </div>
                          <p className="text-gray-500 leading-relaxed italic">
                            {language === "en"
                              ? type === "new"
                              ? "This is a memory about a special moment that happened last year. We were all together celebrating..."
                              : type === "random"
                              ? "I remember this day so clearly. It was one of those perfect moments where everything just felt right..."
                                : "This memory brings back such warm feelings. I can still remember the sounds, the smells, and the joy we all felt..."
                              : type === "new"
                              ? "呢段回憶可能係上年發生過一個特別時刻，大家一齊慶祝、好熱鬧好開心⋯⋯"
                              : type === "random"
                              ? "我仲好記得嗰一日，好多細節仲歷歷在目，成個氣氛都令人覺得好舒服⋯⋯"
                              : "呢段回憶帶返好多暖笠笠嘅感覺，好似仲聽到當時嘅聲音同聞到嗰陣味道⋯⋯"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversationHistory.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs px-4 py-3 rounded-2xl ${
                                message.role === "user"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-emerald-50 text-gray-800"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                          </div>
                        ))}
                        {transcript && (
                          <div className="flex justify-end">
                            <div className="max-w-xs px-4 py-3 rounded-2xl bg-emerald-600 text-white">
                              <p className="text-sm leading-relaxed italic">{transcript}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Loading indicator for AI response */}
                    {(isProcessingText || isAIGenerating || isMockLoading) && (
                      <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-3 rounded-2xl bg-emerald-50 text-gray-800">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                            <p className="text-sm">
                              {language === "en" ? "Sprout is thinking..." : "Sprout 諗緊點樣回應你⋯⋯"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-6 flex-shrink-0">
                    <form onSubmit={handleTextInput} className="flex space-x-3">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={language === "en" ? "Type a message..." : "打字同 Sprout 傾計⋯⋯"}
                        className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500 bg-white"
                        disabled={isProcessingText || isListening}
                      />
                      {/* Mobile Voice Button - Integrated into chat input */}
                      <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`lg:hidden w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-lg ${
                          isListening
                            ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                            : "bg-gradient-to-b from-emerald-500 to-green-600 text-white hover:scale-105"
                        }`}
                      >
                        {isListening ? "⏹️" : "🎤"}
                      </button>
                      <button
                        type="submit"
                        disabled={!textInput.trim() || isProcessingText || isListening}
                        className="bg-gradient-to-b from-emerald-500 to-green-600 text-white w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </form>
                    {/* Mobile Voice Status Text */}
                    <div className="lg:hidden text-center mt-3">
                      <p className="text-xs font-semibold">
                        {isListening ? (
                          <span className="text-red-600">
                            {language === "en"
                              ? "● Listening..."
                              : "● 聽緊你講說話"}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            {language === "en"
                              ? "Tap microphone to speak"
                              : "點擊咪高峰開始講"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Pushed to bottom */}
                <div className="mt-auto flex gap-5">
                  <Link
                    href="/memory-stacks"
                    className="flex-1 text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    {language === "en" ? "Back" : "返回堆疊列表"}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSaveMemory}
                    disabled={isSaving}
                    className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSaving
                      ? language === "en"
                        ? "Saving Memory..."
                        : "儲存緊記憶⋯⋯"
                      : language === "en"
                      ? "Save Memory"
                      : "儲存呢段回憶"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function MemoryConversation() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
      <MemoryConversationInner />
    </Suspense>
  );
}
