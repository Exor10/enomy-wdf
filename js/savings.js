(function () {
  const PLANS = {
    basic: {
      label: 'Basic Savings Plan',
      maxYearlyInvestment: 20000,
      minMonthly: 50,
      minLump: 0,
      minReturn: 0.012,
      maxReturn: 0.024,
      monthlyFee: 0.0025,
      tax: (profit) => 0
    },
    plus: {
      label: 'Savings Plan Plus',
      maxYearlyInvestment: 30000,
      minMonthly: 50,
      minLump: 300,
      minReturn: 0.03,
      maxReturn: 0.055,
      monthlyFee: 0.003,
      tax: (profit) => (profit > 12000 ? (profit - 12000) * 0.1 : 0)
    },
    managed: {
      label: 'Managed Stock Investments',
      maxYearlyInvestment: Infinity,
      minMonthly: 150,
      minLump: 1000,
      minReturn: 0.04,
      maxReturn: 0.23,
      monthlyFee: 0.013,
      tax: (profit) => {
        if (profit <= 12000) return 0;
        const taxAt10 = Math.max(Math.min(profit, 40000) - 12000, 0) * 0.1;
        const taxAt20 = Math.max(profit - 40000, 0) * 0.2;
        return taxAt10 + taxAt20;
      }
    }
  };

  const initialLumpInput = document.getElementById('initial-lump');
  const monthlyAmountInput = document.getElementById('monthly-amount');
  const investmentTypeInput = document.getElementById('investment-type');
  const calculateBtn = document.getElementById('calculate-savings-btn');
  const savePlanBtn = document.getElementById('save-plan-btn');
  const resultsEl = document.getElementById('projection-results');
  const rulesEl = document.getElementById('type-rules');
  const barsEl = document.getElementById('summary-bars');
  const errorEl = document.getElementById('savings-error');
  const successEl = document.getElementById('savings-success');

  function formatGBP(value) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(value);
  }

  function getPlan() {
    return PLANS[investmentTypeInput.value];
  }

  function renderRules() {
    const plan = getPlan();
    const maxInvestment = Number.isFinite(plan.maxYearlyInvestment) ? formatGBP(plan.maxYearlyInvestment) : 'Unlimited';
    rulesEl.textContent = `${plan.label}: min monthly ${formatGBP(plan.minMonthly)}, min lump ${formatGBP(plan.minLump)}, max yearly ${maxInvestment}, fee ${(plan.monthlyFee * 100).toFixed(2)}% monthly.`;
  }

  function validateInputs(initialLump, monthlyInvestment, plan) {
    const checks = [
      ValidationService.validateRequiredNumber(initialLumpInput.value, 'Initial lump sum'),
      ValidationService.validateRequiredNumber(monthlyAmountInput.value, 'Monthly investment')
    ].filter(Boolean);

    if (checks.length) return checks[0];
    if (initialLump < plan.minLump) return `Initial lump sum must be at least ${formatGBP(plan.minLump)} for ${plan.label}.`;
    if (monthlyInvestment < plan.minMonthly) return `Monthly investment must be at least ${formatGBP(plan.minMonthly)} for ${plan.label}.`;

    const annual = monthlyInvestment * 12;
    if (Number.isFinite(plan.maxYearlyInvestment) && annual > plan.maxYearlyInvestment) {
      return `Yearly contribution (${formatGBP(annual)}) exceeds ${plan.label} limit of ${formatGBP(plan.maxYearlyInvestment)}.`;
    }

    return '';
  }

  function simulatePlan(initialLump, monthlyInvestment, years, annualReturn, monthlyFeeRate) {
    const months = years * 12;
    let balance = initialLump;
    let totalFees = 0;
    let totalContributions = initialLump;

    for (let month = 1; month <= months; month += 1) {
      balance += monthlyInvestment;
      totalContributions += monthlyInvestment;

      const monthlyGrowth = annualReturn / 12;
      balance *= (1 + monthlyGrowth);

      const fee = balance * monthlyFeeRate;
      balance -= fee;
      totalFees += fee;
    }

    const profitBeforeTax = balance - totalContributions;
    return { balance, totalFees, profitBeforeTax, totalContributions };
  }

  function buildProjection(initialLump, monthlyInvestment, plan, years) {
    const minCase = simulatePlan(initialLump, monthlyInvestment, years, plan.minReturn, plan.monthlyFee);
    const maxCase = simulatePlan(initialLump, monthlyInvestment, years, plan.maxReturn, plan.monthlyFee);

    const minTax = plan.tax(Math.max(minCase.profitBeforeTax, 0));
    const maxTax = plan.tax(Math.max(maxCase.profitBeforeTax, 0));

    return {
      years,
      minExpectedReturn: minCase.balance - minTax,
      maxExpectedReturn: maxCase.balance - maxTax,
      totalProfitMin: minCase.profitBeforeTax,
      totalProfitMax: maxCase.profitBeforeTax,
      totalFeesPaidMin: minCase.totalFees,
      totalFeesPaidMax: maxCase.totalFees,
      totalTaxesPaidMin: minTax,
      totalTaxesPaidMax: maxTax
    };
  }

  function renderResults(projections) {
    if (!projections.length) {
      resultsEl.innerHTML = '<div class="empty-state">No results yet. Enter values and run projection.</div>';
      return;
    }

    resultsEl.innerHTML = projections.map((p) => `
      <article class="activity-item">
        <h3 class="font-semibold text-lg">${p.years} Year Projection</h3>
        <div class="grid md:grid-cols-2 gap-3 mt-3 text-sm">
          <p><strong>Minimum expected return:</strong> ${formatGBP(p.minExpectedReturn)}</p>
          <p><strong>Maximum expected return:</strong> ${formatGBP(p.maxExpectedReturn)}</p>
          <p><strong>Total profit (min-max):</strong> ${formatGBP(p.totalProfitMin)} to ${formatGBP(p.totalProfitMax)}</p>
          <p><strong>Total fees paid (min-max):</strong> ${formatGBP(p.totalFeesPaidMin)} to ${formatGBP(p.totalFeesPaidMax)}</p>
          <p><strong>Total taxes paid (min-max):</strong> ${formatGBP(p.totalTaxesPaidMin)} to ${formatGBP(p.totalTaxesPaidMax)}</p>
        </div>
      </article>
    `).join('');
  }

  function renderBars(projections) {
    const maxReturn = Math.max(...projections.map((p) => p.maxExpectedReturn), 1);
    barsEl.innerHTML = projections.map((p) => {
      const width = Math.round((p.maxExpectedReturn / maxReturn) * 100);
      return `
        <div>
          <p class="text-sm mb-1">${p.years} year max projection: ${formatGBP(p.maxExpectedReturn)}</p>
          <div class="progress-wrap"><div class="progress-fill" style="width:${width}%">${width}%</div></div>
        </div>`;
    }).join('');
  }

  function calculateSavings() {
    UIService.clearBox(errorEl);
    UIService.clearBox(successEl);

    const initialLump = Number(initialLumpInput.value);
    const monthlyInvestment = Number(monthlyAmountInput.value);
    const plan = getPlan();

    const validationError = validateInputs(initialLump, monthlyInvestment, plan);
    if (validationError) {
      UIService.setBoxState(errorEl, 'error', validationError);
      return null;
    }

    const projections = [1, 5, 10].map((years) => buildProjection(initialLump, monthlyInvestment, plan, years));
    renderResults(projections);
    renderBars(projections);
    UIService.setBoxState(successEl, 'success', 'Projections calculated successfully.');

    const payload = { planType: investmentTypeInput.value, initialLump, monthlyInvestment, projections, createdAt: new Date().toISOString() };
    StorageService.addSavings(payload);
    return payload;
  }

  function savePlan() {
    const payload = calculateSavings();
    if (!payload) return;
    UIService.showToast('Projection saved to demo local storage.');
  }

  function init() {
    UIService.attachAuthPlaceholders();
    renderRules();
    resultsEl.innerHTML = '<div class="empty-state">No results yet. Enter values and run projection.</div>';
    investmentTypeInput.addEventListener('change', renderRules);
    calculateBtn.addEventListener('click', calculateSavings);
    savePlanBtn.addEventListener('click', savePlan);
  }

  init();
})();
