export interface DraftData {
  noprod: string;
  produkName: string;
  satuan: string;
  bahanItems: any[];
}

// Simple localStorage service for draft management
export class LocalStorageService {
  private static readonly DRAFT_KEY = 'partlist-produk-draft';

  // Save 'draft 'to localStorage only
  static saveDraft(draftData: DraftData): void {
    try {
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }

  // Auto-save draft with timestamp
  static autoSave(draftData: DraftData, userId: string): void {
    const draftWithTimestamp = {
      ...draftData,
      user_id: userId,
      lastSaved: new Date().toISOString()
    };
    this.saveDraft(draftWithTimestamp);
  }

  // Load draft from localStorage only
  static loadDraft(userId?: string): DraftData | null {
    try {
      const stored = localStorage.getItem(this.DRAFT_KEY);
      if (stored) {
        const draft = JSON.parse(stored);
        // Only return if it belongs to current user or no user specified
        if (!userId || draft.user_id === userId) {
          return draft;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  // Clear draft from localStorage
  static clearDraft(userId?: string): void {
    try {
      if (userId) {
        // Only clear if it belongs to current user
        const draft = this.loadDraft(userId);
        if (draft) {
          localStorage.removeItem(this.DRAFT_KEY);
        }
      } else {
        localStorage.removeItem(this.DRAFT_KEY);
      }
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }

  // Check if draft exists
  static hasDraft(userId?: string): boolean {
    return this.loadDraft(userId) !== null;
  }
}
