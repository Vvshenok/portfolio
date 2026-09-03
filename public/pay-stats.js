(function () {
  fetch('/api/payments/stats')
    .then(response => response.json())
    .then(data => {
      const count = Number(data.completedPayments) || 0;
      if (!count) return;
      const trust = document.querySelector('.pay-trust');
      if (!trust) return;
      const vouch = document.createElement('div');
      vouch.textContent = `${count} client${count === 1 ? '' : 's'} paid through vvshenok.dev`;
      vouch.style.cssText = 'display:block;margin-top:1.25rem;color:var(--accent);font:.7rem var(--mono);letter-spacing:.04em';
      trust.after(vouch);
    })
    .catch(() => {});
})();
