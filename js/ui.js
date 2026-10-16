/* ============ Profe Country — Motor de la clase ============
   Un solo reloj: la pose del profe se calcula SIEMPRE a partir del
   tiempo real de la música (source.time), así no se desincroniza. */
window.PC = window.PC || {};

PC.Class = (function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const S = {
    dance: null, mode: 'dance', flat: [], totalBeats: 0, sectionStarts: [],
    playing: false, sourceKind: 'yt', source: null,
    rate: 1, mirror: true, loop: false, offset: 0,
    beatPos: -4, lastIdx: -1, lastCount: -1, lastLabel: '',
    baseX: 0, baseTurn: 0, seekPending: false,
    started: false, finishedFlag: false, raf: null
  };

  let dancer = null;
  let ytHooked = false;

  /* ---------- helpers UI ---------- */
  function toast(msg) { if (PC.UI) PC.UI.toast(msg); }
  function confetti() { if (PC.UI) PC.UI.confetti(); }

  function spb() { return 60 / (S.dance.bpm * S.rate); }
  function beatsToSong(b) { return S.offset + b * spb(); }

  /* ---------- apertura ---------- */
  function open(danceId, mode) {
    S.dance = PC.getDance(danceId);
    if (!S.dance) return;
    S.mode = mode || 'dance';
    const st = PC.Progress.settings();
    const rec = PC.Progress.dance(S.dance.id);

    S.offset = rec.offset || 0;
    S.rate = S.mode === 'learn' ? 0.75 : (parseFloat(st.rate) || 0.75);
    S.mirror = st.mirrorDefault;
    S.loop = false;
    S.playing = false;
    S.started = false;
    S.finishedFlag = false;
    S.beatPos = -4;
    S.lastIdx = -1; S.lastCount = -1; S.lastLabel = '';
    S.baseX = 0; S.baseTurn = 0; S.seekPending = false;

    const f = PC.flatten(S.dance);
    S.flat = f.flat; S.totalBeats = f.totalBeats;
    S.sectionStarts = [];
    let b = 0;
    S.dance.sections.forEach(sec => {
      S.sectionStarts.push(b);
      sec.moves.forEach(mid => { b += PC.Moves.get(mid).beats; });
    });

    // Cabecera
    $('class-title').textContent = `${S.dance.emoji} ${S.dance.title}`;
    $('class-level').textContent = S.dance.level;
    $('class-level').className = 'pill ' + S.dance.levelClass;
    $('class-bpm').textContent = `${S.dance.bpm} BPM`;
    $('class-walls').textContent = S.dance.walls > 1 ? `${S.dance.walls} muros` : 'Letra guía';

    // Controles
    $('sel-rate').value = String(S.rate);
    $('chk-mirror').checked = S.mirror;
    $('chk-loop').checked = false;
    $('offset-value').textContent = S.offset.toFixed(1) + 's';
    $('btn-play').textContent = '▶ Bailar';
    $('music-badge').classList.add('hidden');
    $('music-badge').textContent = '';
    $('party-banner').classList.add('hidden');

    // Profe
    if (!dancer) dancer = new PC.Dancer($('dancer-host'), st);
    dancer.setSettings({ avatar: st.avatar, hat: st.hat, shirt: st.shirt, mirror: S.mirror });
    renderIdle();

    // Paneles laterales
    buildFicha();
    if (PC.Learn) PC.Learn.renderPanel();
    switchTab('ficha');

    // Música
    prepareSource();

    // Pantalla
    $('screen-home').classList.add('hidden');
    $('screen-class').classList.remove('hidden');
    PC.Progress.addToday();

    if (!S.raf) loop();
    if (S.mode === 'learn') switchTab('learn');
  }

  function close() {
    pauseSource();
    S.playing = false;
    $('screen-class').classList.add('hidden');
    $('screen-home').classList.remove('hidden');
    if (PC.Party && PC.Party.active) PC.Party.stop();
    if (PC.Main) PC.Main.renderHome();
  }

  function buildFicha() {
    const host = $('panel-ficha');
    const parts = [];
    if (S.dance.note) parts.push(`<p class="ficha-note">${S.dance.note}</p>`);
    S.dance.sections.forEach((sec, si) => {
      const secStart = S.sectionStarts[si];
      const secEnd = si + 1 < S.sectionStarts.length ? S.sectionStarts[si + 1] : S.totalBeats;
      let html = `<div class="ficha-section"><h4>Sección ${si + 1} · ${sec.name}</h4>`;
      let beat = secStart;
      while (beat < secEnd) {
        const item = S.flat.find(x => x.startBeat === beat);
        if (!item) break;
        const m = PC.Moves.get(item.moveId);
        const local = beat - secStart + 1;
        const label = m.beats > 1 ? `${local}-${local + m.beats - 1}` : String(local);
        html += `<div class="ficha-step"><span class="n">${label}</span><span><strong>${m.name}</strong>`;
        if (m.tip) html += `<span class="tip"> — ${m.tip}</span>`;
        html += '</span></div>';
        beat += m.beats;
      }
      parts.push(html + '</div>');
    });
    host.innerHTML = parts.join('');
  }

  function switchTab(name) {
    $('tab-ficha').classList.toggle('active', name === 'ficha');
    $('tab-learn').classList.toggle('active', name === 'learn');
    $('tab-ficha').setAttribute('aria-selected', name === 'ficha');
    $('tab-learn').setAttribute('aria-selected', name === 'learn');
    $('panel-ficha').classList.toggle('hidden', name !== 'ficha');
    $('panel-learn').classList.toggle('hidden', name !== 'learn');
  }

  /* ---------- música ---------- */
  function prepareSource() {
    if (S.mode === 'learn') { useSynth('metro'); return; }
    if (location.protocol === 'file:') {
      // YouTube bloquea los embebidos en file://: avisar con instrucciones claras
      useSynth('band');
      setBadge('🎧 Ritmo de respaldo — con doble clic no hay audio real: sirve la web con «npx serve» y abre su dirección http://localhost', false);
      toast('YouTube no permite audio abriendo el archivo con doble clic. Ejecuta «npx serve» en la carpeta y abre la dirección local para oír las canciones.');
      return;
    }
    const yt = PC.Music.yt('yt-player');
    if (!ytHooked) {
      ytHooked = true;
      yt.onState(ev => {
        if (!S.source || S.sourceKind !== 'yt') return;
        if (ev === 'ended') finished();
        if (ev === 'error' || (ev === 'playing' && yt.failed)) fallbackToSynth();
      });
    }
    S.sourceKind = 'yt';
    S.source = yt;
    yt.load(S.dance.yt);
    if (yt.failed) fallbackToSynth();
  }

  function useSynth(mode, withRetry) {
    const s = PC.Music.synth();
    s.mode = mode;
    s.bpm = S.dance.bpm;
    s.onState(ev => {
      if (S.source !== s) return;
      if (ev === 'ended') finished();
    });
    const loops = 3;
    s.duration = S.offset + S.totalBeats * (60 / S.dance.bpm) * loops;
    S.sourceKind = 'synth';
    S.source = s;
    setBadge(mode === 'metro'
      ? '🎧 Solo metrónomo (modo aprender)'
      : '🎧 Ritmo de respaldo — YouTube no disponible', withRetry);
  }

  function setBadge(text, withRetry) {
    const badge = $('music-badge');
    badge.textContent = text;
    if (withRetry) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-wood';
      btn.textContent = '🔁 Reintentar YouTube';
      btn.setAttribute('aria-label', 'Reintentar la reproducción de la canción con YouTube');
      btn.addEventListener('click', retryYT);
      badge.appendChild(btn);
    }
    badge.classList.remove('hidden');
  }

  function retryYT() {
    if (location.protocol === 'file:') {
      toast('Con doble clic (file://) YouTube no da audio. Sirve la web con «npx serve» y abre la dirección http://localhost que te muestre.');
      return;
    }
    const wasPlaying = S.playing;
    S.playing = false;
    pauseSource();
    S.sourceKind = 'yt';
    const yt = PC.Music.yt('yt-player');
    yt.reset();
    S.source = yt;
    $('music-badge').classList.add('hidden');
    $('music-badge').textContent = '';
    yt.load(S.dance.yt);
    if (yt.failed) { fallbackToSynth(); return; }
    if (wasPlaying) startPlayback();
    toast('Reintentando con YouTube…');
  }

  function fallbackToSynth() {
    const wasPlaying = S.playing;
    S.playing = false;
    pauseSource();
    useSynth('band', true);
    toast('No se pudo cargar el vídeo de YouTube: uso un ritmo de respaldo.');
    if (wasPlaying) startPlayback();
  }

  function pauseSource() { if (S.source) S.source.pause(); }

  /* ---------- reproducción ---------- */
  function startPlayback() {
    S.started = true;
    S.finishedFlag = false;
    const from = S.beatPos < 0
      ? Math.max(0, S.offset - 4 * spb())
      : beatsToSong(S.beatPos);
    S.source.play(from);
    S.playing = true;
    $('btn-play').textContent = '⏸ Pausa';
  }

  function pausePlayback() {
    pauseSource();
    S.playing = false;
    $('btn-play').textContent = '▶ Seguir';
  }

  function play() {
    if (S.playing) pausePlayback();
    else startPlayback();
  }

  function restart() {
    S.beatPos = -4;
    S.lastIdx = -1; S.lastCount = -1; S.lastLabel = '';
    S.baseX = 0; S.baseTurn = 0; S.seekPending = false;
    S.finishedFlag = false;
    startPlayback();
  }

  function finished() {
    if (S.finishedFlag) return;
    S.finishedFlag = true;
    S.playing = false;
    $('btn-play').textContent = '▶ Otra vez';
    renderIdle();
    const showDiploma = PC.Progress.markPlayed(S.dance.id);
    if (PC.Party && PC.Party.active) { PC.Party.onFinished(); return; }
    confetti();
    toast('¡Baile completado! 🎉');
    if (showDiploma) {
      PC.Progress.showDiploma();
      PC.UI.showModal('modal-diploma');
    }
  }

  function seekToBeat(b) {
    S.beatPos = b;
    resetAccum(b);
    startPlayback();
  }

  function resetAccum(b) {
    S.baseX = 0; S.baseTurn = 0;
    S.lastIdx = Math.max(0, Math.floor(b));
    for (const m of S.flat) {
      if (m.startBeat + m.beats <= b + 1e-6) {
        const mv = PC.Moves.get(m.moveId);
        S.baseX += mv.endX;
        S.baseTurn += mv.endTurn;
      }
    }
    S.seekPending = false;
  }

  function practiceSection(i) {
    S.loop = true;
    $('chk-loop').checked = true;
    setRate(0.75);
    switchTab('learn');
    seekToBeat(S.sectionStarts[i], true);
  }

  function setRate(r) {
    S.rate = r;
    $('sel-rate').value = String(r);
    if (S.source) S.source.setRate(r);
  }

  /* ---------- reloj principal ---------- */
  function loop() {
    S.raf = requestAnimationFrame(loop);
    if (!S.dance || !dancer) return;

    if (!S.playing) {
      // En pausa el profe respira y se balancea suave
      dancer.render(grooveIdle(), { playing: false, time: performance.now() / 1000 });
      return;
    }

    const bpm = S.dance.bpm;
    let bp = (S.source.time - S.offset) * bpm / 60;

    // Bucle de sección
    if (S.loop && bp >= 0) {
      const si = sectionAt(bp);
      const secEnd = si + 1 < S.sectionStarts.length ? S.sectionStarts[si + 1] : S.totalBeats;
      if (bp >= secEnd && !S.seekPending) {
        S.seekPending = true;
        S.source.seek(beatsToSong(S.sectionStarts[si]));
      }
      if (bp < secEnd) S.seekPending = false;
    }

    // Fin de la canción (solo con sintetizador; YT emite 'ended')
    if (S.sourceKind === 'synth' && bp >= S.totalBeats + 8) { finished(); return; }

    if (bp < 0) {
      // Cuenta atrás 5-6-7-8
      S.beatPos = bp;
      drawCountdown(bp);
      if (dancer) dancer.render(groove(bp, {}), { playing: true });
      return;
    }
    $('countdown-overlay').classList.remove('show');

    const idx = Math.min(S.flat.length - 1, Math.floor(bp));
    const frac = bp - idx;
    if (idx !== S.lastIdx) onMoveChange(idx);

    // Contador 1-8: se actualiza en CADA tiempo
    const beatIdx = Math.floor(bp);
    if (beatIdx !== S.lastCount) {
      S.lastCount = beatIdx;
      updateCount(beatIdx);
    }

    const mv = PC.Moves.get(S.flat[idx].moveId);
    const pose = PC.Moves.sample(mv.frames, frac);
    const full = Object.assign({}, pose);
    full.x = clampX(S.baseX + (pose.x || 0));
    // El profe siempre acaba mirándote (como una clase en espejo): los giros
    // se muestran como un twirl sobre sí mismo y el MURO lo giras tú.
    full.turn = Math.sin(Math.PI * frac) * mv.endTurn;
    dancer.render(groove(bp, full), { playing: true });
    S.beatPos = bp;
  }

  function grooveIdle() {
    return { turn: 0, x: 0 };
  }

  function updateCount(beatIdx) {
    const n = ((beatIdx % 8) + 8) % 8 + 1;
    const co = $('count-overlay');
    co.textContent = n;
    if (!REDUCED) {
      co.classList.remove('beat');
      void co.offsetWidth; // reinicia la animación del pulso
      co.classList.add('beat');
    }
  }

  function clampX(x) { return Math.max(-150, Math.min(150, x)); }

  function sectionAt(bp) {
    let si = 0;
    for (let i = 0; i < S.sectionStarts.length; i++) {
      if (bp >= S.sectionStarts[i]) si = i;
    }
    return si;
  }

  function groove(bp, pose) {
    if (REDUCED) return pose;
    const f = bp - Math.floor(bp);
    const dip = -6 * Math.exp(-6 * f);
    pose.bodyY = (pose.bodyY || 0) + dip;
    pose.headRot = (pose.headRot || 0) + 2.5 * Math.exp(-6 * f) - 1;
    const sway = 2.2 * Math.sin(2 * Math.PI * bp / 2);
    pose.shL = (pose.shL || 0) + sway;
    pose.shR = (pose.shR || 0) - sway;
    return pose;
  }

  function drawCountdown(bp) {
    const ov = $('countdown-overlay');
    if (bp < -4) { ov.classList.remove('show'); return; }
    const label = String(Math.min(8, Math.max(5, Math.floor(bp) + 9)));
    if (label !== S.lastLabel) {
      S.lastLabel = label;
      ov.innerHTML = `<span>${label}</span>`;
      ov.classList.add('show');
    }
  }

  function onMoveChange(idx) {
    // Acumular desplazamientos/giros de los movimientos que quedan atrás
    if (S.lastIdx >= 0) {
      for (let i = S.lastIdx; i < idx; i++) {
        const mv = PC.Moves.get(S.flat[i].moveId);
        S.baseX = clampX(S.baseX + mv.endX);
        S.baseTurn += mv.endTurn;
      }
    }
    S.lastIdx = idx;

    const m = PC.Moves.get(S.flat[idx].moveId);
    const next = S.flat[idx + 1] ? PC.Moves.get(S.flat[idx + 1].moveId) : null;

    // Nombres
    const si = S.flat[idx].section;
    $('section-name').textContent = `Sección ${si + 1}/${S.dance.sections.length} · ${S.dance.sections[si].name}`;
    $('move-name').textContent = m.name;
    $('move-next').textContent = next ? `Luego → ${next.name}` : 'Luego → ¡fin de la vuelta!';

    // Flechas
    const fa = $('floor-arrows');
    let dir = m.dir;
    if (S.mirror) {
      if (dir === 'R') dir = 'L';
      else if (dir === 'L') dir = 'R';
    }
    const glyphs = { R: '❯❯❯', L: '❮❮❮', F: '▲▲▲', B: '▼▼▼' };
    if (glyphs[dir]) {
      fa.innerHTML = `<span>${glyphs[dir][0]}</span><span>${glyphs[dir][1]}</span><span>${glyphs[dir][2]}</span>`;
      fa.classList.add('show');
    } else {
      fa.classList.remove('show');
    }

    // Muro
    const wall = (((Math.round(S.baseTurn / 90) % 4) + 4) % 4) + 1;
    const wb = $('wall-badge');
    if (S.dance.walls > 1) {
      wb.textContent = `Muro ${wall}/${S.dance.walls}`;
      wb.classList.remove('hidden');
    } else wb.classList.add('hidden');
  }

  function renderIdle() {
    if (dancer) dancer.render({ turn: 0 }, { playing: false, time: performance.now() / 1000 });
    S._idleDrawn = true;
  }

  /* ---------- controles ---------- */
  function bindControls() {
    $('btn-play').addEventListener('click', play);
    $('btn-restart').addEventListener('click', restart);
    $('btn-back').addEventListener('click', close);
    $('sel-rate').addEventListener('change', e => {
      setRate(parseFloat(e.target.value));
      PC.Progress.setSetting('rate', S.rate);
    });
    $('chk-mirror').addEventListener('change', e => { S.mirror = e.target.checked; dancer.mirror = S.mirror; });
    $('chk-loop').addEventListener('change', e => { S.loop = e.target.checked; });
    $('tab-ficha').addEventListener('click', () => switchTab('ficha'));
    $('tab-learn').addEventListener('click', () => switchTab('learn'));
    $('btn-video').addEventListener('click', toggleVideo);
    $('btn-fullscreen').addEventListener('click', toggleFullscreen);

    $('btn-offset-minus').addEventListener('click', () => nudgeOffset(-0.1));
    $('btn-offset-plus').addEventListener('click', () => nudgeOffset(0.1));
  }

  function nudgeOffset(d) {
    S.offset = Math.max(0, Math.round((S.offset + d) * 10) / 10);
    $('offset-value').textContent = S.offset.toFixed(1) + 's';
    const rec = PC.Progress.dance(S.dance.id);
    rec.offset = S.offset;
    PC.Progress.save && PC.Progress.save();
    toast(S.offset === 0 ? 'Compás al inicio de la canción' : `Compás ajustado a ${S.offset.toFixed(1)}s`);
  }

  function toggleVideo() {
    const host = $('yt-host');
    const showing = !host.classList.contains('offscreen');
    if (showing) {
      host.classList.add('offscreen');
      $('btn-video').setAttribute('aria-pressed', 'false');
    } else {
      host.classList.remove('offscreen');
      $('btn-video').setAttribute('aria-pressed', 'true');
    }
  }

  function toggleFullscreen() {
    const target = $('stage-wrap');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (target.requestFullscreen) target.requestFullscreen();
  }

  return {
    open, close, bindControls, play, resume: startPlayback, restart, seekToBeat, practiceSection,
    setRate, switchTab, toggleFullscreen,
    state: S,
    get isClassOpen() { return !$('screen-class').classList.contains('hidden'); }
  };
})();
