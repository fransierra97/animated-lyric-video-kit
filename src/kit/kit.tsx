// Drawing kit / Kit de dibujo: time helpers and reusable SVG pieces
// (characters, boat, lips, heart, dog, tree…). Everything is drawn on a
// 1080x1920 canvas and animated from `t`, the song time in seconds.
// Names are in Spanish; see the glossary in README.md.
import React from 'react';
import {loadFont as cargarKalam} from '@remotion/google-fonts/Kalam';
import {loadFont as cargarUnbounded} from '@remotion/google-fonts/Unbounded';

export const fuenteLetra = cargarKalam('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
}).fontFamily;
export const fuenteArtista = cargarUnbounded('normal', {
  weights: ['900'],
  subsets: ['latin'],
}).fontFamily;

// ── Utilidades ──────────────────────────────────────────────────────────
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/** Progreso 0..1 de `t` entre `a` y `b`. */
export const u = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const eio = (k: number) =>
  k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const eo = (k: number) => 1 - Math.pow(1 - k, 3);
export const ei = (k: number) => k * k * k;
export const back = (k: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};
/** Aparición con rebote: 0 antes de `en`, 1 después. */
export const pop = (t: number, en: number, dur = 0.35) =>
  t <= en ? 0 : back(u(t, en, en + dur));
/** Pseudoaleatorio determinista 0..1. */
export const rnd = (i: number, sal = 0) => {
  const x = Math.sin(i * 127.1 + sal * 311.7 + 13.37) * 43758.5453;
  return x - Math.floor(x);
};
export const rad = (g: number) => (g * Math.PI) / 180;
export const lerp2 = (
  a: [number, number],
  b: [number, number],
  k: number,
): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
/** Sacudida amortiguada: 0 antes de `en`, oscila y se apaga. */
export const sacudida = (t: number, en: number, dur = 0.6, frec = 5) => {
  if (t < en || t > en + dur) return 0;
  const k = (t - en) / dur;
  return Math.sin(k * Math.PI * 2 * frec * dur) * (1 - k) * (1 - k);
};

export const C = {
  crema: '#fff1d6',
  rojo: '#e63946',
  rojoOsc: '#a4161a',
  rosa: '#ff8fa3',
  marino: '#1d3557',
  teja: '#c8553d',
  tejaOsc: '#9c3f2c',
  oro: '#f6c453',
  madera: '#8a5a3b',
  maderaOsc: '#5f3b25',
  pelo: '#2a1a17',
  hoja: '#2f7d52',
  hojaClara: '#4fa870',
  hojaOsc: '#1f5c3c',
};

