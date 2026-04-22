const NodeCache = require("node-cache");

// stdTTL: default TTL in seconds, checkperiod: interval to check for expired keys
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });

const cacheService = {
  get: (key) => {
    return cache.get(key);
  },

  set: (key, value, ttl) => {
    if (ttl !== undefined) {
      return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
  },

  del: (key) => {
    return cache.del(key);
  },

  flush: () => {
    return cache.flushAll();
  },

  keys: () => {
    return cache.keys();
  },

  stats: () => {
    return cache.getStats();
  },

  /**
   * Get or set — returns cached value if available, otherwise calls fn and caches result
   */
  getOrSet: async (key, fn, ttl) => {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const value = await fn();
    if (ttl !== undefined) {
      cache.set(key, value, ttl);
    } else {
      cache.set(key, value);
    }
    return value;
  },
};

module.exports = cacheService;
