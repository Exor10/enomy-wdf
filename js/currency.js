const SUPPORTED_CURRENCIES = ['GBP', 'USD', 'EUR', 'BRL', 'JPY', 'TRY'];
const API_BASE = 'https://open.er-api.com/v6/latest/';
const CACHE_KEY = 'enomy-rates-cache';
const CACHE_TTL_MS = 60 * 60 * 1000;

const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertButton = document.getElementById('convert-btn');
const swapButton = document.getElementById('swap-btn');
const convertedValueElement = document.getElementById('converted-value');
const exchangeRateElement = document.getElementById('exchange-rate');
const lastUpdatedElement = document.getElementById('last-updated');
const errorMessageElement = document.getElementById('error-message');

function populateCurrencyOptions() {
  SUPPORTED_CURRENCIES.forEach((currency) => {
    const fromOption = document.createElement('option');
    fromOption.value = currency;
    fromOption.textContent = currency;
    fromCurrencySelect.appendChild(fromOption);

    const toOption = document.createElement('option');
    toOption.value = currency;
    toOption.textContent = currency;
    toCurrencySelect.appendChild(toOption);
  });

  fromCurrencySelect.value = 'USD';
  toCurrencySelect.value = 'EUR';
}

function getCachedRates(baseCurrency) {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const age = Date.now() - parsed.timestamp;
    if (parsed.base === baseCurrency && age < CACHE_TTL_MS) {
      return parsed;
    }
  } catch (error) {
    localStorage.removeItem(CACHE_KEY);
  }

  return null;
}

function setCachedRates(payload) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

async function fetchRates(baseCurrency) {
  const cached = getCachedRates(baseCurrency);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}${baseCurrency}`);
  if (!response.ok) {
    throw new Error('Unable to fetch exchange rates right now.');
  }

  const data = await response.json();
  if (!data || !data.rates) {
    throw new Error('Exchange rate API returned an unexpected response.');
  }

  const payload = {
    base: baseCurrency,
    rates: data.rates,
    updatedAt: data.time_last_update_utc || new Date().toUTCString(),
    timestamp: Date.now()
  };

  setCachedRates(payload);
  return payload;
}

function updateUI(result) {
  convertedValueElement.textContent = `${result.converted.toFixed(2)} ${result.to}`;
  exchangeRateElement.textContent = `Exchange rate: 1 ${result.from} = ${result.rate.toFixed(4)} ${result.to}`;
  lastUpdatedElement.textContent = `Last updated: ${result.updatedAt}`;
  errorMessageElement.classList.add('hidden');
  errorMessageElement.textContent = '';
}

function handleError(error) {
  errorMessageElement.classList.remove('hidden');
  errorMessageElement.textContent = error.message || 'Something went wrong.';
}

async function convertCurrency() {
  const amount = Number(amountInput.value);
  const from = fromCurrencySelect.value;
  const to = toCurrencySelect.value;

  if (Number.isNaN(amount) || amount < 0) {
    handleError(new Error('Please enter a valid amount (0 or greater).'));
    return;
  }

  try {
    const ratePayload = await fetchRates(from);
    const rate = Number(ratePayload.rates[to]);
    if (!rate) {
      throw new Error('Conversion rate unavailable for this currency pair.');
    }

    const converted = amount * rate;
    updateUI({
      converted,
      rate,
      from,
      to,
      updatedAt: ratePayload.updatedAt
    });
  } catch (error) {
    handleError(error);
  }
}

function init() {
  populateCurrencyOptions();

  convertButton.addEventListener('click', convertCurrency);
  amountInput.addEventListener('input', convertCurrency);
  fromCurrencySelect.addEventListener('change', convertCurrency);
  toCurrencySelect.addEventListener('change', convertCurrency);
  swapButton.addEventListener('click', () => {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    convertCurrency();
  });

  convertCurrency();
}

init();