// ── Piezas básicas ──────────────────────────────────────────────────────
export const Cielo: React.FC<{
  id: string;
  stops: [number, string][];
  alto?: number;
}> = ({id, stops, alto = 1010}) => (
  <>
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={alto}>
        {stops.map(([o, c], i) => (
          <stop key={i} offset={o} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="1080" height="1920" fill={`url(#${id})`} />
  </>
);

export const Estrellas: React.FC<{
  t: number;
  n?: number;
  maxY?: number;
  opacity?: number;
}> = ({t, n = 70, maxY = 900, opacity = 1}) => (
  <g opacity={opacity}>
    {Array.from({length: n}).map((_, i) => {
      const tw = 0.55 + 0.45 * Math.sin(t * (1.2 + rnd(i, 3) * 2.5) + rnd(i, 4) * 6.28);
      return (
        <circle
          key={i}
          cx={rnd(i, 1) * 1080}
          cy={rnd(i, 2) * maxY}
          r={1.4 + rnd(i, 5) * 2.4}
          fill="#fff8e1"
          opacity={tw * (0.5 + rnd(i, 6) * 0.5)}
        />
      );
    })}
  </g>
);

export const Luna: React.FC<{
  x: number;
  y: number;
  r: number;
  color?: string;
  crateres?: boolean;
}> = ({x, y, r, color = '#ffeebd', crateres = true}) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.75} fill={color} opacity={0.07} />
    <circle cx={x} cy={y} r={r * 1.35} fill={color} opacity={0.12} />
    <circle cx={x} cy={y} r={r} fill={color} />
    {crateres ? (
      <g fill="#000" opacity={0.07}>
        <circle cx={x - r * 0.3} cy={y - r * 0.25} r={r * 0.2} />
        <circle cx={x + r * 0.35} cy={y + r * 0.2} r={r * 0.14} />
        <circle cx={x - r * 0.1} cy={y + r * 0.45} r={r * 0.1} />
      </g>
    ) : null}
  </g>
);

/** Franja de olas: curva senoidal cerrada hasta el fondo del lienzo. */
export const ola = (
  y: number,
  amp: number,
  lon: number,
  fase: number,
  fondo = 1930,
) => {
  let d = `M -60 ${fondo} L -60 ${y.toFixed(1)}`;
  for (let x = -60; x <= 1140; x += 24) {
    const yy = y + amp * Math.sin((x / lon) * Math.PI * 2 + fase);
    d += ` L ${x} ${yy.toFixed(1)}`;
  }
  return `${d} L 1140 ${fondo} Z`;
};

/** Mar en tres capas; `children` queda entre la capa de fondo y las de delante. */
export const Mar: React.FC<{
  y: number;
  t: number;
  colores: [string, string, string];
  amp?: number;
  children?: React.ReactNode;
  medio?: React.ReactNode;
}> = ({y, t, colores, amp = 9, children, medio}) => (
  <g>
    <path d={ola(y, amp, 300, t * 1.3)} fill={colores[0]} />
    {children}
    <path d={ola(y + 46, amp * 1.15, 380, -t * 1.6 + 1)} fill={colores[1]} />
    {medio}
    <path d={ola(y + 104, amp * 1.3, 460, t * 1.9 + 2)} fill={colores[2]} />
  </g>
);

const LABIO_FUERA =
  'M-50,0 C-34,-14 -20,-27 -9,-23 C-5,-21.5 -2,-19 0,-17.5 C2,-19 5,-21.5 9,-23 C20,-27 34,-14 50,0 C34,22 17,31 0,31 C-17,31 -34,22 -50,0 Z';
const LABIO_BOCA =
  'M-50,0 C-30,-5 -14,-1 0,1 C14,-1 30,-5 50,0 C30,7 14,8 0,8 C-14,8 -30,7 -50,0 Z';

/** Labios (beso). Ancho 100 a escala 1, centrados en el origen. */
export const Labios: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  rot?: number;
  opacity?: number;
  color?: string;
}> = ({x = 0, y = 0, s = 1, rot = 0, opacity = 1, color = C.rojo}) =>
  s <= 0.001 || opacity <= 0.001 ? null : (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`} opacity={opacity}>
      <path d={LABIO_FUERA} fill={color} />
      <path d={LABIO_BOCA} fill="#7d0f1f" opacity={0.9} />
      <ellipse cx="15" cy="18" rx="13" ry="4.5" fill="#fff" opacity={0.35} transform="rotate(-8 15 18)" />
    </g>
  );

export const CORAZON =
  'M0,-20 C-10,-46 -54,-42 -54,-8 C-54,22 -20,38 0,60 C20,38 54,22 54,-8 C54,-42 10,-46 0,-20 Z';

/** Corazón. Ancho 108 a escala 1; el origen queda cerca del centro. */
export const Corazon: React.FC<{
  x?: number;
  y?: number;
  s?: number;
  rot?: number;
  opacity?: number;
  color?: string;
  brillo?: boolean;
}> = ({x = 0, y = 0, s = 1, rot = 0, opacity = 1, color = C.rojo, brillo = true}) =>
  s <= 0.001 || opacity <= 0.001 ? null : (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`} opacity={opacity}>
      <path d={CORAZON} fill={color} />
      {brillo ? (
        <ellipse cx="-27" cy="-14" rx="11" ry="7" fill="#fff" opacity={0.35} transform="rotate(-35 -27 -14)" />
      ) : null}
    </g>
  );

/** Estallido de labios y corazones a partir de un punto. */
export const Estallido: React.FC<{
  x: number;
  y: number;
  t: number;
  en: number;
  n?: number;
  fuerza?: number;
  vida?: number;
  sal?: number;
  s?: number;
}> = ({x, y, t, en, n = 16, fuerza = 1, vida = 1.5, sal = 0, s = 1}) => {
  const tau = t - en;
  if (tau < 0 || tau > vida) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const ang = (i / n) * Math.PI * 2 + rnd(i, sal) * 0.8;
        const vel = (260 + rnd(i, sal + 1) * 420) * fuerza;
        const k = eo(clamp(tau / vida));
        const px = x + Math.cos(ang) * vel * k;
        const py = y + Math.sin(ang) * vel * k * 0.85 - 60 * k + 260 * tau * tau * 0.5;
        const esc = (0.35 + rnd(i, sal + 2) * 0.5) * s * Math.min(1, tau * 8);
        const op = 1 - ei(clamp(tau / vida));
        const rot = (rnd(i, sal + 3) - 0.5) * 80 + tau * 60 * (rnd(i, sal + 4) - 0.5);
        return i % 2 === 0 ? (
          <Labios key={i} x={px} y={py} s={esc} rot={rot} opacity={op} />
        ) : (
          <Corazon key={i} x={px} y={py} s={esc * 0.8} rot={rot} opacity={op} color={i % 4 === 1 ? C.rosa : C.rojo} />
        );
      })}
    </g>
  );
};

