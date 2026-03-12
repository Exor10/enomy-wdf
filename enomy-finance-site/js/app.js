(() => {
  const statElements = document.querySelectorAll('.stat-number');

  const animateValue = (el) => {
    const target = Number(el.dataset.target || 0);
    const duration = 1200;
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  if (statElements.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });

    statElements.forEach((el) => observer.observe(el));
  }

  const chartCanvas = document.getElementById('homeTrendChart');
  if (chartCanvas && window.Chart) {
    new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Market Confidence Index',
          data: [62, 68, 66, 74, 80, 83, 88],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            ticks: { color: '#64748b' },
            grid: { color: '#e2e8f0' }
          },
          x: {
            ticks: { color: '#64748b' },
            grid: { display: false }
          }
        }
      }
    });
  }
})();
