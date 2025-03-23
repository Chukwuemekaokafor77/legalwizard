import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_SESSION_KEY || 'legalwizard-secure-key';
const ENCRYPTION_CONFIG = {
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
  iv: CryptoJS.lib.WordArray.random(16)
};

export class UserSessionService {
  static async saveTemporaryState(state) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(state),
        SECRET_KEY,
        ENCRYPTION_CONFIG
      ).toString();
      localStorage.setItem('tempPathwayState', encrypted);
      return true;
    } catch (error) {
      console.error('Session save failed:', error);
      this.clearSession();
      return false;
    }
  }

  static async saveProgress(state) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(state),
        SECRET_KEY,
        ENCRYPTION_CONFIG
      ).toString();
      localStorage.setItem('userPathwayState', encrypted);
      return true;
    } catch (error) {
      console.error('Progress save failed:', error);
      this.clearSession();
      return false;
    }
  }

  static async loadPathwayState() {
    try {
      const encrypted = localStorage.getItem('userPathwayState') || 
                       localStorage.getItem('tempPathwayState');
      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(
        encrypted,
        SECRET_KEY,
        ENCRYPTION_CONFIG
      );
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Session load failed:', error);
      this.clearSession();
      return null;
    }
  }

  static clearSession() {
    localStorage.removeItem('tempPathwayState');
    localStorage.removeItem('userPathwayState');
  }

  static validateState(state) {
    return !!state && 
           typeof state === 'object' &&
           !!state.activePathway &&
           Array.isArray(state.documents) &&
           typeof state.progress === 'object' &&
           typeof state.answers === 'object';
  }

  static autoSaveInterval(callback, interval = 300000) {
    let intervalId = null;
    const start = () => {
      intervalId = setInterval(async () => {
        const state = await this.loadPathwayState();
        if (state) callback(state);
      }, interval);
    };
    const stop = () => intervalId && clearInterval(intervalId);
    return { start, stop };
  }
}