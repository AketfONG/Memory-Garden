"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "../components/Navigation";
import { memoryStorage, MemoryMessage } from "../utils/memoryStorage";

function MemoryPreviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [memoryData, setMemoryData] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Get memory data from URL params
    const memoryParam = searchParams.get('memory');
    if (memoryParam) {
      try {
        const decoded = decodeURIComponent(memoryParam);
        const data = JSON.parse(decoded);
        setMemoryData(data);
      } catch (error) {
        console.error('Error parsing memory data:', error);
        router.push('/garden');
      }
    } else {
      router.push('/garden');
    }
  }, [searchParams, router]);

  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image too large. Please upload images smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present
        const base64Data = base64String.includes(',') 
          ? base64String.split(',')[1] 
          : base64String;
        
        setUploadedImage(base64Data);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Failed to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveMemory = () => {
    if (!memoryData) return;

    // Get chat history from URL or create empty
    const chatHistoryParam = searchParams.get('chatHistory');
    let chatHistory: MemoryMessage[] = [];
    if (chatHistoryParam) {
      try {
        chatHistory = JSON.parse(decodeURIComponent(chatHistoryParam));
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }

    // Get AI insights from URL
    const aiInsightsParam = searchParams.get('aiInsights');
    const aiInsights = aiInsightsParam ? decodeURIComponent(aiInsightsParam) : 'A meaningful conversation about memories.';

    // Save memory
    const memoryId = memoryStorage.saveMemory(memoryData, chatHistory, aiInsights);

    // If image was uploaded, store it in localStorage with the memory ID
    if (uploadedImage && memoryId) {
      try {
        const imageStorageKey = `memory_image_${memoryId}`;
        localStorage.setItem(imageStorageKey, uploadedImage);
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }

    // Navigate to the garden page with memory cards view
    router.push('/garden?view=cards');
  };

  const handleSkip = () => {
    handleSaveMemory();
  };

  if (!mounted || !memoryData) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation showBackButton={true} />
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
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">
                Add Media to Your Memory
              </h1>
              <p className="text-lg text-gray-600">
                Enhance your memory card by adding a photo or image, or AI will generate one for you.
              </p>
            </div>

            {/* Memory Card Preview */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-4 shadow-lg border border-emerald-100">
                {/* Image Section */}
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
                  {isUploading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Uploading image...</p>
                    </div>
                  ) : uploadedImage ? (
                    <img 
                      src={`data:image/png;base64,${uploadedImage}`}
                      alt="Memory preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <p className="text-base text-gray-600 font-medium mb-2">Click to add image</p>
                        <p className="text-sm text-gray-500">or drag and drop</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="px-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{memoryData.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{memoryData.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(memoryData.startDate || memoryData.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                    {memoryData.categories && memoryData.categories.length > 0 && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                        {memoryData.categories[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSkip}
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
              >
                Skip for Now
              </button>
              <button
                type="button"
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                🎨 AI Generation
              </button>
              <button
                onClick={handleSaveMemory}
                disabled={!uploadedImage}
                className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                  uploadedImage
                    ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save Memory
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function MemoryPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>}>
      <MemoryPreviewPageInner />
    </Suspense>
  );
}
