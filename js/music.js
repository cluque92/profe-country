/* ============ Profe Country — Música ============
   Dos fuentes con la misma interfaz:
   · YTSource: reproductor oficial de YouTube (IFrame API)
   · SynthSource: ritmo country sintetizado con Web Audio (fallback)
   El baile se sincroniza con source.time (segundos de «canción»). */
window.PC = window.PC || {};

PC.Music = (function () {
  'use strict';

  /* ---------------- YouTube ---------------- */
  function YTSource() {
    this.kind = 'yt';
    this.ready = false;
    this.failed = false;
    this._player = null;
    this._pending = null;
    this._rate = 1;
    this._cb = null;
    this._startWait = null;
  }

  YTSource.prototype.onState = function (cb) { this._cb = cb; };
  YTSource.prototype._emit = function (s) { if (this._cb) this._cb(s); };

  YTSource.prototype.mount = function (hostId) {
    const self = this;
    function create(videoId) {
      if (typeof YT === 'undefined' || !YT.Player) {
        // API no cargada (sin red o bloqueada): reintentar un rato y rendirse
        if (!self._startWait) {
          const t0 = Date.now();
          self._startWait = setInterval(() => {
            if (typeof YT !== 'undefined' && YT.Player) {
              clearInterval(self._startWait);
              self._startWait = null;
              create(self._pending ? self._pending.videoId : videoId);
            } else if (Date.now() - t0 > 6000) {
              clearInterval(self._startWait);
              self._startWait = null;
              self.failed = true;
              self._emit('error');
            }
          }, 250);
        }
        return;
      }
      self._player = new YT.Player(hostId, {
        height: '180',
        width: '320',
        videoId: videoId || '',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1, fs: 0, iv_load_policy: 3 },
        events: {
          onReady: () => {
            self.ready = true;
            if (self._pending) {
              const p = self._pending;
              self._pending = null;
              self.load(p.videoId);
              if (p.autoplay) self.play(p.fromTime || 0);
            }
          },
          onStateChange: (e) => {
            const S = YT.PlayerState;
            if (e.data === S.PLAYING) self._emit('playing');
            else if (e.data === S.PAUSED) self._emit('paused');
            else if (e.data === S.ENDED) self._emit('ended');
          },
          onError: () => { self.failed = true; self._emit('error'); }
        }
      });
    }
    create(null);
  };

  YTSource.prototype.reset = function () { this.failed = false; };

  YTSource.prototype.load = function (videoId) {
    if (!this.ready) { this._pending = { videoId, autoplay: false }; return; }
    try { this._player.cueVideoById(videoId); } catch (e) { /* noop */ }
  };

  YTSource.prototype.play = function (fromTime) {
    if (!this.ready) { this._pending = { videoId: this._pending ? this._pending.videoId : '', fromTime, autoplay: true }; return; }
    try {
      if (typeof fromTime === 'number') this._player.seekTo(Math.max(0, fromTime), true);
      this._player.setPlaybackRate(this._rate);
      this._player.playVideo();
    } catch (e) { /* noop */ }
  };

  YTSource.prototype.pause = function () {
    try { this._player && this._player.pauseVideo(); } catch (e) { /* noop */ }
  };

  YTSource.prototype.seek = function (t) {
    try { this._player && this._player.seekTo(Math.max(0, t), true); } catch (e) { /* noop */ }
  };

  YTSource.prototype.setRate = function (r) {
    this._rate = r;
    try { this._player && this._player.setPlaybackRate(r); } catch (e) { /* noop */ }
  };

  Object.defineProperty(YTSource.prototype, 'time', {
    get() { try { return this._player ? (this._player.getCurrentTime() || 0) : 0; } catch (e) { return 0; } }
  });

  Object.defineProperty(YTSource.prototype, 'duration', {
    get() { try { return this._player ? (this._player.getDuration() || 0) : 0; } catch (e) { return 0; } }
  });

  /* ---------------- Sintetizador (fallback) ---------------- */
  function SynthSource() {
    this.kind = 'synth';
    this.mode = 'band'; // 'band' | 'metro'
    this.bpm = 128;
    this.rate = 1;
    this.duration = Infinity;
    this.time = 0;
    this._playing = false;
    this._ctx = null;
    this._noise = null;
    this._timer = null;
    this._anchorCtx = 0;
    this._anchorSong = 0;
    this._nextIdx = 0;
    this._nextTime = 0;
    this._cb = null;
  }

  SynthSource.prototype.onState = function (cb) { this._cb = cb; };
  SynthSource.prototype._emit = function (s) { if (this._cb) this._cb(s); };

  SynthSource.prototype._ensureCtx = function () {
    if (!this._ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this._ctx = new AC();
      const len = this._ctx.sampleRate * 0.5;
      const buf = this._ctx.createBuffer(1, len, this._ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this._noise = buf;
      this._master = this._ctx.createGain();
      this._master.gain.value = 0.85;
      this._master.connect(this._ctx.destination);
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return true;
  };

  SynthSource.prototype.spb = function () { return 60 / (this.bpm * this.rate); };

  SynthSource.prototype._reanchor = function () {
    this._anchorCtx = this._ctx.currentTime;
    this._anchorSong = this.time;
    this._nextIdx = Math.ceil(this.time / this.spb() - 1e-6);
    this._nextTime = this._anchorCtx + (this._nextIdx * this.spb() - this.time) / this.rate;
  };

  SynthSource.prototype.play = function (fromTime) {
    if (!this._ensureCtx()) { this.failed = true; this._emit('error'); return; }
    if (typeof fromTime === 'number') this.time = fromTime;
    this._playing = true;
    this._reanchor();
    clearInterval(this._timer);
    this._timer = setInterval(() => this._schedule(), 40);
    this._emit('playing');
  };

  SynthSource.prototype.pause = function () {
    this._playing = false;
    clearInterval(this._timer);
    this._timer = null;
    this._emit('paused');
  };

  SynthSource.prototype.stop = function () { this.pause(); };

  SynthSource.prototype.seek = function (t) {
    this.time = Math.max(0, t);
    if (this._playing) this._reanchor();
  };

  SynthSource.prototype.setRate = function (r) {
    const wasPlaying = this._playing;
    if (wasPlaying) this.time = this._anchorSong + (this._ctx.currentTime - this._anchorCtx) * this.rate;
    this.rate = r;
    if (wasPlaying) this._reanchor();
  };

  SynthSource.prototype._schedule = function () {
    const ctx = this._ctx;
    const spb = this.spb();
    const horizon = ctx.currentTime + 0.2;
    let guard = 0;
    while (this._nextTime < horizon && guard++ < 32) {
      this._beat(this._nextIdx, Math.max(ctx.currentTime, this._nextTime));
      // contratiempo (8ths)
      if (this.mode === 'band') this._hat(this._nextTime + spb / 2, 0.07);
      this._nextIdx++;
      this._nextTime += spb;
    }
    this.time = this._anchorSong + (ctx.currentTime - this._anchorCtx) * this.rate;
    if (this.time >= this.duration) {
      this.pause();
      this.time = this.duration;
      this._emit('ended');
    }
  };

  SynthSource.prototype._beat = function (idx, when) {
    if (this.mode === 'metro') {
      this._click(when, idx % 4 === 0 ? 1500 : 950, 0.22);
      return;
    }
    const spb = this.spb();
    const bar = Math.floor(idx / 4);
    const b = idx % 4;
    // Progresión country: I - IV - V - I (en La)
    const prog = [0, 5, 7, 0];
    const root = 110 * Math.pow(2, prog[bar % 4] / 12);
    const swing = 0.58; // contratiempo con balanceo vaquero

    // Boom-chicka: bajo alterno raíz / quinta
    this._bass(when, b % 2 === 0 ? root : root * 1.498);
    if (b === 0 || b === 2) this._kick(when);
    if (b === 1 || b === 3) this._snare(when);
    this._hat(when, 0.05);
    // Acorde «chicka» en el contratiempo
    this._chop(when + spb * swing, root);
    // Banjo rodado
    const eighth = idx * 2 + 1;
    const pent = [0, 4, 7, 12, 7, 4];
    this._banjo(when + spb * swing, 220 * Math.pow(2, pent[eighth % pent.length] / 12), idx % 4 === 0 ? 0.14 : 0.09);
    // Lamento de steel guitar cada 2 compases
    if (idx % 8 === 0) this._steel(when, root * 2, spb * 3);
  };

  SynthSource.prototype._click = function (when, freq, gain) {
    const ctx = this._ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
    o.connect(g).connect(this._master);
    o.start(when); o.stop(when + 0.08);
  };

  SynthSource.prototype._kick = function (when) {
    const ctx = this._ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(110, when);
    o.frequency.exponentialRampToValueAtTime(48, when + 0.09);
    g.gain.setValueAtTime(0.42, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
    o.connect(g).connect(this._master);
    o.start(when); o.stop(when + 0.2);
  };

  SynthSource.prototype._snare = function (when) {
    const ctx = this._ctx;
    const src = ctx.createBufferSource(); src.buffer = this._noise;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.11);
    src.connect(f).connect(g).connect(this._master);
    src.start(when); src.stop(when + 0.13);
    // segunda escobilla: feel de brush
    const src2 = ctx.createBufferSource(); src2.buffer = this._noise;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.1, when + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, when + 0.16);
    src2.connect(g2).connect(this._master);
    src2.start(when + 0.02); src2.stop(when + 0.18);
  };

  SynthSource.prototype._hat = function (when, gain) {
    const ctx = this._ctx;
    const src = ctx.createBufferSource(); src.buffer = this._noise;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
    src.connect(f).connect(g).connect(this._master);
    src.start(when); src.stop(when + 0.06);
  };

  SynthSource.prototype._bass = function (when, freq) {
    const ctx = this._ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.001, when);
    g.gain.linearRampToValueAtTime(0.3, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.34);
    o.connect(g).connect(this._master);
    o.start(when); o.stop(when + 0.36);
  };

  SynthSource.prototype._chop = function (when, root) {
    // acorde mayor cortito, como un rasgueo
    const ctx = this._ctx;
    [2, 2.52, 3].forEach((r, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'sawtooth';
      o.frequency.value = root * r;
      f.type = 'lowpass'; f.frequency.value = 2600;
      const t = when + i * 0.008; // mini strum
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(f).connect(g).connect(this._master);
      o.start(t); o.stop(t + 0.12);
    });
  };

  SynthSource.prototype._banjo = function (when, freq, gain) {
    const ctx = this._ctx;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'square'; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = 3200;
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.09);
    o.connect(f).connect(g).connect(this._master);
    o.start(when); o.stop(when + 0.11);
  };

  SynthSource.prototype._steel = function (when, freq, dur) {
    // steel guitar: nota larga que se desliza y vibra
    const ctx = this._ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, when);
    o.frequency.linearRampToValueAtTime(freq * 1.26, when + dur * 0.35);
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 5.5; lg.gain.value = 4;
    lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.001, when);
    g.gain.linearRampToValueAtTime(0.07, when + dur * 0.2);
    g.gain.setValueAtTime(0.07, when + dur * 0.7);
    g.gain.linearRampToValueAtTime(0.001, when + dur);
    o.connect(g).connect(this._master);
    o.start(when); lfo.start(when);
    o.stop(when + dur + 0.05); lfo.stop(when + dur + 0.05);
  };

  /* ---------------- Fábrica ---------------- */
  let yt = null;

  return {
    // Obtiene (y crea una vez) la fuente de YouTube montada en el host dado
    yt: function (hostId) {
      if (!yt) { yt = new YTSource(); yt.mount(hostId); }
      return yt;
    },
    synth: function () { return new SynthSource(); }
  };
})();