/** Labios y corazones que suben flotando (farolillos). */
export const Flotantes: React.FC<{
  t: number;
  desde: number;
  n?: number;
  yBase?: number;
  yTope?: number;
  sal?: number;
  xMin?: number;
  xMax?: number;
  s?: number;
  ritmo?: number;
}> = ({t, desde, n = 14, yBase = 1000, yTope = 250, sal = 0, xMin = 60, xMax = 1020, s = 1, ritmo = 0.28}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const nace = desde + i * ritmo + rnd(i, sal) * 0.3;
      const tau = t - nace;
      if (tau < 0) return null;
      const vida = 3.2 + rnd(i, sal + 1) * 1.6;
      const k = (tau % (vida + 0.4)) / vida;
      if (k > 1) return null;
      const px = lerp(xMin, xMax, rnd(i, sal + 2)) + Math.sin(tau * 1.6 + i) * 26;
      const py = lerp(yBase, yTope, eo(k) * 0.4 + k * 0.6);
      const op = Math.min(1, k * 6) * (1 - ei(k));
      const esc = (0.4 + rnd(i, sal + 3) * 0.45) * s;
      const rot = Math.sin(tau * 1.3 + i * 2) * 14;
      return i % 3 === 0 ? (
        <Corazon key={i} x={px} y={py} s={esc * 0.75} rot={rot} opacity={op} color={i % 2 ? C.rosa : C.rojo} />
      ) : (
        <Labios key={i} x={px} y={py} s={esc} rot={rot} opacity={op} />
      );
    })}
  </g>
);

// ── Personajes ──────────────────────────────────────────────────────────
export type Pose = {
  /** Brazo delantero: [ángulo del hombro, flexión del codo] en grados.
   * 0 = colgando, 90 = hacia delante, 180 = arriba. */
  bd?: [number, number];
  /** Brazo trasero. */
  bt?: [number, number];
  /** Fase de la zancada (radianes) y su amplitud en grados. */
  paso?: number;
  zancada?: number;
  /** Ángulo fijo de la pierna trasera (grados; negativo = hacia atrás). */
  pt?: number;
  /** Inclinación del cuerpo hacia delante (grados). */
  inclina?: number;
  /** Giro de la cabeza (grados; positivo = hacia abajo). */
  cabeza?: number;
  ojo?: 'abierto' | 'cerrado';
  /** Marca de beso sobre la boca (0..1). */
  beso?: number;
  /** Pantalones: 0 puestos, 0..1 bajando, 2 sin pantalones. */
  bajada?: number;
  sonrojo?: number;
};

const PIEL = {el: '#e3a983', ella: '#f1c5a3'};
const HOMBRO_Y = -246;
const BRAZO_SUP = 56;
const BRAZO_INF = 52;

const capaPelo = (r: number, a0: number, a1: number, cx: number, cy: number) => {
  const p = (g: number) => `${(r * Math.cos(rad(g))).toFixed(1)},${(-r * Math.sin(rad(g))).toFixed(1)}`;
  return `M${p(a0)} A${r} ${r} 0 0 0 ${p(a1)} Q${cx},${cy} ${p(a0)} Z`;
};

/** Posición en el lienzo de un punto local del personaje. */
export const puntoLocal = (
  x: number,
  y: number,
  s: number,
  mira: number,
  lx: number,
  ly: number,
  inclina = 0,
): [number, number] => {
  const c = Math.cos(rad(inclina));
  const sn = Math.sin(rad(inclina));
  const rx = lx * c - ly * sn;
  const ry = lx * sn + ly * c;
  return [x + s * mira * rx, y + s * ry];
};

/** Posición en el lienzo de la mano de un brazo. */
export const puntoMano = (
  x: number,
  y: number,
  s: number,
  mira: number,
  brazo: [number, number],
  inclina = 0,
): [number, number] => {
  const [a1, a2] = brazo;
  const lx = Math.sin(rad(a1)) * BRAZO_SUP + Math.sin(rad(a1 + a2)) * BRAZO_INF;
  const ly = HOMBRO_Y + Math.cos(rad(a1)) * BRAZO_SUP + Math.cos(rad(a1 + a2)) * BRAZO_INF;
  return puntoLocal(x, y, s, mira, lx, ly, inclina);
};

