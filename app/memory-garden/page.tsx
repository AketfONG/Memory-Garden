"use client";
import React, { useState, useEffect, useRef } from "react";
import Navigation from "../components/Navigation";
import Link from "next/link";
import { memoryStorage, type SavedMemory } from "../utils/memoryStorage";
import { PRESET_STACKS } from "../utils/presetStacks";
import { useLanguage } from "../contexts/LanguageContext";

interface MemoryCardData {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  media: string[];
  mediaImages: string[]; // Base64 image data URLs
  date: string;
}

function formatDateDDMMYYYY(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

export default function MemoryGarden() {
  const { language } = useLanguage();
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [memoryCards, setMemoryCards] = useState<MemoryCardData[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [dragActive, setDragActive] = useState(false);
  const [detailViewImages, setDetailViewImages] = useState<{ [key: string]: string[] }>({});
  const [generatingImages, setGeneratingImages] = useState<{ [key: string]: boolean }>({});
  const [showDemoCards, setShowDemoCards] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const detailCardRef = useRef<HTMLDivElement | null>(null);

  // Map memory titles to demo images
  const getDemoImagesForMemory = (memoryTitle: string): string[] => {
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

    // Check for exact match or partial match
    for (const [key, images] of Object.entries(imageMap)) {
      if (memoryTitle.includes(key) || key.includes(memoryTitle)) {
        return images;
      }
    }
    return [];
  };

  // Create demo memory cards from preset stacks (with localized titles/descriptions)
  const createDemoCards = (): MemoryCardData[] => {
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

    return PRESET_STACKS.map((preset, index) => {
      const demoImages = getDemoImagesForMemory(preset.title);
      const tags = preset.tags
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) || [];

      const mediaItems: string[] = [];
      const mediaImagesForDisplay: string[] = [];

      // Add demo images (up to 3)
      demoImages.slice(0, 3).forEach((imgPath) => {
        mediaItems.push("🖼️");
        mediaImagesForDisplay.push(imgPath);
      });

      // If there are no demo images at all, show a single placeholder icon
      if (mediaItems.length === 0) {
        mediaItems.push("🖼️");
      }

      let date = "";
      if (preset.startDate) {
        date = formatDateDDMMYYYY(preset.startDate);
      } else if (preset.vagueTime) {
        date = preset.vagueTime;
      }

      const zh = demoLocale[preset.title];

      // Localize demo hashtags when in Cantonese
      const localizedTags =
        language === "en"
          ? tags
          : tags.map((tag) => {
              const t = tag.toLowerCase();
              if (t.includes("hiking") || t.includes("mountain")) return "行山";
              if (t.includes("beach") || t.includes("sea")) return "沙灘";
              if (t.includes("family")) return "家庭";
              if (t.includes("friends")) return "朋友";
              if (t.includes("birthday")) return "生日";
              if (t.includes("anniversary")) return "週年紀念";
              if (t.includes("work") || t.includes("project")) return "工作";
              if (t.includes("art") || t.includes("gallery")) return "藝術";
              if (t.includes("trip") || t.includes("travel") || t.includes("road")) return "旅行";
              return tag;
            });

      return {
        id: `demo-${index}`,
        title: language === "en" || !zh ? preset.title : zh.titleZh,
        description:
          language === "en" || !zh
            ? preset.description || ""
            : zh.descriptionZh,
        hashtags: localizedTags,
        media: mediaItems.slice(0, 3),
        mediaImages: mediaImagesForDisplay,
        date,
      };
    });
  };

  const loadMemories = () => {
    try {
      const memories = memoryStorage.getAllMemories().sort((a, b) => {
        const aTime = a.startDate
          ? new Date(a.startDate).getTime()
          : a.timestamp
          ? new Date(a.timestamp).getTime()
          : 0;
        const bTime = b.startDate
          ? new Date(b.startDate).getTime()
          : b.timestamp
          ? new Date(b.timestamp).getTime()
          : 0;
        return aTime - bTime;
      });
      const userCards: MemoryCardData[] = memories.map((memory: SavedMemory) => {
        const tags =
          memory.tags
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) || [];

        // Get image files from mediaFiles
        const imageFiles = (memory.mediaFiles || []).filter((file) =>
          file.type.startsWith("image")
        );

        // Load generated/uploaded images from localStorage
        let generatedImages: string[] = [];
        try {
          const imageStorageKey = `memory_images_${memory.id}`;
          const storedImages = localStorage.getItem(imageStorageKey);
          
          if (storedImages) {
            try {
              const parsedImages = JSON.parse(storedImages);
              if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                generatedImages = parsedImages
                  .filter((img: any) => img && img.data && typeof img.data === 'string')
                  .map((img: { data: string; name?: string }) => {
                    // Handle both cases: data might already have prefix or not
                    if (img.data.startsWith('data:')) {
                      return img.data;
                    }
                    // Ensure we have base64 data
                    return `data:image/png;base64,${img.data}`;
                  })
                  .filter((url: string) => url && url.length > 0); // Filter out empty strings
                
                if (generatedImages.length > 0) {
                  console.log(`Loaded ${generatedImages.length} images for memory ${memory.id}`);
                }
              }
            } catch (parseError) {
              console.error(`Error parsing images for memory ${memory.id}:`, parseError);
            }
          }
        } catch (e) {
          console.error(`Error loading images for memory ${memory.id}:`, e);
        }

        // Note: Demo images are now only used for demo cards, not user memories

        // Loaded images from localStorage or demo images
        const loadedImages = generatedImages.slice(0, 3);
        
        // Calculate media display items
        let mediaItems: string[] = [];
        let mediaImagesForDisplay: string[] = [];
        
        // First, add loaded images (either from localStorage or demo images)
        loadedImages.forEach((imgUrl) => {
          mediaItems.push("🖼️");
          // If it's a demo image path (starts with /), use it directly
          // Otherwise, it's a base64 data URL
          mediaImagesForDisplay.push(imgUrl);
        });
        
        // Then, add placeholders for image files that don't have loaded data
        // We want to show up to 3 total items, so calculate remaining slots for images
        const remainingImageSlots = Math.min(imageFiles.length - loadedImages.length, 3 - mediaItems.length);
        for (let i = 0; i < remainingImageSlots; i++) {
          mediaItems.push("🖼️");
        }
        
        // Finally, add non-image media files to fill remaining slots (up to 3 total)
        const nonImageFiles = (memory.mediaFiles || [])
          .filter((file) => !file.type.startsWith("image"))
          .slice(0, 3 - mediaItems.length);
        
        nonImageFiles.forEach((file) => {
          if (file.type.startsWith("video")) {
            mediaItems.push("🎥");
          } else if (file.type.startsWith("audio")) {
            mediaItems.push("🎵");
          } else {
            mediaItems.push("📎");
          }
        });

        const media = mediaItems.slice(0, 3);
        const mediaImages = mediaImagesForDisplay;
        
        // Debug logging
        if (memory.mediaFiles && memory.mediaFiles.length > 0) {
          console.log(`Memory ${memory.id}: ${memory.mediaFiles.length} media files, ${loadedImages.length} loaded images, ${media.length} media items to display`);
        }

        let date = "";
        if (memory.startDate) {
          date = formatDateDDMMYYYY(memory.startDate);
        } else if (memory.vagueTime) {
          date = memory.vagueTime;
        } else if (memory.timestamp) {
          date = formatDateDDMMYYYY(new Date(memory.timestamp).toISOString());
        }

        return {
          id: memory.id,
          title: memory.title || "New Memory",
          description: memory.description || "",
          hashtags: tags,
          media,
          mediaImages: mediaImages,
          date,
        };
      });

      // Combine user cards with demo cards if showDemoCards is true
      const demoCards = showDemoCards ? createDemoCards() : [];
      const allCards = [...userCards, ...demoCards].sort((a, b) => {
        // Sort by date if available
        const aDate = a.date ? new Date(a.date.split('/').reverse().join('-')).getTime() : 0;
        const bDate = b.date ? new Date(b.date.split('/').reverse().join('-')).getTime() : 0;
        return bDate - aDate; // Most recent first
      });

      setMemoryCards(allCards);
    } catch (error) {
      console.error("Error loading memories for garden:", error);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [showDemoCards]);

  const handleDeleteMemory = (memoryId: string) => {
    // Don't allow deleting demo cards
    if (memoryId.startsWith("demo-")) {
      alert(
        language === "en"
          ? "Demo cards cannot be deleted."
          : "示範記憶卡唔可以刪除。"
      );
      return;
    }

    if (
      confirm(
        language === "en"
          ? "Are you sure you want to delete this memory? This action cannot be undone."
          : "你確定要刪除呢張記憶卡？呢個動作無法還原。"
      )
    ) {
      try {
        // Delete memory from storage
        memoryStorage.deleteMemory(memoryId);
        
        // Delete associated images from localStorage
        if (typeof window !== "undefined") {
          const imageStorageKey = `memory_images_${memoryId}`;
          localStorage.removeItem(imageStorageKey);
        }
        
        // If the deleted memory was selected, deselect it
        if (selectedMemory === memoryId) {
          setSelectedMemory(null);
        }
        
        // Reload memories
        loadMemories();
      } catch (error) {
        console.error("Error deleting memory:", error);
        alert(
          language === "en"
            ? "Failed to delete memory. Please try again."
            : "刪除記憶卡失敗，請再試一次。"
        );
      }
    }
  };

  // Download the currently selected memory card as a PNG using a custom canvas
  const handleDownloadCard = async () => {
    if (typeof window === "undefined") return;
    if (!selectedMemory) {
      alert(
        language === "en"
          ? "Please select a memory card to download."
          : "請先揀選一張記憶卡先可以下載。"
      );
      return;
    }

    const memory = memoryCards.find((m) => m.id === selectedMemory);
    if (!memory) {
      alert(
        language === "en"
          ? "Selected memory not found."
          : "搵唔到你揀嗰張記憶卡。"
      );
      return;
    }

    try {
      const width = 1200;
      const height = 675; // 16:9-ish
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not available");
      }

      // Background gradient similar to card feel
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, "#ecfdf5"); // emerald-50
      bgGradient.addColorStop(0.5, "#d1fae5"); // emerald-100
      bgGradient.addColorStop(1, "#a7f3d0"); // emerald-200
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Card-like inner rounded rect
      const cardPadding = 60;
      const cardWidth = width - cardPadding * 2;
      const cardHeight = height - cardPadding * 2;
      const radius = 32;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.moveTo(cardPadding + radius, cardPadding);
      ctx.lineTo(cardPadding + cardWidth - radius, cardPadding);
      ctx.quadraticCurveTo(
        cardPadding + cardWidth,
        cardPadding,
        cardPadding + cardWidth,
        cardPadding + radius
      );
      ctx.lineTo(cardPadding + cardWidth, cardPadding + cardHeight - radius);
      ctx.quadraticCurveTo(
        cardPadding + cardWidth,
        cardPadding + cardHeight,
        cardPadding + cardWidth - radius,
        cardPadding + cardHeight
      );
      ctx.lineTo(cardPadding + radius, cardPadding + cardHeight);
      ctx.quadraticCurveTo(
        cardPadding,
        cardPadding + cardHeight,
        cardPadding,
        cardPadding + cardHeight - radius
      );
      ctx.lineTo(cardPadding, cardPadding + radius);
      ctx.quadraticCurveTo(
        cardPadding,
        cardPadding,
        cardPadding + radius,
        cardPadding
      );
      ctx.closePath();
      ctx.fill();

      // Layout: left image, right text
      const innerPadding = 40;
      const leftX = cardPadding + innerPadding;
      const topY = cardPadding + innerPadding;
      const imageBoxWidth = cardWidth * 0.42;
      const imageBoxHeight = cardHeight - innerPadding * 2;
      const textX = leftX + imageBoxWidth + 40;
      const textWidth = cardWidth - (imageBoxWidth + 40 + innerPadding);

      // Draw image if available
      const detailImagesForMemory = detailViewImages[memory.id] || [];
      const firstImage =
        detailImagesForMemory[0] || (memory.mediaImages && memory.mediaImages[0]);

      if (firstImage) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          const imgLoaded = await new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = firstImage;
          });

          // Clip to rounded rect for image
          const imgRadius = 24;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(leftX + imgRadius, topY);
          ctx.lineTo(leftX + imageBoxWidth - imgRadius, topY);
          ctx.quadraticCurveTo(
            leftX + imageBoxWidth,
            topY,
            leftX + imageBoxWidth,
            topY + imgRadius
          );
          ctx.lineTo(leftX + imageBoxWidth, topY + imageBoxHeight - imgRadius);
          ctx.quadraticCurveTo(
            leftX + imageBoxWidth,
            topY + imageBoxHeight,
            leftX + imageBoxWidth - imgRadius,
            topY + imageBoxHeight
          );
          ctx.lineTo(leftX + imgRadius, topY + imageBoxHeight);
          ctx.quadraticCurveTo(
            leftX,
            topY + imageBoxHeight,
            leftX,
            topY + imageBoxHeight - imgRadius
          );
          ctx.lineTo(leftX, topY + imgRadius);
          ctx.quadraticCurveTo(leftX, topY, leftX + imgRadius, topY);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(imgLoaded, leftX, topY, imageBoxWidth, imageBoxHeight);
          ctx.restore();
        } catch (imgErr) {
          console.warn("Could not load image for card export, continuing without it:", imgErr);
        }
      }

      // Text styles
      ctx.fillStyle = "#022c22"; // emerald-950-ish
      ctx.textBaseline = "top";

      // Title
      ctx.font = "bold 32px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      const maxTitleWidth = textWidth;
      const title = memory.title || "Memory";
      const drawWrappedText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number,
        maxLines?: number
      ) => {
        const words = text.split(/\s+/);
        let line = "";
        let currentY = y;
        let lines = 0;
        for (let n = 0; n < words.length; n++) {
          const testLine = line ? `${line} ${words[n]}` : words[n];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            lines += 1;
            if (maxLines && lines >= maxLines) {
              ctx.fillText("…", x + maxWidth - ctx.measureText("…").width, currentY);
              return currentY + lineHeight;
            }
            line = words[n];
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        if (line) {
          ctx.fillText(line, x, currentY);
          currentY += lineHeight;
        }
        return currentY;
      };

      let currentY = topY;
      currentY = drawWrappedText(title, textX, currentY, maxTitleWidth, 38, 2);

      // Date
      if (memory.date) {
        ctx.font =
          "500 18px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillStyle = "#047857"; // emerald-700
        ctx.fillText(memory.date, textX, currentY + 4);
        currentY += 32;
      }

      // Description
      if (memory.description) {
        ctx.font =
          "400 20px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillStyle = "#374151"; // gray-700
        currentY += 8;
        currentY = drawWrappedText(
          memory.description,
          textX,
          currentY,
          textWidth,
          28,
          5
        );
      }

      // Tags
      if (memory.hashtags && memory.hashtags.length > 0) {
        ctx.font =
          "500 16px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        ctx.fillStyle = "#065f46"; // emerald-800
        const tagsY = currentY + 12;
        let x = textX;
        const tagPaddingX = 10;
        const tagPaddingY = 6;
        const tagHeight = 24;

        for (const tag of memory.hashtags.slice(0, 4)) {
          const label = `#${tag}`;
          const w = ctx.measureText(label).width + tagPaddingX * 2;
          if (x + w > textX + textWidth) {
            // move to next line
            x = textX;
            currentY += tagHeight + 8;
          }
          const y = currentY + 8;
          ctx.fillStyle = "rgba(16, 185, 129, 0.12)"; // emerald tinted bg
          ctx.beginPath();
          const r = tagHeight / 2;
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + tagHeight - r);
          ctx.quadraticCurveTo(x + w, y + tagHeight, x + w - r, y + tagHeight);
          ctx.lineTo(x + r, y + tagHeight);
          ctx.quadraticCurveTo(x, y + tagHeight, x, y + tagHeight - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#047857";
          ctx.fillText(label, x + tagPaddingX, y + 4);

          x += w + 10;
        }
      }

      // Website URL in bottom-right (no background box, dark green text)
      const footerText = "https://www.memorygardenai.com";
      ctx.font =
        "400 18px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      const footerMetrics = ctx.measureText(footerText);
      const footerPadding = 24;
      const footerX = width - footerMetrics.width - footerPadding;
      const footerY = height - footerPadding;

      ctx.fillStyle = "#065f46"; // dark emerald green
      ctx.fillText(footerText, footerX, footerY - 4);

      // Export as PNG
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeTitle =
        (memory.title || "memory-card")
          .toLowerCase()
          .replace(/[^a-z0-9\-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || "memory-card";
      link.download = `${safeTitle}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download memory card image:", error);
      alert(
        language === "en"
          ? "Unable to download this card right now. Please try again in a moment."
          : "暫時未能下載呢張記憶卡，請過一陣再試。"
      );
    }
  };

  // Download an image for a given memory (defaults to the first image)
  const handleDownloadImage = (memoryId: string, imageIndex: number = 0) => {
    if (typeof window === "undefined") return;

    const memory = memoryCards.find((m) => m.id === memoryId);
    if (!memory) {
      alert(
        language === "en" ? "Memory not found." : "搵唔到呢張記憶卡。"
      );
      return;
    }

    const images = detailViewImages[memoryId] || memory.mediaImages || [];
    if (!images || images.length === 0) {
      alert(
        language === "en"
          ? "There is no image to download for this memory."
          : "呢張記憶卡暫時未有任何圖片可以下載。"
      );
      return;
    }

    const safeIndex = imageIndex >= 0 && imageIndex < images.length ? imageIndex : 0;
    const imageUrl = images[safeIndex];

    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      const safeTitle =
        (memory.title || "memory-image").toLowerCase().replace(/[^a-z0-9\-]+/g, "-") ||
        "memory-image";
      link.download = `${safeTitle}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to trigger image download:", e);
      alert(
        language === "en"
          ? "Unable to download image. Please try again or right-click the image to save it."
          : "暫時未能下載圖片，可以再試一次，或者用滑鼠右擊圖片再儲存。"
      );
    }
  };

  // Load images for detail view when memory is selected
  useEffect(() => {
    if (selectedMemory && typeof window !== "undefined") {
      const imageStorageKey = `memory_images_${selectedMemory}`;
      const storedImages = localStorage.getItem(imageStorageKey);
      
      let imageUrls: string[] = [];
      
      if (storedImages) {
        try {
          const parsedImages = JSON.parse(storedImages);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            imageUrls = parsedImages
              .filter((img: any) => img && img.data && typeof img.data === 'string')
              .map((img: { data: string }) => {
                if (img.data.startsWith('data:')) {
                  return img.data;
                }
                return `data:image/png;base64,${img.data}`;
              })
              .filter((url: string) => url && url.length > 0);
          }
        } catch (e) {
          console.error(`Error loading images for detail view:`, e);
        }
      }
      
      // Fallback to memory card's mediaImages if no localStorage images
      if (imageUrls.length === 0) {
        const memory = memoryCards.find(m => m.id === selectedMemory);
        if (memory && memory.mediaImages && memory.mediaImages.length > 0) {
          imageUrls = memory.mediaImages;
        } else {
          // If still no images and it's a demo card, check for demo images
          if (selectedMemory.startsWith('demo-')) {
            const demoIndex = parseInt(selectedMemory.replace('demo-', ''));
            const preset = PRESET_STACKS[demoIndex];
            if (preset) {
              const demoImages = getDemoImagesForMemory(preset.title);
            if (demoImages.length > 0) {
              imageUrls = demoImages;
              }
            }
          }
        }
      }
      
      if (imageUrls.length > 0) {
        setDetailViewImages(prev => ({
          ...prev,
          [selectedMemory]: imageUrls
        }));
      }
    }
  }, [selectedMemory, memoryCards]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, memoryId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(memoryId, file);
      } else {
        alert(
          language === "en"
            ? "Please drop an image file"
            : "請拖放一個圖片檔案。"
        );
      }
    }
  };

  // Handle image upload
  const handleImageUpload = async (memoryId: string, file: File) => {
    // Don't allow uploading to demo cards
    if (memoryId.startsWith("demo-")) {
      alert(
        language === "en"
          ? "Demo cards cannot have images added."
          : "示範記憶卡唔可以新增圖片。"
      );
      return;
    }
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert(
        language === "en"
          ? "Please upload an image file"
          : "請上載圖片檔案。"
      );
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(
        language === "en"
          ? "Image too large. Please upload images smaller than 5MB"
          : "圖片檔案太大，請上載細過 5MB 嘅圖片。"
      );
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present
        const base64Data = base64String.includes(',') 
          ? base64String.split(',')[1] 
          : base64String;
        
        // Update detail view images
        const imageUrl = `data:image/png;base64,${base64Data}`;
        setDetailViewImages(prev => ({
          ...prev,
          [memoryId]: [...(prev[memoryId] || []), imageUrl]
        }));

        // Also save to localStorage (with quota protection)
        if (typeof window !== "undefined") {
          try {
          const imageStorageKey = `memory_images_${memoryId}`;
          const existingImages = localStorage.getItem(imageStorageKey);
          let imagesToStore: Array<{ name: string; data: string }> = [];
          
          if (existingImages) {
            try {
              imagesToStore = JSON.parse(existingImages);
              } catch {
              // If parsing fails, start fresh
            }
          }
          
          imagesToStore.push({
            name: file.name,
            data: base64Data,
          });
          
          localStorage.setItem(imageStorageKey, JSON.stringify(imagesToStore));
          } catch (err) {
            console.error("localStorage quota exceeded or unavailable, skipping image storage:", err);
            // Politely ask the user if they want to clear this site's stored images
            if (typeof window !== "undefined") {
              const shouldClear = window.confirm(
                language === "en"
                  ? "Your browser storage for Memory Garden is full, so new images might not be saved.\n\nDo you want to clear all saved memory images from this browser to free up space?"
                  : "你用嚟儲存 Memory Garden 嘅瀏覽器空間已經滿咗，新圖片可能唔可以再儲存。\n\n你想唔想清除瀏覽器入面所有已儲存嘅記憶圖片，騰出空間？"
              );
              if (shouldClear) {
                try {
                  // Only clear our image-related keys, not all localStorage
                  const keysToRemove: string[] = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!key) continue;
                    if (key.startsWith("memory_images_") || key.startsWith("stack_images_")) {
                      keysToRemove.push(key);
                    }
                  }
                  keysToRemove.forEach((k) => localStorage.removeItem(k));
                  alert(
                    language === "en"
                      ? "Saved images for memories have been cleared. You can now add or generate new images."
                      : "已經清除晒所有已儲存嘅記憶圖片，你而家可以重新新增或者生成圖片。"
                  );
                  // Reload the garden view to reflect the cleared images
                  window.location.reload();
                } catch (clearErr) {
                  console.error("Failed to clear stored images:", clearErr);
                  alert(
                    language === "en"
                      ? "Tried to clear stored images, but something went wrong. You may need to clear site data manually in your browser settings."
                      : "嘗試清除已儲存圖片時發生錯誤，你可能需要喺瀏覽器設定入面手動清除網站資料。"
                  );
                }
              } else {
                alert(
                  language === "en"
                    ? "The new image will show now, but it might not be kept for later because storage is full."
                    : "新圖片而家會照樣顯示，但因為儲存空間已滿，之後可能未必可以長期保存。"
                );
              }
            }
          }
        }

        // Reload memories to update the card view
        loadMemories();
      };
      reader.onerror = () => {
        alert(
          language === "en"
            ? "Failed to read image file"
            : "讀取圖片檔案失敗。"
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        language === "en"
          ? "Failed to upload image"
          : "上載圖片失敗。"
      );
    }
  };

  // Handle file input change
  const handleFileInputChange = (memoryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(memoryId, file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateImages = async (memoryId: string) => {
    // Don't allow generating images for demo cards
    if (memoryId.startsWith('demo-')) {
      alert("Demo cards cannot have images generated.");
      return;
    }

    // Prevent multiple simultaneous generations
    if (generatingImages[memoryId]) {
      return;
    }

    // Enforce per-tester image generation limit unless tester mode is unlocked
    if (typeof window !== "undefined") {
      const proUnlocked = localStorage.getItem("mg_pro_unlocked") === "true";
      if (!proUnlocked) {
        const raw = localStorage.getItem("mg_free_image_generations") || "0";
        const used = parseInt(raw, 10) || 0;
        if (used >= 5) {
          alert(
            language === "en"
              ? "You’ve reached the free image limit (5 generations). Enter your tester code on the Updates page to unlock more."
              : "你已經用完 5 次免費圖片生成次數。如需繼續測試，請去更新日誌頁面輸入測試代碼解鎖。"
          );
          return;
        }
      }
    }

    // Before each generation, ask user if they want to proceed (and clear stored images first)
    if (typeof window !== "undefined") {
      const message =
        language === "en"
          ? "To keep your Memory Garden storage healthy, we can clear all previously saved images before generating a new one.\n\nDo you want to clear all saved memory and stack images from this browser now?"
          : "為咗保持 Memory Garden 嘅儲存空間健康，我哋可以喺生成新圖片之前，先清除之前儲存嘅所有圖片。\n\n你想即刻清除瀏覽器入面所有已儲存嘅記憶同堆疊圖片嗎？";
      const proceed = window.confirm(message);
      // If user cancels here, abort image generation entirely
      if (!proceed) {
        return;
      }
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith("memory_images_") || key.startsWith("stack_images_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        console.log("Cleared stored memory/stack images before generation.");
        // Also clear in-memory detail images so the UI matches
        setDetailViewImages({});
        // Reload cards so previews reflect cleared images
        loadMemories();
      } catch (clearErr) {
        console.error("Failed to clear stored images before generation:", clearErr);
        alert(
          "Tried to clear stored images, but something went wrong. You may need to clear site data manually in your browser settings."
        );
        // If clearing fails, still abort generation to avoid inconsistent state
        return;
      }
    }

    try {
      // Set loading state
      setGeneratingImages(prev => ({ ...prev, [memoryId]: true }));

      // Find the memory data
      const memory = memoryCards.find((m) => m.id === memoryId);
      if (!memory) {
        alert("Memory not found.");
        setGeneratingImages(prev => {
          const updated = { ...prev };
          delete updated[memoryId];
          return updated;
        });
        return;
      }

      // Get the full memory data from storage
      const fullMemory = memoryStorage.getMemory(memoryId);
      if (!fullMemory) {
        alert("Memory data not found.");
        setGeneratingImages(prev => {
          const updated = { ...prev };
          delete updated[memoryId];
          return updated;
        });
        return;
      }

      const generatedImages: Array<{ name: string; data: string }> = [];

      // Generate exactly 1 image per click
      try {
        // Build a more precise prompt that focuses on the actual content of the memory
        const baseTitle = fullMemory.title || memory.title || "Memory";
        const baseDescription = fullMemory.description || memory.description || "";
        const category = fullMemory.categories?.[0] || fullMemory.customCategory || "";
        const emotion = fullMemory.customEmotion || "";

        const semanticPrompt = `
Create a realistic image that clearly depicts the main subject and context of this memory, not just a generic scenic background.
Title: ${baseTitle}
Description: ${baseDescription}
Category: ${category || "unspecified"}
Emotion: ${emotion || "unspecified"}

If the memory is about an activity like a gaming session, show the actual activity and setting (e.g. people, controllers, screens, living room) instead of a random landscape.
Focus on people, objects, and environment that best represent this specific memory.`.trim();

        const prompt = semanticPrompt.slice(0, 500);

        try {
          console.log(`Generating image for memory ${memoryId}...`);
          const response = await fetch("/api/generate-image-hybrid", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
              memoryTitle: baseTitle || "New Memory",
              memoryDescription: baseDescription || "",
              category,
              emotion,
              style: "realistic",
              type: "memory_visualization",
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Image generation API error (${response.status}):`, errorText);
            throw new Error(errorText || `HTTP ${response.status}`);
          }

          const result = await response.json();
          console.log(`Image generation response:`, { success: result.success, hasImageData: !!result.imageData, error: result.error });
          
          if (result.success && result.imageData) {
            const imageData = result.imageData;
            // Remove data URL prefix if present
            const base64Data = imageData.includes(",")
              ? imageData.split(",")[1]
              : imageData;

            if (base64Data && base64Data.length > 0) {
              generatedImages.push({
                name: `generated-image-1.png`,
                data: base64Data,
              });
              console.log(`Successfully generated image (${Math.floor(base64Data.length / 1024)}KB)`);
            } else {
              console.warn(`Generated image has empty data`);
            }
          } else {
            console.warn(`Image generation failed:`, result.error || 'Unknown error');
          }
        } catch (imageError) {
          console.error(`Error generating image:`, imageError);
        }
      } catch (e) {
        console.error("Image generation flow error:", e);
      }

      // Store generated images in localStorage (with quota protection)
      if (generatedImages.length > 0 && typeof window !== "undefined") {
        try {
          const imageStorageKey = `memory_images_${memoryId}`;
          const imagesToStore = generatedImages.map((img) => ({
            name: img.name,
            data: img.data,
          }));
          localStorage.setItem(imageStorageKey, JSON.stringify(imagesToStore));
          console.log(`Saved ${imagesToStore.length} generated images for memory ${memoryId}`);

          // Increment free-generation counter for testers (if not fully unlocked)
          const proUnlocked = localStorage.getItem("mg_pro_unlocked") === "true";
          if (!proUnlocked) {
            const raw = localStorage.getItem("mg_free_image_generations") || "0";
            const used = parseInt(raw, 10) || 0;
            localStorage.setItem("mg_free_image_generations", String(used + 1));
          }
        } catch (err) {
          console.error("localStorage quota exceeded or unavailable when saving generated images:", err);
          if (typeof window !== "undefined") {
            const shouldClear = window.confirm(
              "Your browser storage for Memory Garden is full, so new images might not be saved.\n\n" +
                "Do you want to clear all saved memory images from this browser to free up space?"
            );
            if (shouldClear) {
              try {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (!key) continue;
                  if (key.startsWith("memory_images_") || key.startsWith("stack_images_")) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach((k) => localStorage.removeItem(k));
                alert("Saved images for memories have been cleared. You can now add or generate new images.");
                window.location.reload();
              } catch (clearErr) {
                console.error("Failed to clear stored images:", clearErr);
                alert("Tried to clear stored images, but something went wrong. You may need to clear site data manually in your browser settings.");
              }
            } else {
              alert("The new image will show now, but it might not be kept for later because storage is full.");
            }
          }
        }
        
        // Update detail view images
        const imageUrls = generatedImages.map((img) => `data:image/png;base64,${img.data}`);
        setDetailViewImages(prev => ({
          ...prev,
          [memoryId]: imageUrls
        }));
        
        // Reload memories to show new images
        loadMemories();
      } else {
        alert("Failed to generate images. Please check the console for errors and try again.");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      alert(`Failed to generate images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clear loading state
      setGeneratingImages(prev => {
        const updated = { ...prev };
        delete updated[memoryId];
        return updated;
      });
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
          <div className="h-full w-full min-h-0">
            <div className="grid lg:grid-cols-2 gap-12 h-full w-full min-h-0">
              {/* Left Column - Memory Cards Grid / Timeline */}
              <div className="flex flex-col h-full min-h-0">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {language === "en" ? "Your Memory Garden" : "你嘅記憶花園"}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed mb-6">
                    {language === "en"
                      ? "Browse your preserved memories, each one a story waiting to be revisited"
                      : "喺呢度重溫你保存好嘅記憶，每一張卡都係一個值得再睇嘅故事。"}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="inline-flex rounded-full bg-white border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-md"
                          : "text-gray-600 hover:text-emerald-600"
                      }`}
                    >
                        {language === "en" ? "List" : "列表"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("timeline")}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        viewMode === "timeline"
                          ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-md"
                          : "text-gray-600 hover:text-emerald-600"
                      }`}
                    >
                        {language === "en" ? "Timeline" : "時間線"}
                      </button>
                    </div>

                    {/* Demo cards toggle (light green button like Mock Conversation) */}
                    <button
                      type="button"
                      onClick={() => setShowDemoCards((prev) => !prev)}
                      className="inline-flex items-center justify-center px-5 py-3 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition-all duration-300 ease-in-out"
                    >
                      {showDemoCards
                        ? language === "en"
                          ? "▶ Hide Demo Cards"
                          : "▶ 收起示範記憶卡"
                        : language === "en"
                        ? "▶ Show Demo Cards"
                        : "▶ 顯示示範記憶卡"}
                    </button>
                  </div>
                </div>

                {/* Memory Views (scrollable) */}
                <div className="flex-1 overflow-y-auto pr-2">
                  {memoryCards.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm text-center px-4">
                        {language === "en"
                          ? "No memory cards yet. Import memories or plant a memory to see them here."
                          : "暫時仲未有任何記憶卡。試下匯入相片，或者種植一段新回憶，喺度就會見到。"}
                      </p>
                    </div>
                  ) : viewMode === "list" ? (
                    <div className="grid grid-cols-1 gap-4 mb-2">
                      {memoryCards.map((memory) => (
                        <div
                          key={memory.id}
                          onClick={() =>
                            setSelectedMemory((prev) => (prev === memory.id ? null : memory.id))
                          }
                          className={`rounded-[2rem] p-6 border-2 cursor-pointer transition-all duration-300 ${
                            selectedMemory === memory.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
                          }`}
                        >
                          {/* Media Preview */}
                          <div className="flex gap-3 mb-4">
                            {memory.media.map((emoji, index) => {
                              const hasImage = memory.mediaImages && memory.mediaImages[index];
                              return (
                                <div
                                  key={index}
                                  className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl overflow-hidden"
                                >
                                  {hasImage ? (
                                    <img
                                      src={memory.mediaImages[index]}
                                      alt={`Memory ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>{emoji}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Title and Date */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                            <h3 className="text-xl font-bold text-gray-900">{memory.title}</h3>
                            <span className="text-sm text-gray-500">{memory.date}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="mb-3">
                            {memory.description ? (
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
                                {memory.description}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 leading-relaxed line-clamp-5">
                                &nbsp;
                              </p>
                            )}
                          </div>

                          {/* Tags */}
                          {memory.hashtags && memory.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {Array.from(
                                new Set(
                                  memory.hashtags.filter((tag) => {
                                    const hasLatin = /[A-Za-z]/.test(tag);
                                    const hasCJK = /[\u3400-\u9FFF]/.test(tag);
                                    return language === "en" ? hasLatin || !hasCJK : hasCJK || !hasLatin;
                                  })
                                )
                              ).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action buttons under description */}
                          <div className="flex justify-end gap-3 mt-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!memory.id.startsWith("demo-")) {
                                  handleDownloadCard();
                                }
                              }}
                              disabled={memory.id.startsWith("demo-")}
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all duration-300 space-x-2 ${
                                memory.id.startsWith("demo-")
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                  : "bg-gradient-to-b from-emerald-500 to-green-600 text-white hover:shadow-xl hover:scale-105"
                              }`}
                            >
                              <span>📥</span>
                              <span>
                                {language === "en" ? "Download Card" : "下載記憶卡"}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!memory.id.startsWith("demo-")) {
                                handleDeleteMemory(memory.id);
                                }
                              }}
                              disabled={memory.id.startsWith("demo-")}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                memory.id.startsWith("demo-")
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                  : "bg-red-500 hover:bg-red-600 text-white hover:scale-110 hover:shadow-xl"
                              }`}
                              title={memory.id.startsWith("demo-") ? "Demo cards cannot be deleted" : "Delete memory"}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
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
                  ) : (
                    /* Timeline View */
                    <div className="relative pl-6 mb-4">
                      {/* Vertical line */}
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-100 pointer-events-none" />

                      <div className="space-y-4">
                        {memoryCards.map((memory) => (
                          <div key={memory.id} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute -left-1.5 top-6 w-3 h-3 rounded-full bg-white border-2 border-emerald-500 shadow-sm" />

                            <div
                              onClick={() =>
                                setSelectedMemory((prev) => (prev === memory.id ? null : memory.id))
                              }
                              className={`ml-4 rounded-[2rem] p-5 border-2 cursor-pointer transition-all duration-300 ${
                                selectedMemory === memory.id
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base font-semibold text-gray-900">
                                  {memory.title}
                                </h3>
                                <span className="text-xs text-gray-500">{memory.date}</span>
                              </div>

                              {/* Media + description inline */}
                              <div className="flex gap-3">
                                {/* Small media preview row */}
                                <div className="flex gap-2 mt-1">
                                  {memory.media.map((emoji, index) => {
                                    const hasImage = memory.mediaImages && memory.mediaImages[index];
                                    return (
                                      <div
                                        key={index}
                                        className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg overflow-hidden"
                                      >
                                        {hasImage ? (
                                          <img
                                            src={memory.mediaImages[index]}
                                            alt={`Memory ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span>{emoji}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="flex-1">
                                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                    {memory.description || "\u00A0"}
                                  </p>
                                  {memory.hashtags && memory.hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Array.from(
                                        new Set(
                                          memory.hashtags.filter((tag) => {
                                            const hasLatin = /[A-Za-z]/.test(tag);
                                            const hasCJK = /[\u3400-\u9FFF]/.test(tag);
                                            return language === "en" ? hasLatin || !hasCJK : hasCJK || !hasLatin;
                                          })
                                        )
                                      ).map((tag, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex justify-end gap-2 mt-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!memory.id.startsWith("demo-")) {
                                      handleDeleteMemory(memory.id);
                                    }
                                  }}
                                  disabled={memory.id.startsWith("demo-")}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow ${
                                    memory.id.startsWith("demo-")
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                      : "bg-red-500 hover:bg-red-600 text-white hover:scale-110"
                                  }`}
                                  title={memory.id.startsWith("demo-") ? "Demo cards cannot be deleted" : "Delete memory"}
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Memory Details */}
              <div className="flex flex-col h-full min-h-0">
                {selectedMemory ? (
                  <div className="flex-1 flex flex-col min-h-0 mb-6">
                    {(() => {
                      const memory = memoryCards.find(m => m.id === selectedMemory);
                      if (!memory) return null;

                      return (
                        <div
                          ref={detailCardRef}
                          className="flex-1 bg-emerald-50 rounded-[2rem] p-6 shadow-lg border-2 border-emerald-100 flex flex-col min-h-0"
                        >
                          {/* Image Section - fixed height to fill available space (solid soft green) */}
                          <div className="flex-1 min-h-0 bg-green-100 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                            {(() => {
                              const images = detailViewImages[memory.id] || [];
                              if (images.length > 0) {
                                // Show first image or small grid if multiple
                                return (
                                  <div className="w-full h-full relative">
                                    {images.length === 1 ? (
                                      <div className="w-full h-full relative group">
                                      <img
                                        src={images[0]}
                                        alt={memory.title}
                                        className="w-full h-full object-cover"
                                      />
                                        {/* Remove + download buttons for single image (non-demo only) */}
                                        {!memory.id.startsWith('demo-') && (
                                          <>
                                            <button
                                              type="button"
                                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                                              title="Remove image"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Compute updated images once so we can sync detail view, storage, and cards
                                                let updatedImages: string[] = [];
                                                setDetailViewImages(prev => {
                                                  const current = prev[memory.id] || [];
                                                  updatedImages = current.slice(1); // remove index 0
                                                  if (typeof window !== "undefined") {
                                                    const imageStorageKey = `memory_images_${memory.id}`;
                                                    const stored = localStorage.getItem(imageStorageKey);
                                                    if (stored) {
                                                      try {
                                                        const parsed = JSON.parse(stored);
                                                        const newStored = parsed.slice(1);
                                                        localStorage.setItem(imageStorageKey, JSON.stringify(newStored));
                                                      } catch {
                                                        // ignore parse errors
                                                      }
                                                    }
                                                  }
                                                  return {
                                                    ...prev,
                                                    [memory.id]: updatedImages,
                                                  };
                                                });
                                                // Also update the card preview immediately
                                                setMemoryCards(prev =>
                                                  prev.map(m =>
                                                    m.id === memory.id
                                                      ? {
                                                          ...m,
                                                          mediaImages: updatedImages.slice(0, 3),
                                                        }
                                                      : m
                                                  )
                                                );
                                                // Reload from storage to ensure everything stays in sync
                                                loadMemories();
                                              }}
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                              </svg>
                                            </button>
                                            <button
                                              type="button"
                                              className="absolute top-2 right-12 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                                              title="Download image"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadImage(memory.id, 0);
                                              }}
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4"
                                                />
                                              </svg>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-1 w-full h-full p-1">
                                        {images.slice(0, 4).map((img, idx) => (
                                          <div key={idx} className="relative group">
                                          <img
                                            src={img}
                                            alt={`${memory.title} ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-lg"
                                          />
                                            {/* Remove & download buttons (only for non-demo cards) */}
                                            {!memory.id.startsWith('demo-') && (
                                              <>
                                                <button
                                                  type="button"
                                                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                                                  title="Remove image"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Remove this image from state and localStorage
                                                    let updatedImages: string[] = [];
                                                    setDetailViewImages(prev => {
                                                      const current = prev[memory.id] || [];
                                                      updatedImages = current.filter((_, i) => i !== idx);
                                                      if (typeof window !== "undefined") {
                                                        const imageStorageKey = `memory_images_${memory.id}`;
                                                        const stored = localStorage.getItem(imageStorageKey);
                                                        if (stored) {
                                                          try {
                                                            const parsed = JSON.parse(stored);
                                                            const newStored = parsed.filter((_: any, i: number) => i !== idx);
                                                            localStorage.setItem(imageStorageKey, JSON.stringify(newStored));
                                                          } catch {
                                                            // ignore parse errors
                                                          }
                                                        }
                                                      }
                                                      return {
                                                        ...prev,
                                                        [memory.id]: updatedImages,
                                                      };
                                                    });
                                                    // Update card thumbnails immediately
                                                    setMemoryCards(prev =>
                                                      prev.map(m =>
                                                        m.id === memory.id
                                                          ? {
                                                              ...m,
                                                              mediaImages: updatedImages.slice(0, 3),
                                                            }
                                                          : m
                                                      )
                                                    );
                                                    // Reload cards to keep everything synced with storage
                                                    loadMemories();
                                                  }}
                                                >
                                                  <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                  </svg>
                                                </button>
                                                <button
                                                  type="button"
                                                  className="absolute top-2 right-12 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                                                  title="Download image"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadImage(memory.id, idx);
                                                  }}
                                                >
                                                  <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4"
                                                    />
                                                  </svg>
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                // No images yet: show Style 4-inspired Add Media + Generate Image buttons inside the green area
                                return (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-4 text-center">
                                    <div className="space-y-2">
                                      <p className="text-sm text-gray-700 font-medium">
                                        {language === "en"
                                          ? "Add a photo or let AI paint this memory for you."
                                          : "可以自己加一張相，或者交畀 AI 幫你畫出呢段回憶。"}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                      {/* Add Media (opens file picker) */}
                                      <button
                                        type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fileInputRef.current?.click();
                                    }}
                                        className="inline-block px-6 py-3 bg-emerald-200 text-emerald-800 rounded-full text-sm font-medium hover:bg-emerald-300 transition-all duration-300 ease-in-out"
                                  >
                                        {language === "en" ? "📎 Add Media" : "📎 新增媒體"}
                                      </button>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileInputChange(memory.id, e)}
                                      onClick={(e) => e.stopPropagation()}
                                    />

                                      {/* Generate Image (calls Imagen 4 via API) */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleGenerateImages(memory.id);
                                        }}
                                        disabled={!!generatingImages[memory.id]}
                                        className="inline-block px-6 py-3 bg-emerald-200 text-emerald-800 rounded-full text-sm font-medium hover:bg-emerald-300 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                                      >
                                        {language === "en"
                                          ? `🎨 ${generatingImages[memory.id] ? "Generating..." : "Generate Image"}`
                                          : `🎨 ${
                                              generatingImages[memory.id]
                                                ? "生成緊圖片⋯⋯"
                                                : "生成回憶圖片"
                                            }`}
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                            })()}
                          </div>

                          {/* Card Content - match garden card typography/layout */}
                          <div className="flex flex-col flex-shrink-0">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {memory.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {memory.description}
                            </p>
                            {/* Tags */}
                            {memory.hashtags && memory.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {Array.from(
                                  new Set(
                                    memory.hashtags.filter((tag) => {
                                      const hasLatin = /[A-Za-z]/.test(tag);
                                      const hasCJK = /[\u3400-\u9FFF]/.test(tag);
                                      return language === "en" ? hasLatin || !hasCJK : hasCJK || !hasLatin;
                                    })
                                  )
                                ).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{memory.date}</span>
                              {/* We don't have categories here, so we omit the pill for now */}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-6">🌱</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {language === "en" ? "Select a Memory" : "揀一張記憶卡"}
                      </h3>
                      <p className="text-gray-600">
                        {language === "en"
                          ? "Click on a memory card to see its full details, conversation summary, and related media."
                          : "喺左邊揀一張記憶卡，可以睇到完整內容、對話摘要同相關相片／媒體。"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Pushed to bottom */}
                <div className="mt-auto flex gap-5">
                  <Link
                    href="/memory-stacks"
                    className="flex-1 text-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    {language === "en" ? "Back" : "返回堆疊"}
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 text-center bg-gradient-to-b from-emerald-500 to-green-600 text-white px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {language === "en" ? "Back to Home" : "返回首頁"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

