(function () {
  function animateStats() {
    const stats = document.querySelectorAll('.stat-value');
    stats.forEach((item) => {
      const target = Number(item.dataset.target || 0);
      const start = performance.now();
      const duration = 900;
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        item.textContent = String(Math.floor(target * p));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  UIService.attachAuthPlaceholders();
  animateStats();
})();