/** Ángulos de brazo [hombro, codo] para que la mano delantera llegue al
 * punto (tx, ty) del lienzo. */
export const ikBrazo = (
  x: number,
  y: number,
  s: number,
  mira: number,
  tx: number,
  ty: number,
): [number, number] => {
  const lx = (tx - x) / (s * mira);
  const ly = (ty - y) / s - HOMBRO_Y;
  const d = clamp(Math.hypot(lx, ly), 6, BRAZO_SUP + BRAZO_INF - 0.5);
  const base = Math.atan2(lx, ly);
  const A = Math.acos(clamp((BRAZO_SUP * BRAZO_SUP + d * d - BRAZO_INF * BRAZO_INF) / (2 * BRAZO_SUP * d), -1, 1));
  const B = Math.acos(clamp((BRAZO_SUP * BRAZO_SUP + BRAZO_INF * BRAZO_INF - d * d) / (2 * BRAZO_SUP * BRAZO_INF), -1, 1));
  return [((base - A) * 180) / Math.PI, ((Math.PI - B) * 180) / Math.PI];
};

/** Centro de la cabeza en el lienzo. */
export const puntoCabeza = (x: number, y: number, s: number, mira: number, inclina = 0) =>
  puntoLocal(x, y, s, mira, 4, -304, inclina);

