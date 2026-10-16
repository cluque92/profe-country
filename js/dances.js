/* ============ Profe Country — Canciones y coreografías ============
   Cada sección suma 8 tiempos. Los movimientos vienen de PC.Moves. */
window.PC = window.PC || {};

PC.DANCES = [
  {
    id: 'coyote',
    emoji: '🤠',
    title: 'El Coyote',
    artist: 'Coyote Dax',
    song: 'No Rompas Más Mi Pobre Corazón',
    bpm: 128,
    offset: 0,
    walls: 4,
    level: 'Principiante',
    levelClass: 'f',
    stars: 1,
    desc: 'El clásico de las fiestas: kick-ball-changes, uvas y palmadas. ¡El que no lo baile no ha ido de fiesta!',
    yt: 'ZHl74gcLoNk',
    search: 'Coyote Dax No rompas más mi pobre corazón',
    note: 'Versión popular de 32 tiempos y 4 muros. Si el profe va adelantado o retrasado, ajusta el «compás» con los botones − / +.',
    sections: [
      { name: 'Calentamiento y uva derecha', moves: ['kbcR', 'kbcL', 'kbcR', 'kbcL', 'grapevineR'] },
      { name: 'Uva izquierda', moves: ['kbcR', 'kbcL', 'kbcR', 'kbcL', 'grapevineL'] },
      { name: 'Paseo adelante y atrás', moves: ['walkFwdR', 'walkFwdL', 'walkFwdR', 'touchClap', 'walkBackL', 'walkBackR', 'walkBackL', 'turnQuarterR'] },
      { name: 'Rocas y golpes', moves: ['rockFwdR', 'recoverL', 'rockBackR', 'recoverFwdL', 'stompR', 'clapBeat', 'stompL', 'turnQuarterR'] }
    ]
  },
  {
    id: 'cupid',
    emoji: '💘',
    title: 'Cupid Shuffle',
    artist: 'Cupid',
    song: 'Cupid Shuffle',
    bpm: 104,
    offset: 0,
    walls: 4,
    level: 'Principiante',
    levelClass: 'f',
    stars: 1,
    desc: 'Lateral derecha, lateral izquierda, patadas y paseíllo con giro. La canción te va cantando los pasos.',
    yt: 'uPna1dIeUHQ',
    search: 'Cupid Shuffle official',
    note: 'Cada bloque de 8 coincide con una frase de la canción: «to the right, to the left, kick, walk it by…».',
    sections: [
      { name: 'A la derecha (to the right)', moves: ['sideR', 'togetherL', 'sideR', 'togetherL', 'sideR', 'togetherL', 'sideR', 'togetherL'] },
      { name: 'A la izquierda (to the left)', moves: ['sideL', 'togetherR', 'sideL', 'togetherR', 'sideL', 'togetherR', 'sideL', 'togetherR'] },
      { name: 'Patadas (kick)', moves: ['kickR', 'stepR', 'kickR', 'stepR', 'kickL', 'stepL', 'kickL', 'stepL'] },
      { name: 'Paseíllo y giro (walk it by)', moves: ['walkFwdR', 'hitchR', 'walkFwdL', 'hitchL', 'walkFwdR', 'hitchR', 'walkFwdL', 'turnQuarterL'] }
    ]
  },
  {
    id: 'chachaslide',
    emoji: '🕺',
    title: 'Cha Cha Slide',
    artist: 'DJ Casper',
    song: 'Cha Cha Slide',
    bpm: 108,
    offset: 0,
    walls: 1,
    level: 'Principiante',
    levelClass: 'f',
    stars: 1,
    desc: 'El profe canción: «stomp», «hop», «freeze»… haz exactamente lo que dice la letra.',
    yt: 'wZv62ShoStY',
    search: 'DJ Casper Cha Cha Slide official video',
    note: 'Baile guiado por la letra: ajusta el compás (− / +) hasta que las palmas caigan con «clap, clap, yeah».',
    sections: [
      { name: '«Clap your hands» + derecha', moves: ['clapBeat', 'clapBeat', 'clapBeat', 'clapBeat', 'sideR', 'togetherL', 'sideR', 'togetherL'] },
      { name: 'Izquierda y «take it back»', moves: ['sideL', 'togetherR', 'sideL', 'togetherR', 'walkBackR', 'walkBackL', 'walkBackR', 'walkBackL'] },
      { name: '«Hop, stomp, cha cha»', moves: ['hop', 'stompR', 'stompL', 'shuffleFwdR', 'shuffleFwdL', 'turnQuarterR'] },
      { name: 'Cha cha suave', moves: ['sideR', 'togetherL', 'sideL', 'togetherR', 'shuffleFwdR', 'shuffleFwdL'] },
      { name: '«How low can you go»', moves: ['lowStepR', 'lowStepL', 'lowStepR', 'lowStepL', 'poseKnees', 'hop', 'clapBeat'] },
      { name: '«Freeze» y cierre', moves: ['walkFwdR', 'walkFwdL', 'walkFwdR', 'freeze', 'sideR', 'togetherL', 'sideL', 'togetherR'] }
    ]
  },
  {
    id: 'electric',
    emoji: '⚡',
    title: 'Electric Slide',
    artist: 'Marcia Griffiths',
    song: 'Electric Boogie',
    bpm: 110,
    offset: 0,
    walls: 4,
    level: 'Fácil',
    levelClass: 'f',
    stars: 2,
    desc: 'Dos uvas, pasos atrás y giro. El baile que suena en todas las bodas del mundo.',
    yt: 'iZyB7Rw9TA4',
    search: 'Marcia Griffiths Electric Boogie',
    note: 'Versión popular de 16 tiempos y 4 muros.',
    sections: [
      { name: 'Uvas', moves: ['grapevineR', 'grapevineL'] },
      { name: 'Atrás y giro', moves: ['walkBackR', 'touchClap', 'walkBackL', 'touchClap', 'walkBackR', 'turnQuarterL', 'clapBeat', 'touchClap'] }
    ]
  },
  {
    id: 'cotton',
    emoji: '🌾',
    title: 'Cotton Eye Joe',
    artist: 'Rednex',
    song: 'Cotton Eye Joe',
    bpm: 139,
    offset: 0,
    walls: 4,
    level: 'Fácil-medio',
    levelClass: 'm',
    stars: 2,
    desc: 'Ritmo frenético: kick-ball-changes, uvas y camino con hitchs. Aguanta el tipo hasta el final.',
    yt: 'mOYZaiDZ7BM',
    search: 'Rednex Cotton Eye Joe official video',
    note: 'Va rapidito (139 BPM): si te lías, bájale la velocidad a 0.75×.',
    sections: [
      { name: 'Kick-ball-changes y laterales', moves: ['kbcR', 'kbcL', 'kbcR', 'kbcL', 'sideR', 'togetherL', 'sideL', 'togetherR'] },
      { name: 'Uvas', moves: ['grapevineR', 'grapevineL'] },
      { name: 'Camino con hitch', moves: ['walkFwdR', 'hitchR', 'walkFwdL', 'hitchL', 'walkFwdR', 'hitchR', 'walkFwdL', 'hitchL'] },
      { name: 'Golpes y giro', moves: ['stompR', 'clapBeat', 'stompL', 'clapBeat', 'stompR', 'clapBeat', 'turnQuarterR', 'touchClap'] }
    ]
  },
  {
    id: 'achy',
    emoji: '💔',
    title: 'Achy Breaky Heart',
    artist: 'Billy Ray Cyrus',
    song: 'Achy Breaky Heart',
    bpm: 128,
    offset: 0,
    walls: 4,
    level: 'Medio',
    levelClass: 'm',
    stars: 3,
    desc: 'Uvas, rocas y pivots con media vuelta. El hermano yanqui del Coyote.',
    yt: 'byQIPdHMpjc',
    search: 'Billy Ray Cyrus Achy Breaky Heart official',
    note: 'Versión popular de 32 tiempos y 4 muros.',
    sections: [
      { name: 'Uvas', moves: ['grapevineR', 'grapevineL'] },
      { name: 'Silla de mecer (rocking chair)', moves: ['rockFwdR', 'recoverL', 'rockBackR', 'recoverFwdL', 'rockFwdL', 'recoverR', 'rockBackL', 'recoverFwdR'] },
      { name: 'Pivots y golpes', moves: ['walkFwdR', 'pivotHalfL', 'stompR', 'stompL', 'walkFwdL', 'pivotHalfR'] },
      { name: 'Kick-ball-changes y muro', moves: ['kbcR', 'kbcL', 'kbcR', 'kbcL', 'walkFwdR', 'walkFwdL', 'walkFwdR', 'turnQuarterR'] }
    ]
  },
  {
    id: 'payaso',
    emoji: '🤡',
    title: 'Payaso de Rodeo',
    artist: 'Caballo Dorado',
    song: 'Payaso de Rodeo',
    bpm: 130,
    offset: 0,
    walls: 4,
    level: 'Medio',
    levelClass: 'm',
    stars: 3,
    desc: 'Pasitos laterales con talón, palmadas y saltos. Compi del Coyote en todas las fiestas mexicanas.',
    yt: 'NzEMHt46La0',
    search: 'Caballo Dorado Payaso de Rodeo video oficial',
    note: 'Arrastra el pie con estilo payaso: ¡exagera las expresiones!',
    sections: [
      { name: 'Pasito derecho', moves: ['sideR', 'heelTouchL', 'sideR', 'hitchL', 'sideR', 'heelTouchL', 'sideR', 'togetherL'] },
      { name: 'Pasito izquierdo', moves: ['sideL', 'heelTouchR', 'sideL', 'hitchR', 'sideL', 'heelTouchR', 'sideL', 'togetherR'] },
      { name: 'Camino con palmas', moves: ['walkFwdR', 'clapBeat', 'walkFwdL', 'clapBeat', 'walkBackR', 'clapBeat', 'walkBackL', 'clapBeat'] },
      { name: 'Saltos y giro', moves: ['hop', 'hop', 'kbcR', 'kbcL', 'stompR', 'stompL', 'turnQuarterR', 'touchClap'] }
    ]
  },
  {
    id: 'watermelon',
    emoji: '🍉',
    title: 'Watermelon Crawl',
    artist: 'Tracy Byrd',
    song: 'Watermelon Crawl',
    bpm: 112,
    offset: 0,
    walls: 4,
    level: 'Avanzado',
    levelClass: 'a',
    stars: 4,
    desc: '48 tiempos con shuffles, paddle turns y coaster steps. El jefe final de la pista.',
    yt: 'BFPdX2TFiIE',
    search: 'Tracy Byrd Watermelon Crawl official video',
    note: '48 tiempos y 4 muros. Digno de cinturón negro (de vaquero).',
    sections: [
      { name: 'Uva y shuffles', moves: ['grapevineR', 'shuffleFwdR', 'shuffleFwdL'] },
      { name: 'Uva y shuffles (izquierda)', moves: ['grapevineL', 'shuffleFwdL', 'shuffleFwdR'] },
      { name: 'Paddle turns', moves: ['paddleTurnR', 'paddleTurnR', 'paddleTurnR', 'paddleTurnR', 'paddleTurnL', 'paddleTurnL', 'paddleTurnL', 'paddleTurnL'] },
      { name: 'Coasters y rocas', moves: ['coasterR', 'coasterL', 'rockFwdR', 'recoverL', 'rockBackR', 'recoverFwdL'] },
      { name: 'Camino con hitch', moves: ['walkFwdR', 'hitchR', 'walkFwdL', 'hitchL', 'walkFwdR', 'hitchR', 'walkFwdL', 'hitchL'] },
      { name: 'Golpes y cierre', moves: ['stompR', 'clapBeat', 'stompL', 'clapBeat', 'walkFwdR', 'pivotHalfL', 'turnQuarterR'] }
    ]
  }
];

PC.getDance = function (id) {
  return PC.DANCES.find(d => d.id === id) || null;
};

// Aplana la coreografía: lista de movimientos con tiempo de inicio y sección
PC.flatten = function (dance) {
  const flat = [];
  let beat = 0;
  dance.sections.forEach((sec, si) => {
    const secStart = beat;
    sec.moves.forEach(mid => {
      const m = PC.Moves.get(mid);
      flat.push({ moveId: mid, startBeat: beat, beats: m.beats, section: si });
      beat += m.beats;
    });
    if (beat - secStart !== 8 && typeof console !== 'undefined') {
      console.warn(`[Profe Country] «${dance.title}» sección ${si + 1} suma ${beat - secStart} tiempos (debería ser 8)`);
    }
  });
  return { flat, totalBeats: beat };
};
