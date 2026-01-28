import type { MemoryStack } from './stackStorage';

export const PRESET_STACKS: Omit<MemoryStack, 'id' | 'timestamp'>[] = [
  {
    title: "Summer Beach Day",
    description: "A perfect day at the beach with friends, building sandcastles and enjoying the warm sun.",
    emoji: "🏖️",
    startDate: "2025-07-15",
    startTime: "",
    endDate: "",
    endTime: "",
    vagueTime: "Last summer",
    categories: ["friends", "nature"],
    customCategory: "",
    customEmotion: "happy",
    tags: "beach, summer, friends, fun",
    mediaFiles: [
      { name: "beach-photo-1.jpg", type: "image/jpeg", size: 2450000 },
      { name: "beach-photo-2.jpg", type: "image/jpeg", size: 2180000 }
    ]
  },
  {
    title: "Family Birthday Celebration",
    description: "Celebrating grandma's 80th birthday with the whole family gathered together.",
    emoji: "🎂",
    startDate: "2025-09-22",
    startTime: "",
    endDate: "",
    endTime: "",
    vagueTime: "This fall",
    categories: ["family"],
    customCategory: "",
    customEmotion: "grateful",
    tags: "birthday, family, celebration",
    mediaFiles: [
      { name: "birthday-cake.jpg", type: "image/jpeg", size: 1920000 },
      { name: "family-photo.jpg", type: "image/jpeg", size: 3100000 }
    ]
  },
  {
    title: "Mountain Hiking Adventure",
    description: "Challenging hike to the summit with breathtaking views and a sense of accomplishment.",
    emoji: "🏔️",
    startDate: "2025-06-10",
    startTime: "",
    endDate: "",
    endTime: "",
    vagueTime: "Early summer",
    categories: ["nature", "achievement"],
    customCategory: "",
    customEmotion: "proud",
    tags: "hiking, mountains, adventure, nature",
    mediaFiles: [
      { name: "summit-view.jpg", type: "image/jpeg", size: 2800000 },
      { name: "trail-photo.jpg", type: "image/jpeg", size: 1950000 }
    ]
  },
  {
    title: "Anniversary Dinner",
    description: "Romantic dinner at our favorite restaurant, celebrating another year together.",
    emoji: "❤️",
    startDate: "2025-05-14",
    startTime: "",
    endDate: "",
    endTime: "",
    vagueTime: "This spring",
    categories: ["love"],
    customCategory: "",
    customEmotion: "happy",
    tags: "anniversary, dinner, love, romantic",
    mediaFiles: [
      { name: "dinner-table.jpg", type: "image/jpeg", size: 2250000 },
      { name: "restaurant-view.jpg", type: "image/jpeg", size: 1980000 }
    ]
  },
  {
    title: "Work Project Launch",
    description: "Successfully launched our biggest project of the year with the entire team.",
    emoji: "🚀",
    startDate: "2025-10-05",
    startTime: "",
    endDate: "",
    endTime: "",
    vagueTime: "This fall",
    categories: ["work", "achievement"],
    customCategory: "",
    customEmotion: "proud",
    tags: "work, project, team, success",
    mediaFiles: [
      { name: "team-meeting.jpg", type: "image/jpeg", size: 2650000 },
      { name: "launch-event.jpg", type: "image/jpeg", size: 3120000 }
    ]
  },
  {
    title: "Weekend Road Trip",
    description: "Spontaneous road trip to a nearby town, discovering hidden gems and local cafes.",
    emoji: "🚗",
    startDate: "2025-08-18",
    startTime: "",
    endDate: "2024-08-20",
    endTime: "",
    vagueTime: "Late summer",
    categories: ["travel", "friends"],
    customCategory: "",
    customEmotion: "excited",
    tags: "road trip, travel, adventure, friends",
    mediaFiles: [
      { name: "road-trip-1.jpg", type: "image/jpeg", size: 2400000 },
      { name: "local-cafe.jpg", type: "image/jpeg", size: 2100000 }
    ]
  },
  {
    title: "Art Gallery Opening",
    description: "Attended a local artist's gallery opening, surrounded by beautiful paintings and creative energy.",
    emoji: "🖼️",
    startDate: "2025-11-12",
    startTime: "",
    endDate: "",
    endTime: "",
    vagueTime: "This month",
    categories: ["creativity", "friends"],
    customCategory: "",
    customEmotion: "inspired",
    tags: "art, gallery, creativity, culture",
    mediaFiles: [
      { name: "gallery-artwork.jpg", type: "image/jpeg", size: 2750000 },
      { name: "gallery-space.jpg", type: "image/jpeg", size: 2200000 }
    ]
  }
];