export const Persona: React.FC<{
  tipo: 'el' | 'ella';
  x: number;
  y: number;
  s?: number;
  /** 1 mira a la derecha, -1 a la izquierda (valores intermedios = giro). */
  mira?: number;
  pose?: Pose;
  /** Objeto en la mano delantera (coordenadas locales de la mano). */
  enMano?: React.ReactNode;
  /** Objeto en la mano trasera. */
  enManoTras?: React.ReactNode;
  opacity?: number;
}> = ({tipo, x, y, s = 1, mira = 1, pose = {}, enMano, enManoTras, opacity = 1}) => {
  const {
    bd = [8, 6],
    bt = [-8, 6],
    paso = 0,
    zancada = 0,
    pt,
    inclina = 0,
    cabeza = 0,
    ojo = 'abierto',
    beso = 0,
    bajada = 0,
    sonrojo,
  } = pose;
  const el = tipo === 'el';
  const piel = PIEL[tipo];
  const grosor = el ? 22 : 17;
  const th = Math.sin(paso) * zancada;
  const mx = Math.abs(mira) < 0.05 ? 0.05 * (mira < 0 ? -1 : 1) : mira;

  const pierna = (ang: number, lado: number, key: string) => {
    const hx = lado * 11;
    const hy = -138;
    const largo = 126;
    const fx = hx + Math.sin(rad(ang)) * largo;
    const fy = hy + Math.cos(rad(ang)) * largo;
    if (el) {
      const conPantalon = bajada < 1.5;
      const b = clamp(bajada);
      const tx = lerp(hx, fx, b * 0.82);
      const ty = lerp(hy, fy, b * 0.82);
      return (
        <g key={key}>
          {bajada > 0 ? (
            <line x1={hx} y1={hy} x2={fx} y2={fy} stroke={piel} strokeWidth={22} strokeLinecap="round" />
          ) : null}
          {conPantalon ? (
            <line x1={tx} y1={ty} x2={fx} y2={fy} stroke={C.marino} strokeWidth={lerp(30, 38, b)} strokeLinecap="round" />
          ) : null}
          <ellipse cx={fx + 9} cy={fy - 2} rx={25} ry={12} fill="#15171f" />
        </g>
      );
    }
    return (
      <g key={key}>
        <line x1={hx} y1={hy} x2={fx} y2={fy} stroke={piel} strokeWidth={17} strokeLinecap="round" />
        <ellipse cx={fx + 7} cy={fy} rx={20} ry={10} fill={C.rojoOsc} />
      </g>
    );
  };

  const brazo = (ang: [number, number], extra: React.ReactNode, key: string, oscuro: boolean) => {
    const [a1, a2] = ang;
    const ex = Math.sin(rad(a1)) * BRAZO_SUP;
    const ey = HOMBRO_Y + Math.cos(rad(a1)) * BRAZO_SUP;
    const hx = ex + Math.sin(rad(a1 + a2)) * BRAZO_INF;
    const hy = ey + Math.cos(rad(a1 + a2)) * BRAZO_INF;
    const manga = el ? (oscuro ? '#dccfb4' : '#f4ead5') : piel;
    const pielB = oscuro ? (el ? '#cf9670' : '#dfb190') : piel;
    return (
      <g key={key}>
        <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={pielB} strokeWidth={grosor - 3} strokeLinecap="round" />
        <line x1={0} y1={HOMBRO_Y} x2={ex} y2={ey} stroke={manga} strokeWidth={grosor} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={grosor * 0.6} fill={pielB} />
        {extra ? <g transform={`translate(${hx.toFixed(1)} ${hy.toFixed(1)})`}>{extra}</g> : null}
      </g>
    );
  };

  const rubor = sonrojo ?? (el ? 0.25 : 0.6);

  return (
    <g
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s * mx).toFixed(3)} ${s.toFixed(3)}) rotate(${inclina.toFixed(2)})`}
      opacity={opacity}
    >
      {/* Melena de ella, por detrás */}
      {!el ? (
        <path
          d="M-30,-338 C-78,-322 -76,-232 -56,-166 Q-36,-154 -18,-172 C-28,-220 -22,-262 -2,-278 Z"
          fill="#3a1c14"
        />
      ) : null}
      {brazo(bt, enManoTras, 'bt', true)}
      {pierna(pt ?? -th, -1, 'pt')}
      {pierna(th, 1, 'pd')}
      {/* Calzoncillos (solo se ven al bajarse los pantalones) */}
      {el && bajada > 0 ? (
        <g>
          <path d="M-37,-180 L37,-180 L40,-98 L5,-98 L0,-124 L-5,-98 L-40,-98 Z" fill="#fff" />
          <path d={CORAZON} fill={C.rojo} transform="translate(-19 -152) scale(0.14)" />
          <path d={CORAZON} fill={C.rojo} transform="translate(18 -160) scale(0.14)" />
          <path d={CORAZON} fill={C.rojo} transform="translate(21 -124) scale(0.14)" />
          <path d={CORAZON} fill={C.rojo} transform="translate(-22 -120) scale(0.14)" />
        </g>
      ) : null}
      {/* Torso */}
      {el ? (
        <g>
          <path d="M-37,-136 L-40,-238 Q-40,-266 -14,-266 L14,-266 Q40,-266 40,-238 L37,-136 Z" fill="#f4ead5" />
          {[-248, -228, -208, -188, -168, -148].map((yy) => (
            <line key={yy} x1={-38} y1={yy} x2={38} y2={yy} stroke={C.marino} strokeWidth={8} />
          ))}
          <path d="M-12,-268 L22,-262 L10,-244 Z" fill={C.rojo} />
        </g>
      ) : (
        <g>
          <path d="M-33,-262 Q0,-272 33,-262 L26,-196 L68,-64 Q0,-46 -68,-64 L-26,-196 Z" fill={C.rojo} />
          <path d="M-26,-196 L26,-196 L29,-186 L-29,-186 Z" fill={C.rojoOsc} />
        </g>
      )}
      <rect x={-9} y={-284} width={18} height={26} fill={piel} />
      {/* Cabeza */}
      <g transform={`translate(4 -304) rotate(${cabeza.toFixed(2)})`}>
        <circle cx={0} cy={0} r={40} fill={piel} />
        <circle cx={39} cy={4} r={6.5} fill={piel} />
        {el ? (
          <>
            <path d={capaPelo(42, 36, 205, -4, -10)} fill={C.pelo} />
            <circle cx={24} cy={-33} r={13} fill={C.pelo} />
          </>
        ) : (
          <>
            <path d={capaPelo(43, 26, 228, -8, -2)} fill="#3a1c14" />
            <circle cx={-24} cy={-26} r={10} fill={C.crema} />
            <circle cx={-24} cy={-26} r={4} fill={C.oro} />
          </>
        )}
        <circle cx={14} cy={14} r={9} fill="#ff6b81" opacity={0.5 * rubor} />
        {ojo === 'abierto' ? (
          <circle cx={18} cy={-5} r={4.4} fill="#1b1414" />
        ) : (
          <path d="M11,-5 q7,6 14,0" stroke="#1b1414" strokeWidth={3.2} fill="none" strokeLinecap="round" />
        )}
        {beso > 0 ? (
          <Labios x={27} y={17} s={0.36 * beso} rot={-10} />
        ) : (
          <path d="M22,18 q7,5 13,-1" stroke="#7a2e2e" strokeWidth={3} fill="none" strokeLinecap="round" />
        )}
      </g>
      {brazo(bd, enMano, 'bd', false)}
    </g>
  );
};

/** Pareja que se acerca y se besa. k: 0 separados, 1 beso. */
export const Pareja: React.FC<{
  x: number;
  y: number;
  s?: number;
  k: number;
  t: number;
  sep?: number;
  /** Él a la izquierda (por defecto ella a la izquierda). */
  invertir?: boolean;
  bajada?: number;
  andando?: boolean;
}> = ({x, y, s = 1, k, t, sep = 520, invertir = false, bajada = 0, andando = true}) => {
  const kk = eio(clamp(k));
  const d = lerp(sep, 188, kk) * s;
  const lado = invertir ? -1 : 1;
  const camina = andando && k > 0.001 && k < 0.8;
  const paso = camina ? t * 9 : 0;
  const zanc = camina ? 22 * Math.sin(Math.PI * clamp(k / 0.8)) + 4 : 0;
  const beso = u(k, 0.75, 1);
  const lat = Math.sin(t * 2.2) * 1.2 * beso;
  return (
    <g>
      <Persona
        tipo="ella"
        x={x - (lado * d) / 2}
        y={y}
        s={s}
        mira={lado}
        pose={{
          bd: lerp2([12, 8], [108, 38], beso),
          bt: lerp2([-10, 6], [88, 24], beso),
          paso,
          zancada: zanc,
          pt: beso > 0 ? -30 * eo(beso) : undefined,
          inclina: 9 * kk + lat,
          cabeza: -8 * beso,
          ojo: beso > 0.5 ? 'cerrado' : 'abierto',
          sonrojo: 0.6 + 0.4 * beso,
        }}
      />
      <Persona
        tipo="el"
        x={x + (lado * d) / 2}
        y={y}
        s={s}
        mira={-lado}
        pose={{
          bd: lerp2([10, 6], [72, 28], beso),
          bt: lerp2([-8, 6], [96, 30], beso),
          paso: paso + Math.PI,
          zancada: zanc,
          inclina: 9 * kk - lat,
          cabeza: 5 * beso,
          ojo: beso > 0.5 ? 'cerrado' : 'abierto',
          sonrojo: 0.25 + 0.6 * beso,
          bajada,
        }}
      />
    </g>
  );
};

// ── Objetos ─────────────────────────────────────────────────────────────
/** Velero. Origen: centro de la línea de flotación. `children` = tripulación. */
export const Barco: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  t: number;
  children?: React.ReactNode;
  velas?: boolean;
}> = ({x, y, s = 1, rot = 0, t, children, velas = true}) => {
  const onda = Math.sin(t * 5) * 6;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${s})`}>
      <rect x={-6} y={-340} width={12} height={335} fill={C.maderaOsc} />
      {velas ? (
        <>
          <path d="M12,-325 L12,-48 L168,-48 Q120,-190 12,-325 Z" fill="#fff6e3" />
          <path d="M12,-232 L100,-232 M12,-140 L146,-140" stroke="#e9d9b8" strokeWidth={4} />
          <path d="M-12,-300 L-12,-56 L-128,-56 Q-88,-190 -12,-300 Z" fill="#f3dfb5" />
        </>
      ) : (
        <path d="M6,-320 L20,-320 L20,-60 L6,-60 Z" fill="#f3dfb5" />
      )}
      <path d={`M6,-340 L${56 + onda},-326 L6,-312 Z`} fill={C.rojo} />
      {children}
      <path d="M-172,-22 L176,-22 Q160,44 100,52 L-104,52 Q-152,44 -172,-22 Z" fill="#b3263a" />
      <path d="M-172,-22 L176,-22 L172,-6 L-168,-6 Z" fill={C.crema} />
      <path d="M-150,18 L160,18" stroke="#8f1c2c" strokeWidth={5} />
      <circle cx={-96} cy={6} r={7} fill={C.crema} />
      <circle cx={-66} cy={6} r={7} fill={C.crema} />
    </g>
  );
};

