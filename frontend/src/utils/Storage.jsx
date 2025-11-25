
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// For web fallback (localStorage or sessionStorage)
class WebStorage {
  constructor() {
    this.storage = window.sessionStorage; // or localStorage if persistence needed
  }

  key(n) {
    return this.storage.key(n);
  }
  getItem(key) {
    return this.storage.getItem(key);
  }
  get length() {
    return this.storage.length;
  }
  setItem(key, value) {
    this.storage.setItem(key, value);
  }
  removeItem(key) {
    this.storage.removeItem(key);
  }
  clear() {
    this.storage.clear();
  }
}

// SecureStorage wrapper
class SecureStorage {
  async key(n) {
    // SecureStore does not support key enumeration
    throw new Error('Not supported in SecureStore');
  }

  async getItem(key) {
    return await SecureStore.getItemAsync(key);
  }

  get length() {
    // SecureStore does not expose length
    return null;
  }

  async setItem(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key) {
    await SecureStore.deleteItemAsync(key);
  }

  async clear() {
    // SecureStore does not support clear-all; you must track keys manually
    throw new Error('Clear not supported in SecureStore');
  }
}

// Export platform-specific instance
const sessionStorage = Platform.OS === 'web' ? new WebStorage() : new SecureStorage();

export { sessionStorage };