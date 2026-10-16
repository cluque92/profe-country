/* ============ Profe Country — Progreso y ajustes (localStorage) ============ */
window.PC = window.PC || {};

PC.Progress = (function () {
  'use strict';
  const KEY = 'profeCountry.v1';

  function blank() {
    return {
      settings: { avatar: 'vaquero', hat: '#8a5a2b', shirt: '#b03a2e', mirrorDefault: true, rate: 0.75 },
      dances: {},            // id -> { played, learned:[bool por sección], diplomaShown }
      days: [],              // fechas ISO de días con baile (racha)
      diplomaShown: false
    };
  }

  let data = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const parsed = JSON.parse(raw);
      return Object.assign(blank(), parsed);
    } catch (e) { return blank(); }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* noop */ }
  }

  function danceRec(id) {
    if (!data.dances[id]) data.dances[id] = { played: 0, learned: [], diplomaShown: false };
    return data.dances[id];
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function addToday() {
    const d = todayISO();
    if (!data.days.includes(d)) { data.days.push(d); save(); }
  }

  function streak() {
    const days = new Set(data.days);
    let n = 0;
    const cur = new Date();
    // Si hoy no ha bailado, la racha cuenta desde ayer
    if (!days.has(cur.toISOString().slice(0, 10))) cur.setDate(cur.getDate() - 1);
    for (;;) {
      const iso = cur.toISOString().slice(0, 10);
      if (days.has(iso)) {
        n++;
        cur.setDate(cur.getDate() - 1);
      } else break;
    }
    return n;
  }

  return {
    settings: () => data.settings,
    setSetting(k, v) { data.settings[k] = v; save(); },
    addToday,

    dance: danceRec,
    markPlayed(id) {
      const rec = danceRec(id);
      rec.played++;
      addToday();
      const all = PC.DANCES.every(d => danceRec(d.id).played > 0);
      save();
      return all && !data.diplomaShown;
    },
    markSectionLearned(id, idx, totalSections) {
      const rec = danceRec(id);
      rec.learned[idx] = true;
      addToday();
      save();
      return rec.learned.filter(Boolean).length >= totalSections;
    },
    isDanceLearned(id) {
      const rec = data.dances[id];
      if (!rec) return false;
      const dance = PC.getDance(id);
      return dance ? rec.learned.filter(Boolean).length >= dance.sections.length : false;
    },

    stats() {
      const playedDances = PC.DANCES.filter(d => danceRec(d.id).played > 0).length;
      const learnedDances = PC.DANCES.filter(d => PC.Progress.isDanceLearned(d.id)).length;
      const totalPlays = PC.DANCES.reduce((a, d) => a + danceRec(d.id).played, 0);
      return { playedDances, learnedDances, totalPlays, streak: streak(), total: PC.DANCES.length };
    },

    showDiploma() { data.diplomaShown = true; save(); },

    save,

    reset() { data = blank(); save(); }
  };
})();
