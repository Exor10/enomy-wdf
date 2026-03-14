(function () {
  function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
  }

  function validateRequiredNumber(value, label) {
    if (value === '' || value === null || value === undefined) {
      return `${label} is required.`;
    }
    if (!isFiniteNumber(value)) {
      return `${label} must be a valid number.`;
    }
    if (Number(value) < 0) {
      return `${label} cannot be negative.`;
    }
    return '';
  }

  function validateAmountRange(amount, min, max) {
    if (amount < min) return `Minimum transaction is ${min.toFixed(2)}.`;
    if (amount > max) return `Maximum transaction is ${max.toFixed(2)}.`;
    return '';
  }

  window.ValidationService = { validateRequiredNumber, validateAmountRange };
})();
