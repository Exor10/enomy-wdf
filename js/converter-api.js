(function () {
  const API_BASE = 'https://open.er-api.com/v6/latest/';
  const CACHE_KEY = 'enomy-rates-cache-v2';
  const CACHE_TTL_MS = 60 * 60 * 1000;

  function safeParse(raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function readCache() {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  }

  function writeCache(payload) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  }

  function getRatesFromCache(baseCurrency, allowStale) {
    const cache = readCache();
    if (!cache || !cache[baseCurrency]) return null;
    const entry = cache[baseCurrency];
    const age = Date.now() - entry.timestamp;
    const fresh = age <= CACHE_TTL_MS;
    if (!fresh && !allowStale) return null;
    return {
      base: baseCurrency,
      rates: entry.rates,
      updatedAt: entry.updatedAt,
      source: fresh ? 'cache' : 'stale-cache'
    };
  }

  async function fetchRates(baseCurrency, forceRefresh) {
    if (!forceRefresh) {
      const cached = getRatesFromCache(baseCurrency, false);
      if (cached) return cached;
    }

    try {
      const response = await fetch(`${API_BASE}${baseCurrency}`);
      if (!response.ok) throw new Error('API request failed.');
      const data = await response.json();
      if (!data || !data.rates) throw new Error('Invalid API response.');

      const oldCache = readCache() || {};
      oldCache[baseCurrency] = {
        rates: data.rates,
        updatedAt: data.time_last_update_utc || new Date().toUTCString(),
        timestamp: Date.now()
      };
      writeCache(oldCache);

      return {
        base: baseCurrency,
        rates: data.rates,
        updatedAt: oldCache[baseCurrency].updatedAt,
        source: 'live'
      };
    } catch (error) {
      const fallback = getRatesFromCache(baseCurrency, true);
      if (fallback) return fallback;
      throw new Error('Unable to load exchange rates right now. Please retry in a moment.');
    }
  }

  window.ConverterApiService = { fetchRates };
})();
