"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import { memoryStorage, MemoryMessage } from "../utils/memoryStorage";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper function to generate unique IDs
const generateMessageId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function MemoryVoicePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const messagesRef = useRef<Message[]>([]);

  // Helper function to update both ref and state
  const updateMessages = (updater: (prev: Message[]) => Message[]) => {
    setMessages(prev => {
      const updated = updater(prev);
      messagesRef.current = updated;
      return updated;
    });
  };

  useEffect(() => {
    setMounted(true);
    
    // Initialize Speech Recognition (Web Speech API)
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognitionInstance.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript || interimTranscript);
          
          if (finalTranscript) {
            handleVoiceMessage(finalTranscript.trim());
            setTranscript('');
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'no-speech') {
            setError('No speech detected. Please try again.');
          } else if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access.');
          } else {
            setError(`Speech recognition error: ${event.error}`);
          }
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
        recognitionRef.current = recognitionInstance;

        // Initialize welcome message only if messages array is empty
        updateMessages(prev => {
          if (prev.length === 0) {
            return [{
              id: generateMessageId(),
              type: 'assistant' as const,
              content: "Hi! I'm Sprout, your voice companion. 🌱 Click the microphone button to start talking to me about your memories. I'm here to listen and help you reflect on your journey.",
              timestamp: new Date()
            }];
          }
          return prev; // Keep existing messages
        });
      } else {
        setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        setSpeechSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    // Keep chat container at top on initial load
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
    // Reset the initial load flag after a delay to ensure page is rendered
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Removed auto-scroll on message updates to prevent page scrolling
  // useEffect(() => {
  //   // Only scroll to bottom for subsequent message updates (not on initial load)
  //   if (!isInitialLoadRef.current) {
  //     scrollToBottom();
  //   }
  // }, [messages]);

  // const scrollToBottom = () => {
  //   // Only scroll if it's not the initial load
  //   if (isInitialLoadRef.current) {
  //     return;
  //   }
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      // Stop any ongoing speech when starting to listen
      try {
        const synth = speechSynthesis || (typeof window !== 'undefined' ? window.speechSynthesis : null);
        if (synth) {
          try {
            synth.cancel();
          } catch (cancelError) {
            // Ignore cancel errors
            console.warn('Error canceling speech:', cancelError);
          }
          setIsSpeaking(false);
        }
      } catch (error) {
        console.error('Error stopping speech:', error);
        setIsSpeaking(false);
      }
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    stopListening();
    setIsProcessing(true);

    // Generate unique IDs
    const userMessageId = generateMessageId();
    const assistantMessageId = generateMessageId();

    // Add user message and get conversation history using ref for latest state
    const userMessage: Message = {
      id: userMessageId,
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    // Use ref to get latest messages, then update both ref and state
    const currentMessages = messagesRef.current;
    const updatedMessages = [...currentMessages, userMessage];
    messagesRef.current = updatedMessages;
    updateMessages(() => updatedMessages);

    const conversationHistory = updatedMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    try {
      // Call Google AI streaming API
      const response = await fetch('/api/google-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to get AI response';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.details || errorMessage;
        } catch (e) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      // Create placeholder assistant message for streaming
      const assistantMessage: Message = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };

      // Add assistant message to existing messages (don't clear chat)
      updateMessages(prev => {
        // Check if we already have this placeholder message
        const hasPlaceholder = prev.some(msg => msg.id === assistantMessageId && msg.content === '');
        if (hasPlaceholder) {
          return prev;
        }
        return [...prev, assistantMessage];
      });

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'chunk' && data.content) {
              fullResponse += data.content;
              // Update the message in real-time
              updateMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullResponse }
                    : msg
                )
              );
            } else if (data.type === 'complete' && data.content) {
              fullResponse = data.content;
              updateMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullResponse }
                    : msg
                )
              );
              // Don't speak here - will speak after stream ends to avoid duplicates
            } else if (data.type === 'error') {
              // Remove only the placeholder assistant message on error, keep all other messages
              updateMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
              throw new Error(data.error || 'Unknown error');
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            console.warn('Failed to parse chunk:', line);
          }
        }
      }

      // Ensure final message is set and speak the response once
      if (fullResponse && fullResponse.trim()) {
        updateMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
        // Speak the response once after stream completes
        // Use a small delay to ensure state is updated
        setTimeout(() => {
          speakText(fullResponse);
        }, 200);
      }
    } catch (error) {
      console.error('Error processing voice message:', error);
      // Remove only the placeholder assistant message if it was added, keep all other messages
      updateMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== assistantMessageId);
        // Add error message only if we don't already have one for this error
        const hasRecentError = filtered.some(msg => 
          msg.type === 'assistant' && 
          msg.content.includes("I'm having trouble connecting")
        );
        if (!hasRecentError) {
          const errorMessage: Message = {
            id: generateMessageId(),
            type: 'assistant',
            content: "I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date()
          };
          return [...filtered, errorMessage];
        }
        return filtered;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    try {
      // Use window.speechSynthesis directly if state is not available
      const synth = speechSynthesis || (typeof window !== 'undefined' ? window.speechSynthesis : null);
      
      if (!synth) {
        console.warn('Speech synthesis not available');
        return;
      }

      if (!text || !text.trim()) {
        console.warn('No text to speak');
        return;
      }

      // Stop any ongoing speech before starting new one
      try {
        synth.cancel();
      } catch (cancelError) {
        // Ignore cancel errors - speech might not be active
        console.warn('Error canceling speech:', cancelError);
      }
      
      // Small delay to ensure cancel is processed
      setTimeout(() => {
        try {
          const synth = speechSynthesis || (typeof window !== 'undefined' ? window.speechSynthesis : null);
          if (!synth) {
            return;
          }

          const utterance = new SpeechSynthesisUtterance(text.trim());
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          utterance.lang = 'en-US';

          utterance.onstart = () => {
            setIsSpeaking(true);
          };

          utterance.onend = () => {
            setIsSpeaking(false);
          };

          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
          };

          synth.speak(utterance);
        } catch (speakError) {
          console.error('Error speaking text:', speakError);
          setIsSpeaking(false);
        }
      }, 100);
    } catch (error) {
      console.error('Error in speakText:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    try {
      const synth = speechSynthesis || (typeof window !== 'undefined' ? window.speechSynthesis : null);
      if (synth) {
        try {
          synth.cancel();
        } catch (cancelError) {
          // Ignore cancel errors
          console.warn('Error canceling speech:', cancelError);
        }
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error in stopSpeaking:', error);
      setIsSpeaking(false);
    }
  };

  const handleEndCall = async () => {
    // Don't do anything if processing
    if (isProcessing) {
      return;
    }

    // Stop any ongoing activities
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    try {
      const synth = speechSynthesis || (typeof window !== 'undefined' ? window.speechSynthesis : null);
      if (synth) {
        try {
          synth.cancel();
        } catch (cancelError) {
          // Ignore cancel errors
          console.warn('Error canceling speech:', cancelError);
        }
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
      setIsSpeaking(false);
    }
    
    setIsProcessing(true);
    
    try {
      // Use ref to get latest messages
      const currentMessages = messagesRef.current;
      const userMessages = currentMessages.filter(msg => msg.type === 'user');
      
      // Convert messages to MemoryMessage format
      const chatHistory: MemoryMessage[] = currentMessages.map((msg, index) => ({
        id: index + 1,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // Create conversation summary for AI
      const conversationText = currentMessages.length > 0
        ? currentMessages
            .filter(msg => msg.type === 'user' || (msg.type === 'assistant' && msg.content && msg.content.length > 50))
            .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n\n')
        : 'A new memory conversation';

      // Generate title and description from full conversation using the chat AI
      let title = 'New Memory';
      let description = 'A conversation about memories';
      let aiInsights = 'A meaningful conversation about memories.';
      
      if (conversationText && conversationText !== 'A new memory conversation' && conversationText.length > 20 && userMessages.length > 0) {
        try {
          // Use Google AI chat to generate title and description in one call
          // This won't be added to the chat messages
          const conversationHistory = currentMessages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));

          const summaryResponse = await fetch('/api/google-ai-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Based on our entire conversation, please provide a title and summary for this memory. Respond in the following JSON format only (no other text):\n\n{\n  "title": "A short meaningful title (max 8 words)",\n  "description": "A concise 2-3 sentence summary of the key points and emotions discussed"\n}\n\nOur conversation:\n${conversationText}`,
              conversationHistory: conversationHistory
            }),
          });

          if (summaryResponse.ok && summaryResponse.body) {
            const summaryReader = summaryResponse.body.getReader();
            const summaryDecoder = new TextDecoder();
            let summaryResponseText = '';

            try {
              while (true) {
                const { done, value } = await summaryReader.read();
                if (done) {
                  const remaining = summaryDecoder.decode();
                  if (remaining) {
                    const lines = remaining.split('\n').filter(line => line.trim());
                    for (const line of lines) {
                      try {
                        const data = JSON.parse(line);
                        if (data.type === 'complete' && data.content) {
                          summaryResponseText = data.content;
                        }
                      } catch (e) {
                        // Skip invalid JSON
                      }
                    }
                  }
                  break;
                }

                const chunk = summaryDecoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                  try {
                    const data = JSON.parse(line);
                    if (data.type === 'chunk' && data.content) {
                      summaryResponseText += data.content;
                    } else if (data.type === 'complete' && data.content) {
                      summaryResponseText = data.content;
                    } else if (data.type === 'error') {
                      throw new Error(data.error || 'Summary generation error');
                    }
                  } catch (e) {
                    // Skip invalid JSON lines
                  }
                }
              }
            } finally {
              summaryReader.releaseLock();
            }

            if (summaryResponseText.trim()) {
              // Try to parse JSON from the response
              try {
                // Extract JSON from the response (might have extra text)
                const jsonMatch = summaryResponseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.title) {
                    title = parsed.title.trim().replace(/^["']|["']$/g, '');
                    if (title.length > 60) {
                      title = title.substring(0, 57) + '...';
                    }
                  }
                  if (parsed.description) {
                    description = parsed.description.trim();
                    if (description.length > 500) {
                      description = description.substring(0, 497) + '...';
                    }
                  }
                } else {
                  // If no JSON found, try to extract title and description from text
                  const lines = summaryResponseText.split('\n').filter(line => line.trim());
                  if (lines.length > 0) {
                    title = lines[0].trim().replace(/^["']|["']$/g, '');
                    if (title.length > 60) {
                      title = title.substring(0, 57) + '...';
                    }
                    description = lines.slice(1).join(' ').trim();
                    if (description.length > 500) {
                      description = description.substring(0, 497) + '...';
                    }
                  }
                }
              } catch (parseError) {
                console.error('Error parsing summary response:', parseError);
                // Fallback: use first line as title, rest as description
                const lines = summaryResponseText.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                  title = lines[0].trim().replace(/^["']|["']$/g, '');
                  if (title.length > 60) {
                    title = title.substring(0, 57) + '...';
                  }
                  description = lines.slice(1).join(' ').trim() || description;
                }
              }
            }

            // Generate AI insights using Google AI chat
            try {
              const insightsResponse = await fetch('/api/google-ai-chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: `Summarize this conversation in 2-3 sentences, focusing on the key insights and emotions discussed:\n\n${conversationText}`,
                  conversationHistory: conversationHistory
                }),
              });

              if (insightsResponse.ok && insightsResponse.body) {
                const insightsReader = insightsResponse.body.getReader();
                const insightsDecoder = new TextDecoder();
                let insightsResponseText = '';

                try {
                  while (true) {
                    const { done, value } = await insightsReader.read();
                    if (done) {
                      const remaining = insightsDecoder.decode();
                      if (remaining) {
                        const lines = remaining.split('\n').filter(line => line.trim());
                        for (const line of lines) {
                          try {
                            const data = JSON.parse(line);
                            if (data.type === 'complete' && data.content) {
                              insightsResponseText = data.content;
                            }
                          } catch (e) {
                            // Skip invalid JSON
                          }
                        }
                      }
                      break;
                    }

                    const chunk = insightsDecoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                      try {
                        const data = JSON.parse(line);
                        if (data.type === 'chunk' && data.content) {
                          insightsResponseText += data.content;
                        } else if (data.type === 'complete' && data.content) {
                          insightsResponseText = data.content;
                        } else if (data.type === 'error') {
                          throw new Error(data.error || 'Insights generation error');
                        }
                      } catch (e) {
                        // Skip invalid JSON lines
                      }
                    }
                  }
                } finally {
                  insightsReader.releaseLock();
                }

                if (insightsResponseText.trim()) {
                  aiInsights = insightsResponseText.trim();
                }
              }
            } catch (insightsError) {
              console.error('Error generating insights:', insightsError);
              // Keep default insights
            }
          } else {
            throw new Error('Summary API failed');
          }
        } catch (error) {
          console.error('Error generating title and description:', error);
          // Fallback: use first user message for title, conversation text for description
          const firstUserMessage = userMessages[0]?.content || '';
          if (firstUserMessage.length > 0) {
            title = firstUserMessage.length > 50 
              ? firstUserMessage.substring(0, 47) + '...' 
              : firstUserMessage;
          }
          if (conversationText && conversationText !== 'A new memory conversation') {
            description = conversationText.length > 200 
              ? conversationText.substring(0, 197) + '...' 
              : conversationText;
          }
        }
      } else {
        // Use fallback values
        const firstUserMessage = userMessages[0]?.content || '';
        if (firstUserMessage.length > 0) {
          title = firstUserMessage.length > 50 
            ? firstUserMessage.substring(0, 47) + '...' 
            : firstUserMessage;
        }
        if (conversationText && conversationText !== 'A new memory conversation') {
          description = conversationText.length > 200 
            ? conversationText.substring(0, 197) + '...' 
            : conversationText;
        }
      }

      // Create memory data
      const now = new Date();
      const memoryData = {
        title,
        description,
        startDate: now.toISOString().split('T')[0],
        startTime: now.toTimeString().split(' ')[0].slice(0, 5),
        endDate: now.toISOString().split('T')[0],
        endTime: now.toTimeString().split(' ')[0].slice(0, 5),
        vagueTime: '',
        categories: [],
        customCategory: '',
        customEmotion: '',
        tags: 'voice, conversation',
        mediaFiles: [],
        mode: 'simple' as const,
        timestamp: now.toISOString()
      };

      // Navigate to the memory preview page to add media
      const encodedSummary = encodeURIComponent(JSON.stringify(memoryData));
      const encodedChatHistory = encodeURIComponent(JSON.stringify(chatHistory));
      const encodedAiInsights = encodeURIComponent(aiInsights);
      router.push(`/memory-preview?memory=${encodedSummary}&chatHistory=${encodedChatHistory}&aiInsights=${encodedAiInsights}`);
    } catch (error) {
      console.error('Error saving memory:', error);
      setError('Failed to save memory. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleManualInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input') as HTMLInputElement;
    const text = input?.value.trim();

    if (!text || isProcessing) return;

    input.value = '';
    await handleVoiceMessage(text);
  };

  const handleDemo = async () => {
    if (isDemoRunning || isProcessing || isListening) return;

    setIsDemoRunning(true);
    setError(null);

    const demoMessages = [
      "I remember when I was a child, my grandmother used to bake the most amazing apple pies every Sunday.",
      "The smell would fill the entire house and all the neighbors would come over to share a slice.",
      "She taught me how to make the crust from scratch, and I still use her recipe today.",
      "Those Sunday afternoons were some of my happiest memories growing up.",
      "I wish I could go back and tell her how much those moments meant to me."
    ];

    // Send messages sequentially with delays
    for (let i = 0; i < demoMessages.length; i++) {
      // Wait before sending next message (except first one)
      if (i > 0) {
        // Wait for previous message to finish processing
        let attempts = 0;
        while (isProcessing && attempts < 100) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }
        // Additional delay to allow AI response to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      await handleVoiceMessage(demoMessages[i]);
    }

    // Wait for final message to complete
    let attempts = 0;
    while (isProcessing && attempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }
    
    setIsDemoRunning(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation showBackButton={true} backButtonText="Back to Garden" backButtonHref="/garden" />
        <main className="pt-26">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation showBackButton={true} backButtonText="Back to Garden" backButtonHref="/garden" />

      <main className="pt-26">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4 leading-none">
              <span className="text-6xl inline-block">🎤</span>
            </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Voice Memory Interaction
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Talk to Sprout about your memories with your voice
          </p>
          <button
            onClick={handleDemo}
            disabled={isDemoRunning || isProcessing || isListening}
            className="bg-gradient-to-b from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {isDemoRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Running Demo...</span>
              </>
            ) : (
              <>
                <span>🎬</span>
                <span>Try Demo (5 Messages)</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-full mb-6 text-center">
            {error}
          </div>
        )}

        {/* Chat Interface - Style CHAT */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden mb-6">
          {/* Chat Header */}
          <div className="bg-white p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-lg">🌱</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Sprout</h3>
                <p className="text-sm text-emerald-500 font-medium">Your nurturing companion</p>
              </div>
            </div>
          </div>

          {/* Chat Messages - Style CHAT */}
          <div ref={chatContainerRef} className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Transcript Display */}
            {transcript && (
              <div className="flex justify-end">
                <div className="max-w-xs px-4 py-3 rounded-2xl bg-gray-200 text-gray-600 italic">
                  <p className="text-sm">{transcript}</p>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-3 rounded-2xl bg-emerald-50 text-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input - Style CHAT */}
          <div className="p-6 relative">
            <form onSubmit={handleManualInput} className="flex space-x-3 mb-4">
              <input
                type="text"
                placeholder="Share what's on your heart..."
                className="flex-1 px-4 py-3 border-2 border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 transition-colors text-gray-800 placeholder-gray-500 bg-white"
                disabled={isProcessing || isListening}
              />
              <button
                type="submit"
                disabled={isProcessing || isListening}
                className="bg-gradient-to-b from-emerald-500 to-green-600 text-white w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>

            {/* Voice Button */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? '⏹' : '🎤'}
                {isListening && (
                  <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></span>
                )}
              </button>

              <button
                onClick={handleEndCall}
                disabled={isProcessing}
                className="w-16 h-16 rounded-full bg-gradient-to-b from-red-500 to-red-600 text-white flex items-center justify-center text-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚪
              </button>

              <button
                onClick={stopSpeaking}
                disabled={!isSpeaking}
                className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-500 to-amber-600 text-white flex items-center justify-center text-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⬜
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                {isListening && (
                  <span className="text-red-500 font-semibold animate-pulse">
                    🎤 Listening... Speak now
                  </span>
                )}
                {isProcessing && (
                  <span className="text-emerald-600 font-semibold">
                    🌱 Processing your message...
                  </span>
                )}
                {isSpeaking && (
                  <span className="text-emerald-600 font-semibold">
                    🔊 Sprout is speaking...
                  </span>
                )}
                {!isListening && !isProcessing && !isSpeaking && (
                  <span className="text-gray-500">
                    Click the microphone to start talking
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-white rounded-3xl p-8 border-2 border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Tips for Voice Interaction
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-emerald-500 mr-3">•</span>
              Click the microphone button to start recording your voice
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-3">•</span>
              After ending the conversation, your memory card will be created with a summary. Visit the Memory Cards view to add photos or videos to enhance your memory
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-3">•</span>
              Speak clearly and wait for the AI response
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-3">•</span>
              You can type messages manually if you prefer
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-3">•</span>
              AI responses will be read aloud automatically
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-3">•</span>
              Click the stop button to interrupt speech
            </li>
          </ul>
        </div>
        </div>
      </main>
    </div>
  );
}

