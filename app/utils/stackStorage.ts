export interface MemoryStack {
  id: string;
  title: string;
  description: string;
  // Single emoji that visually represents the stack (chosen by AI or preset)
  emoji?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  vagueTime: string;
  categories: string[];
  customCategory: string;
  customEmotion: string;
  tags: string;
  mediaFiles: Array<{
    name: string;
    type: string;
    size: number;
  }>;
  timestamp: string;
}

import { PRESET_STACKS } from './presetStacks';

class StackStorage {
  private readonly STORAGE_KEY = 'memory_garden_stacks';
  private readonly MAX_STACKS = 100;

  // Save a new stack (only one user-created stack at a time)
  saveStack(stackData: Omit<MemoryStack, 'id' | 'timestamp'>): string {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot save stack on server side');
      }
      
      let existingStacks = this.getAllStacks();
      
      // Only allow one user-created stack at a time: keep demo (preset) stacks, clear previous user stacks + their images
      if (existingStacks.length > 0) {
        // Identify preset stacks by title
        const presetTitles = new Set(PRESET_STACKS.map((s) => s.title));
        const presetStacksOnly = existingStacks.filter((s) => presetTitles.has(s.title));

        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('stack_images_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch (e) {
          console.error('Failed to clear existing stack images before saving new stack:', e);
        }
        // Drop all existing user stacks but keep presets
        existingStacks = presetStacksOnly;
      }
      
      // Create unique ID
      const id = `stack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create stack object
      const stack: MemoryStack = {
        id,
        ...stackData,
        timestamp: new Date().toISOString()
      };

      // Add to existing stacks (now at most one)
      existingStacks.unshift(stack); // Add to beginning (newest first)
      
      // Limit total stacks
      if (existingStacks.length > this.MAX_STACKS) {
        existingStacks.splice(this.MAX_STACKS);
      }

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingStacks));
      
      return id;
    } catch (error) {
      console.error('Error saving stack:', error);
      throw new Error('Failed to save stack');
    }
  }

  // Get all stacks
  getAllStacks(): MemoryStack[] {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading stacks:', error);
      return [];
    }
  }

  // Get a specific stack by ID
  getStack(id: string): MemoryStack | null {
    try {
      const stacks = this.getAllStacks();
      return stacks.find(stack => stack.id === id) || null;
    } catch (error) {
      console.error('Error loading stack:', error);
      return null;
    }
  }

  // Delete a stack
  deleteStack(id: string): boolean {
    try {
      const stacks = this.getAllStacks();
      const filteredStacks = stacks.filter(stack => stack.id !== id);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredStacks));
      
      return true;
    } catch (error) {
      console.error('Error deleting stack:', error);
      return false;
    }
  }

  // Initialize with preset stacks; always ensure 7 demo stacks exist, while keeping any user stacks
  initializePresets(presetStacks: Omit<MemoryStack, 'id' | 'timestamp'>[]): void {
    if (typeof window === 'undefined') return;
    
    const existingStacks = this.getAllStacks();
    const existingTitles = new Set(existingStacks.map((s) => s.title));

    // Prepare a copy we can mutate
    const updatedStacks = [...existingStacks];

    // Spread preset timestamps over the past 7 days
    const baseTime = Date.now() - 7 * 24 * 60 * 60 * 1000;

    presetStacks.forEach((preset, index) => {
      if (!existingTitles.has(preset.title)) {
        // Create a preset stack entry if it's missing
        const id = `preset_${preset.title.replace(/\s+/g, "-").toLowerCase()}_${index}`;
        const stack: MemoryStack = {
          id,
          ...preset,
          timestamp: new Date(baseTime + index * 24 * 60 * 60 * 1000).toISOString(),
        };
        updatedStacks.push(stack);
      }
    });

    // If we added anything, persist back to storage
    if (updatedStacks.length !== existingStacks.length) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedStacks));
      } catch (error) {
        console.error("Failed to save preset stacks:", error);
      }
    }
  }

  // Clear all stacks (for testing/reset)
  clearAllStacks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const stackStorage = new StackStorage();

