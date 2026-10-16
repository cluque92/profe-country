/* ============ Profe Country — El profe vaquero/a SVG ============
   Personaje articulado: se construye una vez y cada fotograma se
   actualizan transform/opacity (compositor-friendly). */
window.PC = window.PC || {};

PC.Dancer = (function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const COL = {
    skin: '#f1c193', skinDark: '#d9a671', hair: '#4a2c17',
    jeans: '#46618f', jeansDark: '#3a5078', boots: '#6d4322', bootsDark: '#57351a',
    belt: '#4a2c17', buckle: '#d4a017', line: '#33200f'
  };

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function Dancer(host, settings) {
    this.settings = Object.assign({ avatar: 'vaquero', hat: '#8a5a2b', shirt: '#b03a2e', mirror: true }, settings || {});
    this.mirror = this.settings.mirror;
    this.turnCos = 1;
    this._shirtNodes = [];
    this._hatNodes = [];
    this._build(host);
  }

  Dancer.prototype._build = function (host) {
    host.innerHTML = '';
    const svg = el('svg', { viewBox: '0 0 420 560', role: 'img', 'aria-label': 'Profe de country bailando' }, host);
    this.svg = svg;

    const root = el('g', { id: 'd-root', transform: 'translate(210,520)' }, svg);

    // Sombra
    this.shadow = el('ellipse', { cx: 0, cy: 6, rx: 62, ry: 11, fill: 'rgba(0,0,0,0.3)' }, root);

    // Espejo (voltear para seguir como en clase presencial)
    this.gMirror = el('g', { id: 'd-mirror' }, root);

    // Giro vertical (muros): escala X = cos(turno)
    this.gTurn = el('g', { id: 'd-turn' }, this.gMirror);

    // Grupo del cuerpo: translate(x, bodyY) rotate(bodyRot)
    this.gMove = el('g', { id: 'd-move' }, this.gTurn);

    this._buildLeg(this.gMove, 'L', 16);
    this._buildLeg(this.gMove, 'R', -16);
    this._buildTorso(this.gMove);
  };

  Dancer.prototype._buildLeg = function (parent, side, hipX) {
    const leg = el('g', { id: 'leg' + side, transform: `translate(${hipX},-150)` }, parent);
    const thigh = el('g', { id: 'th' + side }, leg);
    el('rect', { x: -9, y: -2, width: 18, height: 60, rx: 9, fill: COL.jeans, stroke: COL.line, 'stroke-width': 1.5 }, thigh);
    const knee = el('g', { id: 'kn' + side, transform: 'translate(0,58)' }, thigh);
    el('rect', { x: -7, y: 0, width: 14, height: 56, rx: 7, fill: COL.jeansDark, stroke: COL.line, 'stroke-width': 1.5 }, knee);
    const foot = el('g', { id: 'ft' + side, transform: 'translate(0,54)' }, knee);
    // Bota
    el('path', { d: 'M -10 0 L 10 0 L 10 8 Q 10 14 4 14 L -10 14 Z', fill: COL.boots, stroke: COL.line, 'stroke-width': 1.5 }, foot);
    el('rect', { x: side === 'L' ? 8 : -12, y: 2, width: 16, height: 12, rx: 6, fill: COL.boots, stroke: COL.line, 'stroke-width': 1.5 }, foot);
    this['leg' + side] = leg;
    this['thigh' + side] = thigh;
    this['knee' + side] = knee;
    this['foot' + side] = foot;
    this['hipX' + side] = hipX;
  };

  Dancer.prototype._buildTorso = function (parent) {
    const torso = el('g', { id: 'torso', transform: 'translate(0,-150)' }, parent);

    // Camisa
    const shirt = el('path', { d: 'M -38 -104 Q -42 -100 -41 -86 L -37 -6 Q -36 4 -26 4 L 26 4 Q 36 4 37 -6 L 41 -86 Q 42 -100 38 -104 Q 20 -114 0 -114 Q -20 -114 -38 -104 Z',
      fill: this.settings.shirt, stroke: COL.line, 'stroke-width': 2 }, torso);
    this._shirtNodes.push(shirt);
    // Botones
    el('circle', { cx: 0, cy: -84, r: 2.4, fill: '#f7e8c9' }, torso);
    el('circle', { cx: 0, cy: -62, r: 2.4, fill: '#f7e8c9' }, torso);
    el('circle', { cx: 0, cy: -40, r: 2.4, fill: '#f7e8c9' }, torso);
    // Cinturón + hebilla
    el('rect', { x: -39, y: -10, width: 78, height: 14, rx: 5, fill: COL.belt }, torso);
    el('rect', { x: -9, y: -9, width: 18, height: 12, rx: 3, fill: COL.buckle, stroke: COL.line, 'stroke-width': 1.5 }, torso);

    // Brazos (detrás de nada: en frente del torso, tras la cabeza visualmente)
    this._buildArm(torso, 'L', 42);
    this._buildArm(torso, 'R', -42);

    // Cabeza
    const head = el('g', { id: 'headg', transform: 'translate(0,-126)' }, torso);
    el('circle', { cx: 0, cy: 0, r: 27, fill: COL.skin, stroke: COL.line, 'stroke-width': 2 }, head);
    // Cuello
    el('rect', { x: -8, y: 20, width: 16, height: 12, rx: 5, fill: COL.skinDark }, head);

    // Cara (visible de frente)
    const face = el('g', { id: 'd-face' }, head);
    el('circle', { cx: -9, cy: -4, r: 2.9, fill: COL.line }, face);
    el('circle', { cx: 9, cy: -4, r: 2.9, fill: COL.line }, face);
    el('path', { d: 'M -13 -11 Q -9 -14 -5 -11', fill: 'none', stroke: COL.line, 'stroke-width': 2, 'stroke-linecap': 'round' }, face);
    el('path', { d: 'M 5 -11 Q 9 -14 13 -11', fill: 'none', stroke: COL.line, 'stroke-width': 2, 'stroke-linecap': 'round' }, face);
    el('path', { d: 'M -10 8 Q 0 17 10 8', fill: 'none', stroke: COL.line, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, face);
    el('circle', { cx: -18, cy: 4, r: 4.5, fill: 'rgba(224,122,95,0.35)' }, face);
    el('circle', { cx: 18, cy: 4, r: 4.5, fill: 'rgba(224,122,95,0.35)' }, face);

    // Nuca (visible de espaldas)
    const back = el('g', { id: 'd-headback' }, head);
    el('path', { d: 'M -24 -6 Q -20 -26 0 -26 Q 20 -26 24 -6 Q 12 -16 0 -16 Q -12 -16 -24 -6 Z', fill: COL.hair }, back);
    el('path', { d: 'M -24 -6 Q -18 -14 0 -14 Q 18 -14 24 -6 L 24 6 Q 12 0 0 0 Q -12 0 -24 6 Z', fill: COL.hair }, back);

    // Coleta de la vaquera
    this.ponytail = el('ellipse', { cx: 27, cy: 6, rx: 8, ry: 18, fill: COL.hair, transform: 'rotate(-14 27 6)' }, head);

    // Sombrero
    const hat = el('g', { id: 'd-hat', transform: 'translate(0,-18)' }, head);
    this._hatNodes.push(
      el('ellipse', { cx: 0, cy: 0, rx: 40, ry: 10, fill: this.settings.hat, stroke: COL.line, 'stroke-width': 2 }, hat),
      el('path', { d: 'M -18 -2 Q -20 -30 -14 -34 Q 0 -40 14 -34 Q 20 -30 18 -2 Z', fill: this.settings.hat, stroke: COL.line, 'stroke-width': 2 }, hat)
    );
    el('rect', { x: -18, y: -10, width: 36, height: 8, rx: 3, fill: 'rgba(0,0,0,0.28)' }, hat);

    this.face = face;
    this.headBack = back;
    this.headGroup = head;
    this.torsoGroup = torso;
  };

  Dancer.prototype._buildArm = function (torso, side, shoulderX) {
    const arm = el('g', { id: 'arm' + side, transform: `translate(${shoulderX},-92)` }, torso);
    const sleeve = el('rect', { x: -6.5, y: -4, width: 13, height: 48, rx: 6.5, fill: this.settings.shirt, stroke: COL.line, 'stroke-width': 1.5 }, arm);
    this._shirtNodes.push(sleeve);
    const elbow = el('g', { id: 'elw' + side, transform: 'translate(0,44)' }, arm);
    el('rect', { x: -5.5, y: 0, width: 11, height: 40, rx: 5.5, fill: COL.skin, stroke: COL.line, 'stroke-width': 1.5 }, elbow);
    el('circle', { cx: 0, cy: 42, r: 7.5, fill: COL.skin, stroke: COL.line, 'stroke-width': 1.5 }, elbow);
    this['arm' + side] = arm;
    this['elbow' + side] = elbow;
    this['shoulderX' + side] = shoulderX;
  };

  Dancer.prototype.setSettings = function (s) {
    this.settings = Object.assign(this.settings, s);
    if (s.hat) this._hatNodes.forEach(n => n.setAttribute('fill', s.hat));
    if (s.shirt) this._shirtNodes.forEach(n => n.setAttribute('fill', s.shirt));
    this.ponytail.style.display = this.settings.avatar === 'vaquera' ? '' : 'none';
    if (s.mirror !== undefined) this.mirror = s.mirror;
  };

  // Exageración cartoon: amplifica la amplitud de los movimientos
  const GAIN = { lift: 1.35, ang: 1.15, y: 1.2 };

  Dancer.prototype.render = function (p, opts) {
    opts = opts || {};
    const t = opts.time || 0;
    const v = k => (p[k] || 0) * GAIN.ang;

    // En pausa: respiración, balanceo y peso cambiando de pie
    let bodyY = (p.bodyY || 0) * GAIN.y;
    let headRot = v('headRot');
    let x = p.x || 0;
    let shL = v('shL'), shR = v('shR');
    if (!opts.playing) {
      bodyY += Math.sin(t * 1.7) * 3.2;
      headRot += Math.sin(t * 0.9) * 3;
      x += Math.sin(t * 0.7) * 6;
      const sway = Math.sin(t * 1.3) * 3;
      shL += sway; shR -= sway;
    }

    this.gMove.setAttribute('transform', `translate(${x},${bodyY}) rotate(${v('bodyRot')})`);
    this.torsoGroup.setAttribute('transform', `translate(0,-150) rotate(${v('torsoRot')})`);
    this.headGroup.setAttribute('transform', `translate(0,-126) rotate(${headRot})`);

    // Piernas (signo por lado para que "+" = abrir hacia fuera)
    this.legL.setAttribute('transform', `translate(${this.hipXL},${-150 - (p.liftL || 0) * GAIN.lift})`);
    this.legR.setAttribute('transform', `translate(${this.hipXR},${-150 - (p.liftR || 0) * GAIN.lift})`);
    this.thighL.setAttribute('transform', `rotate(${v('thL')})`);
    this.thighR.setAttribute('transform', `rotate(${-v('thR')})`);
    this.kneeL.setAttribute('transform', `translate(0,58) rotate(${-v('knL')})`);
    this.kneeR.setAttribute('transform', `translate(0,58) rotate(${v('knR')})`);
    this.footL.setAttribute('transform', `translate(0,54) rotate(${v('ftL')})`);
    this.footR.setAttribute('transform', `translate(0,54) rotate(${-v('ftR')})`);

    // Brazos (el codo dobla hacia dentro)
    this.armL.setAttribute('transform', `translate(${this.shoulderXL},-92) rotate(${shL})`);
    this.armR.setAttribute('transform', `translate(${this.shoulderXR},-92) rotate(${-shR})`);
    this.elbowL.setAttribute('transform', `translate(0,44) rotate(${-v('elL')})`);
    this.elbowR.setAttribute('transform', `translate(0,44) rotate(${v('elR')})`);

    // Espejo
    this.gMirror.setAttribute('transform', this.mirror ? 'scale(-1,1)' : 'scale(1,1)');

    // Giro de muro: escala X = cos(turno) con aplastamiento mínimo legible
    const cos = Math.cos((p.turn || 0) * Math.PI / 180);
    const sx = Math.abs(cos) < 0.35 ? (cos < 0 ? -0.35 : 0.35) : cos;
    this.gTurn.setAttribute('transform', `scale(${sx},1)`);
    const front = cos > 0.15;
    this.face.setAttribute('opacity', front ? 1 : 0);
    this.headBack.setAttribute('opacity', front ? 0 : 1);

    // Sombra se encoge al saltar
    const shScale = Math.max(0.5, 1 + bodyY / 130);
    this.shadow.setAttribute('transform', `scale(${shScale},1)`);
  };

  return Dancer;
})();
