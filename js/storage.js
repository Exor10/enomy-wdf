(function () {
  const STORAGE_KEYS = {
    quotes: 'enomy-demo-quotes',
    conversions: 'enomy-demo-conversions',
    savings: 'enomy-demo-savings'
  };

  function safeParse(raw, fallback) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readList(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return safeParse(raw, []);
  }

  function writeList(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function addRecent(key, item, maxItems) {
    const list = readList(key);
    list.unshift(item);
    writeList(key, list.slice(0, maxItems));
  }

  window.StorageService = {
    keys: STORAGE_KEYS,
    getQuotes: () => readList(STORAGE_KEYS.quotes),
    addQuote: (quote) => addRecent(STORAGE_KEYS.quotes, quote, 20),
    getConversions: () => readList(STORAGE_KEYS.conversions),
    addConversion: (conversion) => addRecent(STORAGE_KEYS.conversions, conversion, 25),
    getSavings: () => readList(STORAGE_KEYS.savings),
    addSavings: (projection) => addRecent(STORAGE_KEYS.savings, projection, 25)
  };
})();
