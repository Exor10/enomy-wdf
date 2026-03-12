(() => {
  const apiBaseUrl = 'https://open.er-api.com/v6/latest/';
  const supportedCurrencies = ['GBP', 'USD', 'EUR', 'BRL', 'JPY', 'TRY'];
  const cacheKey = 'enomy-rates-cache-v1';
  const cacheMaxAgeMs = 60 * 60 * 1000;

  const amountInput = document.getElementById('amount');
  const fromSelect = document.getElementById('fromCurrency');
  const toSelect = document.getElementById('toCurrency');
  const convertBtn = document.getElementById('convertBtn');
  const swapBtn = document.getElementById('swapBtn');
  const convertedAmountEl = document.getElementById('convertedAmount');
  const exchangeRateEl = document.getElementById('exchangeRate');
  const lastUpdatedEl = document.getElementById('lastUpdated');
  const errorMessageEl = document.getElementById('errorMessage');
  const currencyTags = document.getElementById('currencyTags');
  let trendChart;

  const showError = (message) => {
    errorMessageEl.textContent = message;
    errorMessageEl.classList.remove('hidden');
  };

  const clearError = () => {
    errorMessageEl.classList.add('hidden');
    errorMessageEl.textContent = '';
  };

  const populateCurrencies = () => {
    supportedCurrencies.forEach((currency) => {
      const optionFrom = document.createElement('option');
      optionFrom.value = currency;
      optionFrom.textContent = currency;

      const optionTo = optionFrom.cloneNode(true);
      fromSelect.appendChild(optionFrom);
      toSelect.appendChild(optionTo);

      const tag = document.createElement('span');
      tag.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-accent border border-blue-100';
      tag.textContent = currency;
      currencyTags.appendChild(tag);
    });

    fromSelect.value = 'USD';
    toSelect.value = 'EUR';
  };

  const getCachedRates = (baseCurrency) => {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const age = Date.now() - parsed.timestamp;
      if (parsed.base === baseCurrency && age < cacheMaxAgeMs) {
        return parsed;
      }
    } catch (error) {
      localStorage.removeItem(cacheKey);
    }
    return null;
  };

  const setCachedRates = (payload) => {
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  };

  const fetchRates = async (baseCurrency) => {
    const cached = getCachedRates(baseCurrency);
    if (cached) return cached;

    const response = await fetch(`${apiBaseUrl}${baseCurrency}`);
    if (!response.ok) {
      throw new Error('Unable to reach exchange service at this time.');
    }

    const data = await response.json();
    if (!data || !data.rates) {
      throw new Error('Unexpected exchange data format.');
    }

    const payload = {
      base: baseCurrency,
      rates: data.rates,
      updatedAt: data.time_last_update_utc || new Date().toUTCString(),
      timestamp: Date.now()
    };

    setCachedRates(payload);
    return payload;
  };

  const updateChart = (rates, baseCurrency) => {
    const labels = supportedCurrencies.filter((currency) => currency !== baseCurrency);
    const values = labels.map((currency) => Number(rates[currency]).toFixed(4));
    const ctx = document.getElementById('trendChart');
    if (!ctx || !window.Chart) return;

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `1 ${baseCurrency} equals`,
          data: values,
          backgroundColor: ['#3B82F6', '#22C55E', '#60A5FA', '#38BDF8', '#2563EB'],
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#64748b' },
            grid: { color: '#e2e8f0' }
          },
          x: {
            ticks: { color: '#475569' },
            grid: { display: false }
          }
        }
      }
    });
  };

  const updateUI = ({ amount, from, to, converted, rate, updatedAt }) => {
    convertedAmountEl.textContent = `${converted.toFixed(2)} ${to}`;
    exchangeRateEl.textContent = `Exchange rate: 1 ${from} = ${rate.toFixed(4)} ${to}`;
    lastUpdatedEl.textContent = `Last updated: ${updatedAt}`;
    clearError();
  };

  const convertCurrency = async () => {
    const amount = Number(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (Number.isNaN(amount) || amount < 0) {
      showError('Please enter a valid amount greater than or equal to 0.');
      return;
    }

    try {
      const rateData = await fetchRates(from);
      const rate = rateData.rates[to];

      if (!rate) {
        throw new Error('Selected conversion pair is not available right now.');
      }

      const converted = amount * rate;
      updateUI({ amount, from, to, converted, rate, updatedAt: rateData.updatedAt });
      updateChart(rateData.rates, from);
    } catch (error) {
      showError(error.message || 'Something went wrong while converting currency.');
    }
  };

  const handleError = (error) => {
    showError(error.message || 'An unexpected error occurred.');
  };

  const init = () => {
    populateCurrencies();

    convertBtn.addEventListener('click', convertCurrency);
    amountInput.addEventListener('input', convertCurrency);
    fromSelect.addEventListener('change', convertCurrency);
    toSelect.addEventListener('change', convertCurrency);

    swapBtn.addEventListener('click', () => {
      const previousFrom = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = previousFrom;
      convertCurrency();
    });

    convertCurrency().catch(handleError);
  };

  init();
})();
