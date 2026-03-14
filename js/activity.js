(function () {
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString('en-GB');
  }

  function renderList(container, items, templateFn, emptyText) {
    if (!items.length) {
      container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
      return;
    }
    container.innerHTML = items.map(templateFn).join('');
  }

  function renderQuotes() {
    const el = document.getElementById('saved-quotes');
    const quotes = StorageService.getQuotes();
    renderList(el, quotes, (q) => `
      <article class="activity-item text-sm">
        <p><strong>${q.name}</strong> (${q.email})</p>
        <p>Pair: ${q.from} → ${q.to}</p>
        <p>Converted: ${q.converted || '-'}</p>
        <p class="text-slate-500">Saved: ${formatDate(q.createdAt)}</p>
      </article>
    `, 'No saved quotes yet. Save one from the converter page.');
  }

  function renderConversions() {
    const el = document.getElementById('recent-conversions');
    const rows = StorageService.getConversions();
    renderList(el, rows, (row) => `
      <article class="activity-item text-sm">
        <p><strong>${row.from} ${Number(row.amount).toFixed(2)}</strong> to ${row.to}</p>
        <p>Fee: ${Number(row.fee).toFixed(2)} ${row.from} | Net: ${Number(row.netAmount).toFixed(2)} ${row.from}</p>
        <p>Result: ${Number(row.converted).toFixed(2)} ${row.to} (${row.source})</p>
        <p class="text-slate-500">${formatDate(row.updatedAt)}</p>
      </article>
    `, 'No recent conversions yet.');
  }

  function renderSavings() {
    const el = document.getElementById('recent-savings');
    const rows = StorageService.getSavings();
    renderList(el, rows, (row) => {
      const topProjection = row.projections && row.projections[0] ? row.projections[0] : null;
      return `
        <article class="activity-item text-sm">
          <p><strong>Plan:</strong> ${row.planType}</p>
          <p>Initial: £${Number(row.initialLump).toFixed(2)} | Monthly: £${Number(row.monthlyInvestment).toFixed(2)}</p>
          <p>${topProjection ? `1Y min-max: £${Number(topProjection.minExpectedReturn).toFixed(2)} - £${Number(topProjection.maxExpectedReturn).toFixed(2)}` : 'Projection data unavailable'}</p>
          <p class="text-slate-500">${formatDate(row.createdAt)}</p>
        </article>
      `;
    }, 'No savings projections saved yet.');
  }

  UIService.attachAuthPlaceholders();
  renderQuotes();
  renderConversions();
  renderSavings();
})();
