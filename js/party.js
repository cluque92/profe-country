/* ============ Profe Country — Modo fiesta ============
   Encadena bailes al azar sin parar. Ideal para la TV del salón. */
window.PC = window.PC || {};

PC.Party = (function () {
  'use strict';
  const $ = id => document.getElementById(id);

  const Party = {
    active: false,
    queue: [],
    idx: 0
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  Party.start = function () {
    this.active = true;
    this.queue = shuffle(PC.DANCES.map(d => d.id));
    this.idx = 0;
    openCurrent();
  };

  function openCurrent() {
    const id = Party.queue[Party.idx];
    PC.Class.open(id, 'dance');
    const dance = PC.getDance(id);
    const nextId = Party.queue[(Party.idx + 1) % Party.queue.length];
    const next = PC.getDance(nextId);
    const banner = $('party-banner');
    banner.textContent = `🎉 FIESTA · ${Party.idx + 1}/${Party.queue.length} — luego: ${next.emoji} ${next.title}`;
    banner.classList.remove('hidden');
    PC.Class.resume();
    void dance; // (info ya mostrada en la cabecera)
  }

  Party.onFinished = function () {
    if (!this.active) return;
    PC.UI.confetti();
    setTimeout(() => {
      if (!this.active) return;
      this.idx = (this.idx + 1) % this.queue.length;
      if (this.idx === 0) this.queue = shuffle(this.queue);
      openCurrent();
    }, 2200);
  };

  Party.stop = function () {
    this.active = false;
    $('party-banner').classList.add('hidden');
  };

  return Party;
})();