export const Gaviota: React.FC<{x: number; y: number; s?: number; t: number; fase?: number; color?: string}> = ({
  x,
  y,
  s = 1,
  t,
  fase = 0,
  color = '#fff',
}) => {
  const a = Math.sin(t * 7 + fase) * 14;
  return (
    <path
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}
      d={`M-30,${-a} Q-14,${-14 - a * 0.3} 0,0 Q14,${-14 - a * 0.3} 30,${-a}`}
      stroke={color}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
  );
};

/** Casa encalada con tejado de teja. (x, y) = esquina inferior izquierda. */
export const Casa: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  pared?: string;
  tejado?: string;
  luz?: string;
  ventanas?: [number, number][];
  alero?: number;
}> = ({x, y, w, h, pared = '#e8ecf7', tejado = C.teja, luz = '#ffd27a', ventanas = [], alero = 14}) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill={pared} />
    <path
      d={`M${x - alero},${y - h} L${x + w + alero},${y - h} L${x + w + alero - 8},${y - h - 26} L${x - alero + 8},${y - h - 26} Z`}
      fill={tejado}
    />
    <path d={`M${x - alero},${y - h} L${x + w + alero},${y - h}`} stroke="#0003" strokeWidth={5} />
    {ventanas.map(([vx, vy], i) => (
      <g key={i}>
        <rect x={x + vx} y={y - h + vy} width={44} height={60} rx={4} fill={luz} />
        <path d={`M${x + vx + 22},${y - h + vy} v60 M${x + vx},${y - h + vy + 30} h44`} stroke="#0004" strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** Árbol frutal. Origen: base del tronco. */
export const Arbol: React.FC<{
  x: number;
  y: number;
  s?: number;
  t: number;
  frutos?: [number, number][];
  fruto?: 'labios' | 'manzana' | 'ninguno';
  ocultos?: number[];
  tono?: 'dia' | 'noche';
}> = ({x, y, s = 1, t, frutos = [], fruto = 'labios', ocultos = [], tono = 'dia'}) => {
  const copa = tono === 'dia' ? [C.hojaOsc, C.hoja, C.hojaClara] : ['#173d36', '#1f5347', '#2a6b58'];
  const bal = Math.sin(t * 1.4 + x) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22,0 Q-14,-110 -26,-210 L26,-210 Q14,-110 24,0 Z" fill={tono === 'dia' ? '#7a4a2f' : '#3e2a25'} />
      <g transform={`rotate(${bal.toFixed(2)} 0 -210)`}>
        <circle cx={-90} cy={-270} r={96} fill={copa[0]} />
        <circle cx={96} cy={-262} r={104} fill={copa[0]} />
        <circle cx={0} cy={-330} r={128} fill={copa[1]} />
        <circle cx={-64} cy={-380} r={78} fill={copa[2]} />
        <circle cx={70} cy={-392} r={70} fill={copa[2]} />
        {frutos.map(([fx, fy], i) =>
          ocultos.includes(i) ? null : fruto === 'labios' ? (
            <Labios key={i} x={fx} y={fy} s={0.55} rot={Math.sin(t * 2 + i) * 8} />
          ) : fruto === 'manzana' ? (
            <Manzana key={i} x={fx} y={fy} s={1} rot={Math.sin(t * 2 + i) * 6} />
          ) : null,
        )}
      </g>
    </g>
  );
};

export const Manzana: React.FC<{x?: number; y?: number; s?: number; rot?: number}> = ({x = 0, y = 0, s = 1, rot = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})`}>
    <path d="M0,-22 q4,-14 14,-18" stroke="#5a3a22" strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M10,-34 q14,-8 22,2 q-12,8 -22,-2 Z" fill={C.hojaClara} />
    <path d="M0,-20 C-14,-30 -32,-18 -30,4 C-28,24 -12,32 0,26 C12,32 28,24 30,4 C32,-18 14,-30 0,-20 Z" fill="#d62839" />
    <ellipse cx={-14} cy={-6} rx={6} ry={10} fill="#fff" opacity={0.3} transform="rotate(20 -14 -6)" />
  </g>
);

/** Flor de cinco pétalos. */
export const Flor: React.FC<{x: number; y: number; s?: number; color?: string; rot?: number; tallo?: number}> = ({
  x,
  y,
  s = 1,
  color = '#ff8fa3',
  rot = 0,
  tallo = 0,
}) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`}>
      {tallo > 0 ? <path d={`M0,0 Q10,${tallo / 2} 0,${tallo}`} stroke={C.hoja} strokeWidth={6} fill="none" /> : null}
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos(rad(a - 90)) * 17} cy={Math.sin(rad(a - 90)) * 17} r={13} fill={color} />
      ))}
      <circle cx={0} cy={0} r={9} fill={C.oro} />
    </g>
  );

