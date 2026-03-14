(function () {
  const SUPPORTED_CURRENCIES = ['GBP', 'USD', 'EUR', 'BRL', 'JPY', 'TRY'];
  const MIN_TRANSACTION = 300;
  const MAX_TRANSACTION = 5000;
  const FEE_RULES = {
    default: { percent: 0.012, fixed: 1.5 },
    GBP: { percent: 0.01, fixed: 1 },
    USD: { percent: 0.011, fixed: 1.25 },
    EUR: { percent: 0.011, fixed: 1.15 },
    BRL: { percent: 0.014, fixed: 1.8 },
    JPY: { percent: 0.009, fixed: 1.1 },
    TRY: { percent: 0.013, fixed: 1.6 }
  };

  const amountInput = document.getElementById('amount');
  const fromSelect = document.getElementById('from-currency');
  const toSelect = document.getElementById('to-currency');
  const convertBtn = document.getElementById('convert-btn');
  const retryBtn = document.getElementById('retry-btn');
  const swapBtn = document.getElementById('swap-btn');
  const inlineValidation = document.getElementById('inline-validation');

  const originalAmountEl = document.getElementById('original-amount');
  const feeAmountEl = document.getElementById('fee-amount');
  const netAmountEl = document.getElementById('net-amount');
  const convertedValueEl = document.getElementById('converted-value');
  const exchangeRateEl = document.getElementById('exchange-rate');
  const lastUpdatedEl = document.getElementById('last-updated');
  const sourceIndicatorEl = document.getElementById('source-indicator');
  const feeRulesList = document.getElementById('fee-rules-list');

  const converterError = document.getElementById('converter-error');
  const converterSuccess = document.getElementById('converter-success');

  const quoteName = document.getElementById('quote-name');
  const quoteEmail = document.getElementById('quote-email');
  const saveQuoteBtn = document.getElementById('save-quote-btn');
  const protectedSaveBtn = document.getElementById('protected-save-btn');

  function formatMoney(value, currency) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);
  }

  function populateCurrencies() {
    SUPPORTED_CURRENCIES.forEach((currency) => {
      [fromSelect, toSelect].forEach((select) => {
        const option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        select.appendChild(option);
      });
    });
    fromSelect.value = 'GBP';
    toSelect.value = 'USD';
  }

  function renderFeeRules() {
    Object.keys(FEE_RULES).filter((k) => k !== 'default').forEach((currency) => {
      const li = document.createElement('li');
      const rule = FEE_RULES[currency];
      li.textContent = `${currency}: ${(rule.percent * 100).toFixed(2)}% + ${rule.fixed.toFixed(2)} ${currency}`;
      feeRulesList.appendChild(li);
    });
  }

  function calculateFee(amount, currency) {
    const rule = FEE_RULES[currency] || FEE_RULES.default;
    return (amount * rule.percent) + rule.fixed;
  }

  function updateUI(data) {
    originalAmountEl.textContent = formatMoney(data.amount, data.from);
    feeAmountEl.textContent = formatMoney(data.fee, data.from);
    netAmountEl.textContent = formatMoney(data.netAmount, data.from);
    convertedValueEl.textContent = formatMoney(data.converted, data.to);
    exchangeRateEl.textContent = `Exchange rate: 1 ${data.from} = ${data.rate.toFixed(4)} ${data.to}`;
    lastUpdatedEl.textContent = `Last updated: ${data.updatedAt}`;
    sourceIndicatorEl.textContent = data.source === 'live'
      ? 'Live API rate in use.'
      : data.source === 'cache'
        ? 'Using cached rates (fresh local data).'
        : 'Using stale cached rates due to API/network issue.';
  }

  function handleError(message) {
    UIService.clearBox(converterSuccess);
    UIService.setBoxState(converterError, 'error', message);
  }

  function validateInputs(amount) {
    inlineValidation.textContent = '';
    const required = ValidationService.validateRequiredNumber(amountInput.value, 'Amount');
    if (required) {
      inlineValidation.textContent = required;
      return required;
    }
    const rangeErr = ValidationService.validateAmountRange(amount, MIN_TRANSACTION, MAX_TRANSACTION);
    if (rangeErr) {
      inlineValidation.textContent = `${rangeErr} Allowed range: ${MIN_TRANSACTION} to ${MAX_TRANSACTION}.`;
      return rangeErr;
    }
    return '';
  }

  async function convertCurrency(forceRefresh) {
    UIService.clearBox(converterError);
    const amount = Number(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    const validationError = validateInputs(amount);
    if (validationError) return;

    convertBtn.disabled = true;
    convertBtn.textContent = 'Converting...';

    try {
      const ratePayload = await ConverterApiService.fetchRates(from, forceRefresh);
      const rate = Number(ratePayload.rates[to]);
      if (!Number.isFinite(rate) || rate <= 0) {
        throw new Error('Selected currency pair is unavailable at the moment.');
      }

      const fee = calculateFee(amount, from);
      const netAmount = Math.max(amount - fee, 0);
      const converted = netAmount * rate;

      updateUI({ amount, fee, netAmount, converted, rate, from, to, source: ratePayload.source, updatedAt: ratePayload.updatedAt });
      StorageService.addConversion({ amount, fee, netAmount, converted, rate, from, to, source: ratePayload.source, updatedAt: new Date().toISOString() });
      UIService.setBoxState(converterSuccess, 'success', 'Conversion completed successfully.');
    } catch (error) {
      handleError(error.message || 'Conversion failed.');
    } finally {
      convertBtn.disabled = false;
      convertBtn.textContent = 'Convert';
    }
  }

  function saveQuote() {
    UIService.clearBox(converterError);
    const name = quoteName.value.trim();
    const email = quoteEmail.value.trim();

    if (!name || !email) {
      handleError('Please enter both name and email before saving a quote.');
      return;
    }

    StorageService.addQuote({
      name,
      email,
      amount: amountInput.value,
      from: fromSelect.value,
      to: toSelect.value,
      converted: convertedValueEl.textContent,
      createdAt: new Date().toISOString()
    });

    UIService.showToast('Quote saved to demo local storage.');
    UIService.setBoxState(converterSuccess, 'success', 'Quote saved locally (demo mode).');
  }

  function init() {
    populateCurrencies();
    renderFeeRules();
    UIService.attachAuthPlaceholders();

    convertBtn.addEventListener('click', () => convertCurrency(false));
    retryBtn.addEventListener('click', () => convertCurrency(true));
    swapBtn.addEventListener('click', () => {
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      convertCurrency(false);
    });

    [amountInput, fromSelect, toSelect].forEach((el) => el.addEventListener('change', () => convertCurrency(false)));
    saveQuoteBtn.addEventListener('click', saveQuote);
    protectedSaveBtn.addEventListener('click', () => UIService.showToast('Login required in full backend version.'));

    convertCurrency(false);
  }

  init();
})();
