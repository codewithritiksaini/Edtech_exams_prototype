// =============================================================================
// NODE.JS TEST ENVIRONMENT BOOTSTRAPPER
// Sets up global browser mocks (localStorage, window, CustomEvent)
// before any ES module imports evaluate.
// =============================================================================

const storageStore = new Map();

globalThis.localStorage = {
  getItem: (key) => storageStore.get(key) || null,
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear()
};

globalThis.window = {
  localStorage: globalThis.localStorage,
  dispatchEvent: (event) => {
    // optional dispatch listener notification
    return true;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  location: {
    href: 'http://localhost:5173/'
  }
};

globalThis.CustomEvent = class CustomEvent {
  constructor(type, eventInitDict = {}) {
    this.type = type;
    this.detail = eventInitDict.detail || null;
  }
};