/** Perro. Origen: entre las patas, sobre el suelo. Mira a la derecha. */
export const Perro: React.FC<{
  x: number;
  y: number;
  s?: number;
  mira?: number;
  t: number;
  /** 0..1: boca abierta al ladrar. */
  ladra?: number;
  /** Cabeza levantada en grados. */
  alza?: number;
  enBoca?: React.ReactNode;
  corre?: boolean;
}> = ({x, y, s = 1, mira = 1, t, ladra = 0, alza = 0, enBoca, corre = false}) => {
  const cola = Math.sin(t * 16) * 22;
  const pata = corre ? Math.sin(t * 22) * 26 : 0;
  const bote = ladra * -8;
  const pelo = '#c98b4b';
  const osc = '#8a5a2b';
  return (
    <g transform={`translate(${x.toFixed(1)} ${(y + bote).toFixed(1)}) scale(${(s * mira).toFixed(3)} ${s})`}>
      <path d="M-58,-74 q-26,-30 -18,-58" stroke={pelo} strokeWidth={13} fill="none" strokeLinecap="round" transform={`rotate(${cola.toFixed(1)} -58 -74)`} />
      {[-42, -22, 30, 50].map((px, i) => (
        <rect
          key={i}
          x={px - 8}
          y={-40}
          width={17}
          height={42}
          rx={8}
          fill={i % 2 ? pelo : osc}
          transform={`rotate(${(i % 2 ? pata : -pata).toFixed(1)} ${px} -40)`}
        />
      ))}
      <rect x={-66} y={-92} width={132} height={58} rx={28} fill={pelo} />
      <g transform={`rotate(${(-alza - ladra * 8).toFixed(1)} 50 -84)`}>
        <rect x={34} y={-100} width={36} height={34} rx={12} fill={pelo} />
        <path d="M40,-78 L92,-78 L92,-70" stroke={C.rojo} strokeWidth={9} fill="none" />
        <circle cx={76} cy={-112} r={31} fill={pelo} />
        {/* mandíbula */}
        <g transform={`rotate(${(ladra * 26).toFixed(1)} 84 -98)`}>
          <rect x={84} y={-100} width={46} height={13} rx={6} fill={osc} />
          {enBoca}
        </g>
        <rect x={84} y={-122} width={54} height={24} rx={11} fill={pelo} />
        <circle cx={137} cy={-116} r={8} fill="#1b1414" />
        <circle cx={90} cy={-122} r={4.5} fill="#1b1414" />
        <ellipse cx={58} cy={-112} rx={13} ry={27} fill={osc} transform={`rotate(${(18 + ladra * 14).toFixed(1)} 58 -134)`} />
      </g>
    </g>
  );
};

