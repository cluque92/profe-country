/* ============ Profe Country — Modo aprender ============
   Desglose sección a sección: practicar en bucle a 0.75×,
   marcar secciones aprendidas y ver los consejos de cada paso. */
window.PC = window.PC || {};

PC.Learn = (function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let current = 0;

  function state() { return PC.Class.state; }

  function renderPanel() {
    const S = state();
    if (!S.dance) return;
    const rec = PC.Progress.dance(S.dance.id);
    const firstUnlearned = S.dance.sections.findIndex((_, i) => !rec.learned[i]);
    current = firstUnlearned === -1 ? 0 : firstUnlearned;

    $('panel-learn').innerHTML = `
      <div class="learn-current">
        <h4 id="learn-sec-title"></h4>
        <div id="learn-sec-tips"></div>
      </div>
      <div class="learn-actions">
        <button id="btn-sec-prev" class="btn btn-wood" aria-label="Practicar la sección anterior">⏪ Anterior</button>
        <button id="btn-sec-practice" class="btn btn-gold">▶ Practicar</button>
        <button id="btn-sec-done" class="btn btn-wood">✓ Aprendida</button>
        <button id="btn-sec-next" class="btn btn-wood" aria-label="Marcar y pasar a la siguiente sección">Siguiente ⏩</button>
      </div>
      <p class="ficha-note">Se practica en bucle a 0.75×. Marca cada sección cuando la lleves clara y… ¡a bailar la canción entera!</p>
      <div id="learn-dots" class="learn-sections" role="group" aria-label="Ir a una sección"></div>
    `;

    $('btn-sec-prev').addEventListener('click', () => jump(-1));
    $('btn-sec-practice').addEventListener('click', () => PC.Class.practiceSection(current));
    $('btn-sec-done').addEventListener('click', () => markDone());
    $('btn-sec-next').addEventListener('click', () => { markDone(true); });

    refresh();
  }

  function refresh() {
    const S = state();
    if (!S.dance) return;
    const rec = PC.Progress.dance(S.dance.id);
    const sec = S.dance.sections[current];
    const secStart = S.sectionStarts[current];

    $('learn-sec-title').textContent = `Sección ${current + 1} de ${S.dance.sections.length} · ${sec.name}`;
    $('learn-sec-tips').innerHTML = sec.moves.map(mid => {
      const m = PC.Moves.get(mid);
      return `<div class="ficha-step"><span class="n">•</span><span><strong>${m.name}</strong><span class="tip"> — ${m.tip}</span></span></div>`;
    }).join('');

    const dots = S.dance.sections.map((_, i) => {
      const cls = ['sec-dot', i === current ? 'current' : '', rec.learned[i] ? 'done' : ''].join(' ');
      return `<button class="${cls}" data-sec="${i}" aria-label="Practicar sección ${i + 1}${rec.learned[i] ? ', aprendida' : ''}">${i + 1}</button>`;
    }).join('');
    const dotsHost = $('learn-dots');
    dotsHost.innerHTML = dots;
    dotsHost.querySelectorAll('.sec-dot').forEach(b =>
      b.addEventListener('click', () => { current = parseInt(b.dataset.sec, 10); refresh(); PC.Class.practiceSection(current); })
    );
  }

  function jump(delta) {
    const S = state();
    current = Math.max(0, Math.min(S.dance.sections.length - 1, current + delta));
    refresh();
    PC.Class.practiceSection(current);
  }

  function markDone(advance) {
    const S = state();
    const all = PC.Progress.markSectionLearned(S.dance.id, current, S.dance.sections.length);
    if (all) {
      PC.UI.confetti();
      PC.UI.toast(`¡${S.dance.title} aprendido! Baile dominado 🤠`);
      if (PC.Main) PC.Main.renderHome();
    } else {
      PC.UI.toast('Sección marcada como aprendida ✓');
    }
    if (advance) jump(1);
    else refresh();
  }

  return { renderPanel, refresh };
})();
