// Source - https://stackoverflow.com/a
// Posted by firecraft gaming
// Retrieved 2025-11-15, License - CC BY-SA 4.0

class Storage {
    constructor() {
        this.data = new Map();
    }

    key(n) {
        return [...this.data.keys()][n];
    }
    getItem(key) {
        return this.data.get(key);
    }
    get length() {
        return this.data.size;
    }

    setItem(key, value) {
        this.data.set(key, value);
    }
    removeItem(key) {
        this.data.delete(key);
    }
    clear() {
        this.data = new Map();
    }
    
}

// Create a single instance
const sessionStorage = new Storage();


export { Storage, sessionStorage };
