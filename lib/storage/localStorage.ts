export interface DraftData {
  noprod: string;
  produkName: string;
  satuan: string;
  bahanItems: any[];
  lastSaved: string;
}

export class LocalStorageService {
  private static readonly DRAFT_KEY = 'partlist_draft';

  // Save draft to both localStorage and server
  static async saveDraft(data: DraftData, userId?: string): Promise<void> {
    try {
      // Save to localStorage (fallback)
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(data));
      
      // Save to server if userId provided
      if (userId) {
        try {
          await fetch('/api/part-list-produk/draft', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              draftData: data
            }),
          });
        } catch (error) {
          console.error('Error saving draft to server:', error);
          // Continue with localStorage only
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }

  // Load draft from server first, fallback to localStorage
  static async loadDraft(userId?: string): Promise<DraftData | null> {
    try {
      // Try to load from server first
      if (userId) {
        try {
          const response = await fetch(`/api/part-list-produk/draft?userId=${encodeURIComponent(userId)}`);
          if (response.ok) {
            const serverDraft = await response.json();
            if (serverDraft) {
              // Update localStorage with server data
              localStorage.setItem(this.DRAFT_KEY, JSON.stringify(serverDraft.draft_data));
              return serverDraft.draft_data;
            }
          }
        } catch (error) {
          console.error('Error loading draft from server:', error);
          // Continue with localStorage
        }
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(this.DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        // Check if draft is not too old (24 hours)
        const savedTime = new Date(draft.lastSaved);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return draft;
        } else {
          // Clear old draft
          this.clearDraft(userId);
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
    return null;
  }

  // Clear draft from both localStorage and server
  static async clearDraft(userId?: string): Promise<void> {
    try {
      // Clear from localStorage
      localStorage.removeItem(this.DRAFT_KEY);
      
      // Clear from server if userId provided
      if (userId) {
        try {
          await fetch(`/api/part-list-produk/draft?userId=${encodeURIComponent(userId)}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Error clearing draft from server:', error);
        }
      }
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }

  // Check if draft exists
  static async hasDraft(userId?: string): Promise<boolean> {
    const draft = await this.loadDraft(userId);
    return draft !== null;
  }

  // Auto-save current form data
  static async autoSave(data: DraftData, userId?: string): Promise<void> {
    await this.saveDraft(data, userId);
  }
}
