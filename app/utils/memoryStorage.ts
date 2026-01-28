export interface MemoryMessage {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SavedMemory {
  id: string;
  title: string;
  description: string;
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
  mode: 'normal' | 'simple';
  timestamp: string;
  chatHistory: MemoryMessage[];
  aiInsights: string;
}

class MemoryStorage {
  private readonly STORAGE_KEY = 'memory_garden_memories';
  private readonly MAX_MEMORIES = 100; // Prevent unlimited growth

  // Save a new memory (only one user-created memory at a time)
  saveMemory(memoryData: any, chatHistory: MemoryMessage[], aiInsights: string): string {
    try {
      // Always work with the latest memories list
      let existingMemories = this.getAllMemories();

      // Check for duplicate memories based on title and description
      const isDuplicate = existingMemories.some((existing) => {
        const titleMatch = existing.title === (memoryData.title || 'Untitled Memory');
        const descriptionMatch = existing.description === (memoryData.description || '');
        const timeMatch =
          Math.abs(
            new Date(existing.timestamp).getTime() -
              new Date(memoryData.timestamp || new Date()).getTime()
          ) < 5000; // Within 5 seconds

        return titleMatch && descriptionMatch && timeMatch;
      });

      if (isDuplicate) {
        console.log('Duplicate memory detected, skipping save');
        // Return the ID of the existing memory instead of creating a new one
        const duplicateMemory = existingMemories.find((existing) => {
          const titleMatch = existing.title === (memoryData.title || 'Untitled Memory');
          const descriptionMatch = existing.description === (memoryData.description || '');
          const timeMatch =
            Math.abs(
              new Date(existing.timestamp).getTime() -
                new Date(memoryData.timestamp || new Date()).getTime()
            ) < 5000;
          return titleMatch && descriptionMatch && timeMatch;
        });
        return duplicateMemory?.id || '';
      }

      // Only allow one user-created memory card at a time:
      // clear existing memories and associated image storage keys.
      if (typeof window !== 'undefined' && existingMemories.length > 0) {
        try {
          // Remove all saved memory images and stack images
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('memory_images_') || key.startsWith('stack_images_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch (e) {
          console.error('Failed to clear existing memory/stack images before saving new memory:', e);
        }
        // Reset memories list so only the new one will remain
        existingMemories = [];
      }

      // Create unique ID
      const id = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create memory object
      const memory: SavedMemory = {
        id,
        title: memoryData.title || 'Untitled Memory',
        description: memoryData.description || '',
        startDate: memoryData.startDate || '',
        startTime: memoryData.startTime || '',
        endDate: memoryData.endDate || '',
        endTime: memoryData.endTime || '',
        vagueTime: memoryData.vagueTime || '',
        categories: memoryData.categories || [],
        customCategory: memoryData.customCategory || '',
        customEmotion: memoryData.customEmotion || '',
        tags: memoryData.tags || '',
        mediaFiles: memoryData.mediaFiles || [],
        mode: memoryData.mode || 'simple',
        timestamp: memoryData.timestamp || new Date().toISOString(),
        chatHistory: chatHistory || [],
        aiInsights: aiInsights || ''
      };

      // Add to existing memories (which may now be empty)
      existingMemories.unshift(memory); // Add to beginning (newest first)

      // Limit total memories (still enforce MAX_MEMORIES just in case)
      if (existingMemories.length > this.MAX_MEMORIES) {
        existingMemories.splice(this.MAX_MEMORIES);
      }

      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingMemories));

      return id;
    } catch (error) {
      console.error('Error saving memory:', error);
      throw new Error('Failed to save memory');
    }
  }

  // Get all memories
  getAllMemories(): SavedMemory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const memories = JSON.parse(stored);
      
      // Convert timestamp strings back to Date objects for chat messages
      return memories.map((memory: any) => ({
        ...memory,
        chatHistory: memory.chatHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading memories:', error);
      return [];
    }
  }

  // Get a specific memory by ID
  getMemory(id: string): SavedMemory | null {
    try {
      const memories = this.getAllMemories();
      return memories.find(memory => memory.id === id) || null;
    } catch (error) {
      console.error('Error loading memory:', error);
      return null;
    }
  }

  // Update chat history for a memory
  updateChatHistory(memoryId: string, newMessage: MemoryMessage): boolean {
    try {
      const memories = this.getAllMemories();
      const memoryIndex = memories.findIndex(memory => memory.id === memoryId);
      
      if (memoryIndex === -1) return false;
      
      // Add new message to chat history
      memories[memoryIndex].chatHistory.push(newMessage);
      
      // Save updated memories
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memories));
      
      return true;
    } catch (error) {
      console.error('Error updating chat history:', error);
      return false;
    }
  }

  // Delete a memory
  deleteMemory(id: string): boolean {
    try {
      const memories = this.getAllMemories();
      const filteredMemories = memories.filter(memory => memory.id !== id);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredMemories));
      
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  }

  // Get memory count
  getMemoryCount(): number {
    return this.getAllMemories().length;
  }

  // Get memories by category
  getMemoriesByCategory(category: string): SavedMemory[] {
    const memories = this.getAllMemories();
    return memories.filter(memory => 
      memory.categories.includes(category) || 
      memory.customCategory === category
    );
  }

  // Search memories
  searchMemories(query: string): SavedMemory[] {
    const memories = this.getAllMemories();
    const lowerQuery = query.toLowerCase();
    
    return memories.filter(memory => 
      memory.title.toLowerCase().includes(lowerQuery) ||
      memory.description.toLowerCase().includes(lowerQuery) ||
      memory.tags.toLowerCase().includes(lowerQuery) ||
      memory.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
    );
  }

  // Clear all memories (for testing/reset)
  clearAllMemories(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const memoryStorage = new MemoryStorage();
