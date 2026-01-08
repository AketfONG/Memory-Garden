export interface MemoryStack {
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
  timestamp: string;
}

class StackStorage {
  private readonly STORAGE_KEY = 'memory_garden_stacks';
  private readonly MAX_STACKS = 100;

  // Save a new stack
  saveStack(stackData: Omit<MemoryStack, 'id' | 'timestamp'>): string {
    try {
      const existingStacks = this.getAllStacks();
      
      // Create unique ID
      const id = `stack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create stack object
      const stack: MemoryStack = {
        id,
        ...stackData,
        timestamp: new Date().toISOString()
      };

      // Add to existing stacks
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

  // Initialize with preset stacks if empty
  initializePresets(presetStacks: Omit<MemoryStack, 'id' | 'timestamp'>[]): void {
    const existingStacks = this.getAllStacks();
    if (existingStacks.length > 0) {
      return; // Don't initialize if stacks already exist
    }

    // Save each preset stack with timestamps spread out
    const baseTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
    presetStacks.forEach((stackData, index) => {
      try {
        const stackWithTimestamp = {
          ...stackData,
          timestamp: new Date(baseTime + (index * 24 * 60 * 60 * 1000)).toISOString()
        };
        this.saveStack(stackWithTimestamp);
      } catch (error) {
        console.error("Failed to create preset stack:", error);
      }
    });
  }

  // Clear all stacks (for testing/reset)
  clearAllStacks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const stackStorage = new StackStorage();

