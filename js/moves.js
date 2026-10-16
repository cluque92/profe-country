/* ============ Profe Country — Biblioteca de movimientos ============
   Cada movimiento se define como keyframes de una pose articulada.
   sample() interpola (tween) entre keyframes con easing suave.
   El helper mirror() genera la variante izquierda/derecha automática. */
window.PC = window.PC || {};

PC.Moves = (function () {
  'use strict';

  // Parámetros de pose (0 = posición neutra de pie)
  //  x: desplazamiento lateral px · bodyY: agacharse(-) · bodyRot: inclinar cuerpo
  //  torsoRot: girar torso · headRot: girar cabeza
  //  shL/shR: hombros levantar · elL/elR: codos doblar
  //  thL/thR: muslos abrir · knL/knR: rodillas doblar · ftL/ftR: tobillos
  //  liftL/liftR: levantar pie px · turn: giro vertical (grados, + = derecha)
  const KEYS = ['x','bodyY','bodyRot','torsoRot','headRot','shL','shR','elL','elR',
                'thL','thR','knL','knR','ftL','ftR','liftL','liftR','turn'];
  const MIRROR_KEYS = { shL:'shR', shR:'shL', elL:'elR', elR:'elL', thL:'thR', thR:'thL',
                        knL:'knR', knR:'knL', ftL:'ftR', ftR:'ftL', liftL:'liftR', liftR:'liftL' };
  const NEGATE = ['x','turn','bodyRot','torsoRot','headRot'];

  function smooth(u) { return u * u * (3 - 2 * u); }

  function samplePose(frames, frac) {
    const pose = {};
    if (!frames || frames.length === 0) return pose;
    if (frac <= frames[0][0]) { Object.assign(pose, frames[0][1]); return pose; }
    const last = frames[frames.length - 1];
    if (frac >= last[0]) { Object.assign(pose, last[1]); return pose; }
    let i = 0;
    while (i < frames.length - 1 && frames[i + 1][0] <= frac) i++;
    const a = frames[i], b = frames[i + 1];
    const span = b[0] - a[0] || 1;
    const u = smooth(Math.min(1, Math.max(0, (frac - a[0]) / span)));
    const A = a[1], B = b[1];
    const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
    keys.forEach(k => {
      const va = A[k] || 0, vb = B[k] || 0;
      pose[k] = va + (vb - va) * u;
    });
    return pose;
  }

  function mirrorPose(p) {
    const out = {};
    for (const k in p) {
      if (MIRROR_KEYS[k]) out[MIRROR_KEYS[k]] = p[k];
      else out[k] = NEGATE.includes(k) ? -p[k] : p[k];
    }
    return out;
  }

  function mirrorFrames(frames) {
    return frames.map(([t, p]) => [t, mirrorPose(p)]);
  }

  // ---------- Definiciones base ----------
  // dir: R=izq-der del profe, L, F=adelante, B=atrás, I=en el sitio
  const BASE = {
    hold: {
      name: 'Pausa', beats: 1, dir: 'I',
      tip: 'Respira y sonríe: ¡lo estás haciendo genial!',
      frames: [[0, {}], [1, {}]]
    },
    bounce: {
      name: 'Rebote', beats: 1, dir: 'I',
      tip: 'Dobla un poquito las rodillas al ritmo, sin levantar los pies.',
      frames: [[0, {}], [0.5, { bodyY: -7, knL: 14, knR: 14 }], [1, {}]]
    },
    stepR: {
      name: 'Paso con la derecha', beats: 1, dir: 'I',
      tip: 'Apoya el pie derecho y cambia el peso a esa pierna.',
      frames: [[0, { thR: 10 }], [0.5, { bodyY: -6, thR: 0 }], [1, {}]]
    },
    sideR: {
      name: 'Paso lateral a la derecha', beats: 1, dir: 'R',
      tip: 'Da un paso amplio hacia tu derecha.',
      frames: [[0, {}], [0.45, { x: 16, thR: 16, liftR: 8, bodyY: -5 }], [0.8, { x: 30, thR: 0 }], [1, { x: 30 }]]
    },
    togetherL: {
      name: 'Junta el pie izquierdo', beats: 1, dir: 'R',
      tip: 'Acerca el pie izquierdo junto al derecho.',
      frames: [[0, { thL: 12 }], [0.5, { bodyY: -6, thL: 0 }], [1, {}]]
    },
    kickR: {
      name: 'Patada con la derecha', beats: 1, dir: 'F',
      tip: 'Lanza la pierna derecha adelante, baja suave y apóyala.',
      frames: [[0, { liftR: 10, knR: 15, bodyY: -3 }], [0.35, { liftR: 44, knR: 0, bodyRot: -4, shL: 22 }], [0.7, { liftR: 14 }], [1, {}]]
    },
    kbcR: {
      name: 'Kick-ball-change derecha', beats: 1, dir: 'F',
      tip: 'Patadita adelante, medio paso con la misma pie y cierra con la otra. ¡1 y 2!',
      frames: [[0, { liftR: 26, thR: 8, bodyY: -2 }], [0.38, { liftR: 4, knR: 10, bodyY: -7 }], [0.66, { liftL: 5, bodyY: -5 }], [1, {}]]
    },
    walkFwdR: {
      name: 'Paso adelante con la derecha', beats: 1, dir: 'F',
      tip: 'Camina adelante con la derecha, rodilla suave.',
      frames: [[0, {}], [0.5, { liftR: 16, knR: 26, bodyY: -7, shL: 14 }], [0.85, { liftR: 4, bodyY: -4 }], [1, {}]]
    },
    walkBackR: {
      name: 'Paso atrás con la derecha', beats: 1, dir: 'B',
      tip: 'Camina atrás con la derecha, cuidado con el compañero de atrás.',
      frames: [[0, {}], [0.5, { liftR: 14, knR: 30, bodyY: -8, bodyRot: -3 }], [1, { liftR: 4 }]]
    },
    hitchR: {
      name: 'Hitch derecha (rodilla arriba)', beats: 1, dir: 'I',
      tip: 'Levanta la rodilla derecha arriba, como si subieras un escalón.',
      frames: [[0, {}], [0.4, { liftR: 28, knR: 80, thR: 8, bodyY: -6, shL: 26 }], [0.85, { liftR: 6, knR: 20 }], [1, {}]]
    },
    stompR: {
      name: 'Golpe fuerte con la derecha', beats: 1, dir: 'I',
      tip: 'Sube el pie y déjalo caer con contundencia. ¡Que se entere el saloon!',
      frames: [[0, { liftR: 32, knR: 44, bodyY: -4, shL: 20, shR: 20 }], [0.5, { liftR: 0, bodyY: -14, knL: 14, knR: 14, shL: 26, shR: 26 }], [1, { bodyY: -4 }]]
    },
    heelTouchR: {
      name: 'Talón adelante derecha', beats: 1, dir: 'F',
      tip: 'Estira la pierna y toca el suelo solo con el talón.',
      frames: [[0, {}], [0.4, { liftR: 12, ftR: -20, thR: 12, bodyY: -5, headRot: 4 }], [0.85, { liftR: 4 }], [1, {}]]
    },
    shuffleFwdR: {
      name: 'Shuffle adelante derecha', beats: 2, dir: 'F',
      tip: 'Tres pasos rápidos adelante: derecha-izquierda-derecha (cha-cha-cha).',
      frames: [[0, { liftR: 14, knR: 22 }], [0.33, { liftR: 3, bodyY: -6 }], [0.55, { liftL: 12, knL: 20 }], [0.8, { liftR: 14, knR: 20 }], [1, { liftR: 2, bodyY: -4 }]]
    },
    coasterR: {
      name: 'Coaster step derecha', beats: 2, dir: 'B',
      tip: 'Atrás con la derecha, junta la izquierda y adelante derecha. ¡Como un vaivén!',
      frames: [[0, { liftR: 16, knR: 26, bodyRot: -3 }], [0.33, { liftR: 5, bodyY: -6 }], [0.55, { liftL: 14, knL: 22 }], [0.8, { liftR: 14, knR: 18, bodyRot: 2 }], [1, {}]]
    },
    rockFwdR: {
      name: 'Roca adelante derecha', beats: 1, dir: 'F',
      tip: 'Adelanta el pie derecho y echa el peso hacia delante, sin pasar de la humana… ¡del sombrero!',
      frames: [[0, {}], [0.5, { liftR: 16, knR: 24, bodyY: -11, bodyRot: 4, shL: 10, shR: 10 }], [1, { liftR: 7, bodyY: -8 }]]
    },
    recoverR: {
      name: 'Recupera sobre la derecha', beats: 1, dir: 'B',
      tip: 'Vuelve el peso a la pierna derecha.',
      frames: [[0, {}], [0.5, { liftR: 10, knR: 22, bodyY: -8, bodyRot: -2 }], [1, {}]]
    },
    rockBackR: {
      name: 'Roca atrás derecha', beats: 1, dir: 'B',
      tip: 'Atrás con la derecha y peso hacia atrás.',
      frames: [[0, {}], [0.5, { liftR: 12, knR: 30, bodyY: -10, bodyRot: -4 }], [1, { liftR: 6 }]]
    },
    recoverFwdR: {
      name: 'Recupera adelante sobre la derecha', beats: 1, dir: 'F',
      tip: 'El peso vuelve adelante, a la pierna derecha.',
      frames: [[0, {}], [0.5, { liftR: 12, knR: 20, bodyY: -8, bodyRot: 3 }], [1, {}]]
    },
    turnQuarterR: {
      name: 'Giro de 1/4 a la derecha', beats: 1, dir: 'R',
      tip: 'Gira un cuarto hacia tu derecha: ¡nuevo muro! Mantén el peso en el pie de pivote.',
      frames: [[0, {}], [0.5, { turn: 50, liftR: 10, knR: 18, bodyY: -5 }], [1, { turn: 90 }]]
    },
    paddleTurnR: {
      name: 'Paddle turn derecha', beats: 1, dir: 'R',
      tip: 'Rodilla arriba y gira un cuarto empujando con el pie: ¡remando!',
      frames: [[0, { liftR: 20, knR: 62, thR: 6 }], [0.5, { turn: 48, knR: 70, bodyY: -6 }], [1, { turn: 90, liftR: 6 }]]
    },
    pivotHalfL: {
      name: 'Pivot de 1/2 a la izquierda', beats: 2, dir: 'L',
      tip: 'Paso adelante y gira media vuelta sobre la planta del pie. ¡Cambio de sentido!',
      frames: [[0, { liftR: 14, knR: 20, bodyY: -6 }], [0.35, { liftR: 8, bodyY: -4 }], [0.75, { turn: -130 }], [1, { turn: -180 }]]
    },
    grapevineR: {
      name: 'Grapevine a la derecha', beats: 4, dir: 'R',
      tip: 'Lateral derecha, cruza la izquierda por detrás, lateral derecha y golpea palmas. ¡El paso estrella!',
      frames: [
        [0, {}],
        [0.2, { x: 14, thR: 16, liftR: 8, bodyY: -5 }],
        [0.28, { x: 30, thR: 0, liftR: 0 }],
        [0.45, { x: 44, thL: -8, knL: 24, liftL: 12, bodyY: -7 }],
        [0.53, { x: 60, thL: 0, liftL: 0 }],
        [0.7, { x: 74, thR: 16, liftR: 8, bodyY: -5 }],
        [0.78, { x: 90, thR: 0 }],
        [0.9, { shL: 50, shR: 50, elL: 45, elR: 45 }],
        [0.96, { shL: 64, shR: 64, elL: 30, elR: 30, bodyY: -5 }],
        [1, { x: 90, shL: 40, shR: 40, elL: 55, elR: 55 }]
      ]
    },
    clapBeat: {
      name: 'Palmas', beats: 1, dir: 'I',
      tip: '¡Aplauso arriba! Manos a la altura del pecho.',
      frames: [[0, { shL: 46, shR: 46, elL: 52, elR: 52 }], [0.5, { shL: 62, shR: 62, elL: 26, elR: 26, bodyY: -5 }], [0.75, { shL: 58, shR: 58, elL: 34, elR: 34 }], [1, { shL: 48, shR: 48, elL: 50, elR: 50 }]]
    },
    touchClap: {
      name: 'Toca y palmas', beats: 1, dir: 'I',
      tip: 'Junta el pie al otro y da una palmada. ¡Sincronía!',
      frames: [[0, { thL: 8, shL: 30, shR: 30, elL: 50, elR: 50 }], [0.5, { thL: 0, shL: 62, shR: 62, elL: 26, elR: 26, bodyY: -6 }], [1, {}]]
    },
    hop: {
      name: 'Salto', beats: 1, dir: 'I',
      tip: 'Saltito con los dos pies juntos. ¡Aterriza suave!',
      frames: [[0, { bodyY: -4 }], [0.45, { bodyY: -26, liftL: 16, liftR: 16, knL: 28, knR: 28, shL: 35, shR: 35 }], [0.72, { bodyY: 0 }], [1, { bodyY: -5 }]]
    },
    lowStepR: {
      name: 'Paso agachado derecha', beats: 1, dir: 'F',
      tip: 'Todo abajo: rodillas dobladas y paso cortito. ¡How low can you go!',
      frames: [[0, { bodyY: -26, knL: 26, knR: 26 }], [0.5, { liftR: 12, knR: 34, bodyY: -32 }], [1, { bodyY: -26 }]]
    },
    freeze: {
      name: '¡Freeze!', beats: 1, dir: 'I',
      tip: '¡Estatua! Ni un músculo hasta que vuelva la música.',
      frames: [[0, { shL: 72, shR: 72, elL: 16, elR: 16, headRot: -5, knL: 4, knR: 4 }], [1, { shL: 72, shR: 72, elL: 16, elR: 16, headRot: -5, knL: 4, knR: 4 }]]
    },
    poseKnees: {
      name: 'Manos a las rodillas', beats: 1, dir: 'I',
      tip: 'Agáchate un poco y apoya las manos en las rodillas.',
      frames: [[0, { bodyY: -30, bodyRot: 14, shL: 40, shR: 40, elL: 62, elR: 62, knL: 22, knR: 22 }], [1, { bodyY: -30, bodyRot: 14, shL: 40, shR: 40, elL: 62, elR: 62, knL: 22, knR: 22 }]]
    }
  };

  // ---------- Registro con variantes espejo ----------
  const MOVES = {};
  const SUFFIX = { R: 'L', L: 'R' };

  function register(id, def) {
    const lastFrame = def.frames[def.frames.length - 1][1];
    MOVES[id] = {
      id,
      name: def.name,
      beats: def.beats || 1,
      dir: def.dir || 'I',
      tip: def.tip || '',
      frames: def.frames,
      endX: lastFrame.x || 0,
      endTurn: lastFrame.turn || 0
    };
  }

  function mirrorId(id) {
    const last = id[id.length - 1];
    if (SUFFIX[last]) return id.slice(0, -1) + SUFFIX[last];
    return id;
  }

  function mirrorDef(def) {
    return {
      name: def.name.replace(/derecha/g, 'IZQ_TMP').replace(/izquierda/g, 'derecha').replace(/IZQ_TMP/g, 'izquierda'),
      beats: def.beats,
      dir: SUFFIX[def.dir] || def.dir,
      tip: def.tip.replace(/derecha/g, 'IZQ_TMP').replace(/izquierda/g, 'derecha').replace(/IZQ_TMP/g, 'izquierda'),
      frames: mirrorFrames(def.frames)
    };
  }

  Object.keys(BASE).forEach(id => {
    const def = BASE[id];
    register(id, def);
    const mirroredId = mirrorId(id);
    if (mirroredId !== id && !MOVES[mirroredId]) register(mirroredId, mirrorDef(def));
  });

  // API pública
  return {
    list: MOVES,
    sample: samplePose,
    has: id => Object.prototype.hasOwnProperty.call(MOVES, id),
    get(id) { return MOVES[id] || MOVES.hold; }
  };
})();
