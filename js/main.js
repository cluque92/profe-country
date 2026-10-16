/* ============ Profe Country — Inicio, ajustes y atajos ============ */
window.PC = window.PC || {};

PC.Main = (function () {
  'use strict';
  const $ = id => document.getElementById(id);

  const HAT_COLORS = ['#8a5a2b', '#2b2b2b', '#f5f0e6', '#b03a2e', '#3f5d8a', '#d17ba5'];
  const SHIRT_COLORS = ['#b03a2e', '#3f5d8a', '#3f7d4e', '#d4a017', '#7b4fa0', '#333333'];
  const CONFETTI = ['🎉', '🤠', '🐎', '🌵', '⭐', '🏆', '💃'];

  /* ---------- helpers UI ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('span');
      s.className = 'confetti';
      s.textContent = CONFETTI[Math.floor(Math.random() * CONFETTI.length)];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.animationDuration = (2.2 + Math.random() * 2) + 's';
      s.style.animationDelay = (Math.random() * 0.5) + 's';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 5200);
    }
  }

  function openModal(id) {
    const m = $(id);
    m.classList.remove('hidden');
    const firstBtn = m.querySelector('button');
    if (firstBtn) firstBtn.focus();
  }
  function closeModal(id) { $(id).classList.add('hidden'); }

  PC.UI = { toast, confetti, showModal: openModal, closeModal };

  /* ---------- home ---------- */
  function renderHome() {
    const grid = $('contenido');
    grid.innerHTML = '';
    PC.DANCES.forEach(d => {
      const learned = PC.Progress.isDanceLearned(d.id);
      const played = PC.Progress.dance(d.id).played;
      const card = document.createElement('article');
      card.className = 'dance-card' + (learned ? ' learned' : '');
      card.innerHTML = `
        ${learned ? '<span class="learned-flag">✓ Aprendido</span>' : ''}
        <div class="emoji" aria-hidden="true">${d.emoji}</div>
        <h3>${d.title}</h3>
        <p class="song">${d.artist} · «${d.song}»${played ? ` · ${played} ${played === 1 ? 'baile' : 'bailes'}` : ''}</p>
        <div class="meta-row">
          <span class="pill ${d.levelClass}">${d.level}</span>
          <span class="pill">${d.bpm} BPM</span>
          <span class="pill">${d.walls > 1 ? d.walls + ' muros' : 'Con letra'}</span>
          <span class="pill" aria-label="Dificultad: ${d.stars} de 4">${'★'.repeat(d.stars)}${'☆'.repeat(4 - d.stars)}</span>
        </div>
        <p>${d.desc}</p>
        <div class="card-actions">
          <button class="btn btn-gold" data-dance="${d.id}">💃 Bailar</button>
          <button class="btn btn-wood" data-learn="${d.id}">🎓 Aprender</button>
        </div>
      `;
      grid.appendChild(card);
    });
    grid.querySelectorAll('[data-dance]').forEach(b =>
      b.addEventListener('click', () => { PC.Party.stop(); PC.Class.open(b.dataset.dance, 'dance'); }));
    grid.querySelectorAll('[data-learn]').forEach(b =>
      b.addEventListener('click', () => { PC.Party.stop(); PC.Class.open(b.dataset.learn, 'learn'); }));

    const st = PC.Progress.stats();
    $('progress-strip').innerHTML =
      `💃 <strong>${st.playedDances}/${st.total}</strong> bailes bailados · 🎓 <strong>${st.learnedDances}/${st.total}</strong> aprendidos · ` +
      `▶️ <strong>${st.totalPlays}</strong> sesiones · 🔥 racha de <strong>${st.streak} ${st.streak === 1 ? 'día' : 'días'}</strong>`;
  }

  /* ---------- ajustes ---------- */
  function buildSwatches(hostId, colors, current, key) {
    const host = $(hostId);
    host.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'sw-label';
    label.textContent = hostId === 'swatch-hat' ? 'Sombrero:' : 'Camisa:';
    host.appendChild(label);
    colors.forEach(c => {
      const b = document.createElement('button');
      b.className = 'swatch';
      b.style.background = c;
      b.setAttribute('aria-label', `Color ${c}`);
      b.setAttribute('aria-pressed', String(c === current));
      b.addEventListener('click', () => {
        PC.Progress.setSetting(key, c);
        host.querySelectorAll('.swatch').forEach(s => s.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
      });
      host.appendChild(b);
    });
  }

  function refreshSettings() {
    const st = PC.Progress.settings();
    $('pick-vaquero').setAttribute('aria-pressed', String(st.avatar === 'vaquero'));
    $('pick-vaquera').setAttribute('aria-pressed', String(st.avatar === 'vaquera'));
    $('chk-mirror-default').checked = st.mirrorDefault;
    buildSwatches('swatch-hat', HAT_COLORS, st.hat, 'hat');
    buildSwatches('swatch-shirt', SHIRT_COLORS, st.shirt, 'shirt');
  }

  function bindSettings() {
    $('btn-settings').addEventListener('click', () => { refreshSettings(); openModal('modal-settings'); });
    $('btn-close-settings').addEventListener('click', () => { closeModal('modal-settings'); renderHome(); });
    $('pick-vaquero').addEventListener('click', () => { PC.Progress.setSetting('avatar', 'vaquero'); refreshSettings(); });
    $('pick-vaquera').addEventListener('click', () => { PC.Progress.setSetting('avatar', 'vaquera'); refreshSettings(); });
    $('chk-mirror-default').addEventListener('change', e => PC.Progress.setSetting('mirrorDefault', e.target.checked));

    $('btn-reset-progress').addEventListener('click', () => openModal('modal-confirm'));
    $('btn-confirm-cancel').addEventListener('click', () => closeModal('modal-confirm'));
    $('btn-confirm-ok').addEventListener('click', () => {
      PC.Progress.reset();
      closeModal('modal-confirm');
      closeModal('modal-settings');
      renderHome();
      toast('Progreso borrado. ¡A empezar de nuevo, novato! 🌵');
    });

    $('btn-close-diploma').addEventListener('click', () => closeModal('modal-diploma'));

    $('btn-party').addEventListener('click', () => PC.Party.start());

    // Cerrar modales con clic en el fondo
    ['modal-settings', 'modal-diploma', 'modal-confirm'].forEach(id => {
      $(id).addEventListener('click', e => { if (e.target === $(id)) closeModal(id); });
    });
  }

  /* ---------- atajos de teclado ---------- */
  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

      const anyModal = ['modal-settings', 'modal-diploma', 'modal-confirm'].some(id => !$(id).classList.contains('hidden'));
      if (e.key === 'Escape') {
        if (anyModal) {
          ['modal-settings', 'modal-diploma', 'modal-confirm'].forEach(id => closeModal(id));
          return;
        }
        if (PC.Class.isClassOpen) { PC.Class.close(); return; }
      }
      if (anyModal) return;
      if (!PC.Class.isClassOpen) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          PC.Class.play();
          break;
        case 'm': case 'M': {
          const chk = $('chk-mirror');
          chk.checked = !chk.checked;
          chk.dispatchEvent(new Event('change'));
          toast(chk.checked ? 'Modo espejo activado 🪞' : 'Modo espejo desactivado');
          break;
        }
        case 'f': case 'F':
          PC.Class.toggleFullscreen ? PC.Class.toggleFullscreen() : $('btn-fullscreen').click();
          break;
        case 'ArrowRight': case 'ArrowLeft': {
          e.preventDefault();
          const S = PC.Class.state;
          if (!S.dance) return;
          const si = sectionIndexOf(S);
          const target = e.key === 'ArrowRight' ? si + 1 : si - 1;
          if (target >= 0 && target < S.sectionStarts.length) {
            PC.Class.seekToBeat(S.sectionStarts[target]);
            if (PC.Learn && !$('panel-learn').classList.contains('hidden')) { PC.Learn.renderPanel(); }
          }
          break;
        }
      }
    });
  }

  function sectionIndexOf(S) {
    let si = 0;
    for (let i = 0; i < S.sectionStarts.length; i++) {
      if (S.beatPos >= S.sectionStarts[i]) si = i;
    }
    return si;
  }

  /* ---------- arranque ---------- */
  function boot() {
    PC.Class.bindControls();
    bindSettings();
    bindKeyboard();
    renderHome();
  }

  return { renderHome, boot, toast };
})();

document.addEventListener('DOMContentLoaded', PC.Main.boot);
