import { encryptData, decryptData } from '../utils/security';

export class SessionService {
  static PATHWAY_KEY = 'activePathway';
  static GUEST_DATA_KEY = 'guestPathwayData';

  static saveProgress(userId, data) {
    if (userId) {
      // Authenticated user save
      return this.cloudSave(userId, data);
    }
    // Guest save
    const encrypted = encryptData(data);
    localStorage.setItem(this.GUEST_DATA_KEY, encrypted);
  }

  static async cloudSave(userId, data) {
    const response = await fetch('/api/save-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Save failed');
    return response.json();
  }

  static loadProgress(userId) {
    if (userId) {
      return this.cloudLoad(userId);
    }
    const encrypted = localStorage.getItem(this.GUEST_DATA_KEY);
    return encrypted ? decryptData(encrypted) : null;
  }

  static async cloudLoad(userId) {
    const response = await fetch(`/api/load-progress/${userId}`);
    if (!response.ok) throw new Error('Load failed');
    return response.json();
  }

  static clearProgress(userId) {
    if (userId) {
      return this.cloudClear(userId);
    }
    localStorage.removeItem(this.GUEST_DATA_KEY);
  }

  static async cloudClear(userId) {
    const response = await fetch(`/api/clear-progress/${userId}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
}