/** Rótulo de neón sin letras: una copa. */
export const NeonCopa: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle r={92} fill="#ff5d8f" fillOpacity={0.1} stroke="#ff5d8f" strokeWidth={7} />
    <path d="M-48,-46 L48,-46 L0,8 Z M0,8 V52 M-28,52 H28" stroke="#ff5d8f" strokeWidth={9} />
    <path d="M-48,-46 L48,-46 L0,8 Z M0,8 V52 M-28,52 H28" stroke="#ffd6e2" strokeWidth={3} />
    <circle cx={14} cy={-26} r={8} stroke="#7ae582" strokeWidth={5} />
    <path d="M20,-34 L40,-62" stroke="#7ae582" strokeWidth={4} />
  </g>
);

/** Alianza de oro con brillante. */
export const Anillo: React.FC<{x: number; y: number; r?: number; rot?: number; aplasta?: number}> = ({x, y, r = 46, rot = 0, aplasta = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1 ${(1 - aplasta * 0.75).toFixed(3)}) rotate(${rot.toFixed(1)})`}>
    <circle cx={0} cy={0} r={r} fill="none" stroke={C.oro} strokeWidth={15} />
    <circle cx={0} cy={0} r={r + 5} fill="none" stroke="#fff3c4" strokeWidth={3} opacity={0.7} />
    <path d={`M-16,${-r - 8} L0,${-r - 36} L16,${-r - 8} L0,${-r + 6} Z`} fill="#bfe9ff" />
    <path d={`M-16,${-r - 8} L16,${-r - 8} M0,${-r - 36} L0,${-r + 6}`} stroke="#fff" strokeWidth={2.5} opacity={0.8} />
  </g>
);

/** Destello de cuatro puntas. */
export const Destello: React.FC<{x: number; y: number; s?: number; color?: string; opacity?: number; rot?: number}> = ({
  x,
  y,
  s = 1,
  color = '#fff8d6',
  opacity = 1,
  rot = 0,
}) =>
  s <= 0.001 ? null : (
    <path
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`}
      d="M0,-40 Q6,-6 40,0 Q6,6 0,40 Q-6,6 -40,0 Q-6,-6 0,-40 Z"
      fill={color}
      opacity={opacity}
    />
  );

// ── Canvas and scene type / Lienzo y tipo de escena ─────────────────────
/** Full-frame SVG canvas (1080x1920) that every scene draws into. */
export const Lienzo: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {children}
  </svg>
);

/** A scene receives `t`, the current song time in seconds. */
export type Escena = React.FC<{t: number}>;
