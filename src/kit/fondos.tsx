// Settings / Escenarios (lienzo 1080x1920): puerto, huerto, tejados, fachada
// con balcón, bar, infierno y tapia.
import React from 'react';
import {
  Arbol,
  C,
  Casa,
  NeonCopa,
  Cielo,
  Estrellas,
  Luna,
  Mar,
  clamp,
  lerp,
  ola,
  rad,
  rnd,
} from './kit';

export type Paleta = {
  cielo: [number, string][];
  mar: [string, string, string];
  monte: string;
  casa: string;
  luz: string;
  astro: string;
  estrellas: number;
};

export const PAL: Record<'noche' | 'ocaso' | 'alba', Paleta> = {
  noche: {
    cielo: [[0, '#060a22'], [0.55, '#1a2259'], [1, '#40408a']],
    mar: ['#1b4a86', '#143a70', '#0c2855'],
    monte: '#0f1740',
    casa: '#b9c3e6',
    luz: '#ffd27a',
    astro: '#ffeebd',
    estrellas: 1,
  },
  ocaso: {
    cielo: [[0, '#2a1650'], [0.45, '#a23b72'], [0.8, '#ff7f51'], [1, '#ffc971']],
    mar: ['#3a6ea5', '#2b578c', '#1c3f70'],
    monte: '#3b1f5c',
    casa: '#f6d7c3',
    luz: '#fff0b3',
    astro: '#ffe0a3',
    estrellas: 0.35,
  },
  alba: {
    cielo: [[0, '#3d348b'], [0.5, '#e56b6f'], [0.85, '#ffb88c'], [1, '#ffe3b0']],
    mar: ['#5b8fb9', '#4578a3', '#2f5f8a'],
    monte: '#5a3d7a',
    casa: '#ffe9dc',
    luz: '#fff6cc',
    astro: '#fff3c4',
    estrellas: 0.15,
  },
};

/** Altura del tablero del muelle (donde pisan los personajes). */
export const MUELLE_Y = 985;

export const Muelle: React.FC<{hasta: number; noray?: boolean}> = ({hasta, noray = true}) => (
  <g>
    {Array.from({length: Math.ceil(hasta / 150) + 1}).map((_, i) => {
      const px = hasta - 30 - i * 150;
      return px > -40 ? <rect key={i} x={px} y={1000} width={22} height={190} fill={C.maderaOsc} /> : null;
    })}
    <rect x={-20} y={MUELLE_Y} width={hasta + 20} height={28} fill={C.madera} />
    <rect x={-20} y={MUELLE_Y} width={hasta + 20} height={7} fill="#a8744e" />
    {Array.from({length: Math.ceil(hasta / 64)}).map((_, i) => (
      <rect key={i} x={i * 64 + 30} y={MUELLE_Y + 7} width={3} height={21} fill={C.maderaOsc} opacity={0.6} />
    ))}
    {noray ? (
      <g transform={`translate(${hasta - 52} ${MUELLE_Y})`}>
        <rect x={-13} y={-40} width={26} height={40} fill="#2b2d42" />
        <rect x={-20} y={-50} width={40} height={14} rx={6} fill="#3d405b" />
      </g>
    ) : null}
  </g>
);

export const FondoPuerto: React.FC<{
  t: number;
  id: string;
  pal: Paleta;
  cielo?: [number, string][];
  astro?: {x: number; y: number; r: number; color?: string} | null;
  /** x donde acaba el muelle (0 = sin muelle). */
  muelle?: number;
  barco?: React.ReactNode;
  faro?: boolean;
  estrellas?: number;
  detrasDelMar?: React.ReactNode;
}> = ({t, id, pal, cielo, astro = {x: 800, y: 470, r: 96}, muelle = 640, barco, faro = true, estrellas, detrasDelMar}) => {
  const haz = 0.25 + 0.75 * clamp(Math.sin(t * 2.2));
  return (
    <g>
      <Cielo id={id} stops={cielo ?? pal.cielo} alto={1010} />
      <Estrellas t={t} opacity={estrellas ?? pal.estrellas} maxY={860} />
      {astro ? <Luna x={astro.x} y={astro.y} r={astro.r} color={astro.color ?? pal.astro} crateres={pal.estrellas === 1} /> : null}
      {detrasDelMar}
      {/* Monte con pueblo */}
      <path d="M-20,1010 L-20,880 Q120,790 300,880 Q390,930 480,1010 Z" fill={pal.monte} />
      <Casa x={30} y={930} w={70} h={62} pared={pal.casa} ventanas={[]} luz={pal.luz} alero={6} />
      <Casa x={96} y={900} w={84} h={78} pared={pal.casa} luz={pal.luz} alero={6} ventanas={[[20, 14]]} />
      <Casa x={186} y={920} w={64} h={58} pared={pal.casa} luz={pal.luz} alero={6} />
      <Casa x={254} y={945} w={76} h={60} pared={pal.casa} luz={pal.luz} alero={6} ventanas={[[16, 6]]} />
      <rect x={128} y={770} width={22} height={56} fill={pal.casa} />
      <path d="M122,770 L156,770 L139,738 Z" fill={C.teja} />
      {faro ? (
        <g>
          <path d="M930,1010 Q1000,930 1100,950 L1100,1010 Z" fill={pal.monte} />
          <circle cx={1011} cy={790} r={34} fill="#fff6c9" opacity={0.25 * haz} />
          <path d="M992,950 L1000,800 L1022,800 L1030,950 Z" fill="#f5efe2" />
          <path d="M995,900 L1027,900 L1029,930 L993,930 Z M999,830 L1023,830 L1025,860 L997,860 Z" fill={C.rojo} />
          <rect x={996} y={778} width={30} height={24} fill="#2b2d42" />
          <circle cx={1011} cy={790} r={8} fill="#fff6c9" opacity={haz} />
          <path d="M992,778 L1030,778 L1011,758 Z" fill={C.rojo} />
        </g>
      ) : null}
      <Mar y={1000} t={t} colores={pal.mar}>
        {barco}
        {muelle > 0 ? <Muelle hasta={muelle} noray={muelle < 1000} /> : null}
      </Mar>
    </g>
  );
};

/** Huerto soleado. El suelo queda en y = 985. */
export const FondoHuerto: React.FC<{t: number; id: string}> = ({t, id}) => (
  <g>
    <Cielo id={id} stops={[[0, '#ff9f5a'], [0.55, '#ffcf8f'], [1, '#fff0cf']]} alto={1000} />
    <Luna x={850} y={420} r={84} color="#fff6cf" crateres={false} />
    {[0, 1, 2].map((i) => {
      const cx = ((i * 420 + t * 14) % 1400) - 160;
      return (
        <g key={i} fill="#fff" opacity={0.55}>
          <ellipse cx={cx} cy={360 + i * 90} rx={92} ry={26} />
          <ellipse cx={cx + 60} cy={346 + i * 90} rx={62} ry={24} />
        </g>
      );
    })}
    <path d="M-20,1010 L-20,900 Q200,800 470,880 Q760,960 1100,850 L1100,1010 Z" fill="#a9cf86" />
    <path d="M-20,1010 L-20,950 Q300,880 600,940 Q860,990 1100,930 L1100,1010 Z" fill="#74b56c" />
    <rect x={0} y={985} width={1080} height={940} fill="#3f9160" />
    <path d={ola(985, 6, 240, 0.4)} fill="#3f9160" />
    {Array.from({length: 26}).map((_, i) => (
      <path
        key={i}
        d={`M${rnd(i, 21) * 1080},${1000 + rnd(i, 22) * 110} q6,-22 0,-34 m6,34 q10,-18 14,-26`}
        stroke="#2f7550"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    ))}
  </g>
);

export const TEJADOS = [
  {x0: -40, x1: 372, y: 980},
  {x0: 372, x1: 716, y: 880},
  {x0: 716, x1: 1120, y: 770},
];

const Gato: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#11142e">
    <ellipse cx={0} cy={-22} rx={22} ry={24} />
    <circle cx={2} cy={-58} r={16} />
    <path d="M-10,-68 L-6,-84 L2,-70 Z M6,-70 L14,-84 L16,-66 Z" />
    <path
      d={`M-18,-6 q-30,4 -26,-${30 + Math.sin(t * 2) * 8}`}
      stroke="#11142e"
      strokeWidth={8}
      fill="none"
      strokeLinecap="round"
    />
    <circle cx={-3} cy={-60} r={2.4} fill="#ffe27a" />
    <circle cx={8} cy={-60} r={2.4} fill="#ffe27a" />
  </g>
);

/** Pueblo de noche visto desde los tejados (ver TEJADOS). */
export const FondoTejados: React.FC<{t: number; id: string; luna?: {x: number; y: number; r: number}}> = ({
  t,
  id,
  luna = {x: 300, y: 500, r: 120},
}) => {
  const pared = ['#9aa7d6', '#aab6e0', '#8f9ccc'];
  return (
    <g>
      <Cielo id={id} stops={[[0, '#060a22'], [0.6, '#1c2460'], [1, '#3d3f8c']]} alto={1100} />
      <Estrellas t={t} maxY={900} />
      <Luna x={luna.x} y={luna.y} r={luna.r} />
      {/* Siluetas lejanas */}
      <path
        d="M-20,1100 L-20,820 L90,820 L90,760 L200,760 L200,840 L330,840 L330,700 L360,660 L390,700 L390,790 L520,790 L520,720 L640,720 L640,640 L760,640 L760,560 L800,520 L840,560 L840,620 L980,620 L980,560 L1100,560 L1100,1100 Z"
        fill="#131a4a"
      />
      {[[110, 790], [420, 820], [560, 750], [680, 670], [1010, 600]].map(([wx, wy], i) => (
        <rect key={i} x={wx} y={wy} width={22} height={30} fill="#ffd27a" opacity={0.55 + 0.3 * Math.sin(t * 1.5 + i)} />
      ))}
      {TEJADOS.map((r, i) => (
        <g key={i}>
          <rect x={r.x0} y={r.y} width={r.x1 - r.x0} height={1000} fill={pared[i]} />
          <rect x={r.x0 - 16} y={r.y} width={r.x1 - r.x0 + 32} height={36} fill={C.teja} />
          {Array.from({length: Math.ceil((r.x1 - r.x0 + 32) / 34)}).map((_, j) => (
            <path
              key={j}
              d={`M${r.x0 - 16 + j * 34},${r.y + 36} q17,16 34,0`}
              fill={C.tejaOsc}
            />
          ))}
          <rect x={r.x0 - 16} y={r.y} width={r.x1 - r.x0 + 32} height={8} fill="#e07a5f" />
          {[0, 1].map((j) => {
            const wx = r.x0 + 70 + j * 150;
            return (
              <g key={j}>
                <rect x={wx} y={r.y + 110} width={64} height={86} rx={6} fill={(i + j) % 2 ? '#ffd27a' : '#2c356e'} />
                <path d={`M${wx + 32},${r.y + 110} v86 M${wx},${r.y + 153} h64`} stroke="#0004" strokeWidth={5} />
              </g>
            );
          })}
        </g>
      ))}
      {/* Chimenea con gato */}
      <rect x={596} y={806} width={56} height={74} fill="#8f9ccc" />
      <rect x={588} y={798} width={72} height={14} fill={C.tejaOsc} />
      <Gato x={624} y={798} t={t} />
      {/* Antena */}
      <path d="M150,980 v-120 M120,870 h60 M130,890 h40" stroke="#11142e" strokeWidth={5} />
    </g>
  );
};

export const BALCON_Y = 815;
/** Extremo superior de la escalera apoyada en el balcón. */
export const ESCALERA_Y = BALCON_Y - 46;
/** Encuadre de las escenas del balcón: acerca la cámara anclada a la calle. */
export const ZOOM_BALCON = 'translate(540 1065) scale(1.2) translate(-540 -1065)';
export const CALLE_Y = 1065;

const Reloj: React.FC<{x: number; y: number; r: number; hora: number; minuto: number}> = ({x, y, r, hora, minuto}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 12} fill="#1b1f3f" />
    <circle r={r} fill={C.crema} />
    {Array.from({length: 12}).map((_, i) => (
      <line
        key={i}
        x1={Math.sin(rad(i * 30)) * r * 0.78}
        y1={-Math.cos(rad(i * 30)) * r * 0.78}
        x2={Math.sin(rad(i * 30)) * r * 0.92}
        y2={-Math.cos(rad(i * 30)) * r * 0.92}
        stroke="#1b1f3f"
        strokeWidth={i % 3 === 0 ? r * 0.07 : r * 0.035}
        strokeLinecap="round"
      />
    ))}
    <line x1={0} y1={0} x2={Math.sin(rad(hora)) * r * 0.48} y2={-Math.cos(rad(hora)) * r * 0.48} stroke="#1b1f3f" strokeWidth={r * 0.09} strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.sin(rad(minuto)) * r * 0.74} y2={-Math.cos(rad(minuto)) * r * 0.74} stroke={C.rojo} strokeWidth={r * 0.06} strokeLinecap="round" />
    <circle r={r * 0.08} fill="#1b1f3f" />
  </g>
);
export {Reloj};

/** Fachada con balcón: capa de fondo (pared, puerta, reloj, escalera, calle). */
export const FachadaFondo: React.FC<{
  t: number;
  id: string;
  pared?: [string, string];
  minuto?: number;
  hora?: number;
  escalera?: boolean;
  /** Luz de la ventana baja, 0..1. */
  ventanaLuz?: number;
}> = ({t, id, pared = ['#56679c', '#34406f'], minuto, hora, escalera = true, ventanaLuz = 0}) => {
  const m = minuto ?? t * 6;
  const h = hora ?? 300 + m / 12;
  return (
    <g>
      <Cielo id={id} stops={[[0, pared[0]], [1, pared[1]]]} alto={1100} />
      {[[80, 380, 150, 26], [700, 330, 210, 22], [120, 900, 120, 22], [820, 930, 170, 24], [60, 620, 90, 20]].map(([bx, by, bw, bh], i) => (
        <rect key={i} x={bx} y={by} width={bw} height={bh} rx={6} fill="#fff" opacity={0.06} />
      ))}
      {/* Puerta del balcón, con luz */}
      <defs>
        <linearGradient id={`${id}-luz`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset="1" stopColor="#ff9e4f" />
        </linearGradient>
      </defs>
      <path d={`M410,${BALCON_Y} L410,598 A130,130 0 0 1 670,598 L670,${BALCON_Y} Z`} fill="#1b1f3f" />
      <path d={`M426,${BALCON_Y} L426,600 A114,114 0 0 1 654,600 L654,${BALCON_Y} Z`} fill={`url(#${id}-luz)`} />
      <path d={`M426,${BALCON_Y} L426,600 A114,114 0 0 1 470,518 Q456,678 440,${BALCON_Y} Z`} fill={C.rojoOsc} opacity={0.75} />
      <path d={`M654,${BALCON_Y} L654,600 A114,114 0 0 0 610,518 Q624,678 640,${BALCON_Y} Z`} fill={C.rojoOsc} opacity={0.75} />
      <Reloj x={872} y={570} r={74} hora={h} minuto={m} />
      {/* Ventana baja */}
      <rect x={640} y={900} width={150} height={130} rx={8} fill="#1b1f3f" />
      <rect x={652} y={912} width={126} height={106} fill="#27306b" />
      <rect x={652} y={912} width={126} height={106} fill="#ffd27a" opacity={ventanaLuz} />
      <path d="M715,912 v106 M652,965 h126" stroke="#1b1f3f" strokeWidth={8} />
      <rect x={630} y={1030} width={170} height={14} fill="#1b1f3f" />
      {/* Calle */}
      <rect x={0} y={CALLE_Y} width={1080} height={900} fill="#161a38" />
      <rect x={0} y={CALLE_Y} width={1080} height={10} fill="#2a3160" />
      {escalera ? (
        <g stroke="#c9a06a" strokeLinecap="round">
          <line x1={128} y1={CALLE_Y} x2={292} y2={ESCALERA_Y} strokeWidth={11} />
          <line x1={186} y1={CALLE_Y} x2={350} y2={ESCALERA_Y} strokeWidth={11} />
          {Array.from({length: 7}).map((_, i) => {
            const k = (i + 0.6) / 7.6;
            return (
              <line
                key={i}
                x1={lerp(128, 292, k)}
                y1={lerp(CALLE_Y, ESCALERA_Y, k)}
                x2={lerp(186, 350, k)}
                y2={lerp(CALLE_Y, ESCALERA_Y, k)}
                strokeWidth={8}
              />
            );
          })}
        </g>
      ) : null}
    </g>
  );
};

/** Fachada: capa de delante (losa, barandilla y macetas). */
export const FachadaFrente: React.FC<{t: number}> = ({t}) => {
  const B = BALCON_Y;
  return (
    <g>
      <rect x={286} y={B} width={508} height={26} rx={4} fill="#1b1f3f" />
      <path d={`M300,${B + 26} q20,40 60,44 M780,${B + 26} q-20,40 -60,44`} stroke="#1b1f3f" strokeWidth={10} fill="none" />
      <rect x={292} y={B - 94} width={496} height={10} rx={5} fill="#1b1f3f" />
      {Array.from({length: 18}).map((_, i) => (
        <line key={i} x1={300 + i * 28.2} y1={B - 88} x2={300 + i * 28.2} y2={B} stroke="#1b1f3f" strokeWidth={5} />
      ))}
      {[330, 752].map((mx, i) => (
        <g key={i}>
          <path d={`M${mx - 30},${B - 70} L${mx + 30},${B - 70} L${mx + 22},${B - 22} L${mx - 22},${B - 22} Z`} fill={C.teja} />
          {[-22, 0, 22, -10, 12].map((dx, j) => (
            <circle
              key={j}
              cx={mx + dx}
              cy={B - 80 - (j > 2 ? 22 : 4) + Math.sin(t * 2 + j + i) * 2}
              r={14}
              fill={j % 2 ? '#ff4d6d' : C.rojo}
            />
          ))}
          <path d={`M${mx - 26},${B - 68} q-10,20 -4,40 M${mx + 26},${B - 68} q12,16 6,36`} stroke={C.hojaClara} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

/** Interior de taberna. Barra con tablero en y = 760; suelo en y = 985. */
export const FondoBar: React.FC<{t: number; id: string; children?: React.ReactNode}> = ({t, id, children}) => {
  const neon = 0.75 + 0.25 * Math.sin(t * 9) * (Math.sin(t * 2.3) > 0.6 ? 1 : 0.2);
  return (
    <g>
      <Cielo id={id} stops={[[0, '#2a1422'], [1, '#4a2434']]} alto={1000} />
      {Array.from({length: 9}).map((_, i) => (
        <rect key={i} x={i * 128 - 20} y={0} width={5} height={985} fill="#000" opacity={0.1} />
      ))}
      {/* Rótulo de neón, sin letras */}
      <NeonCopa x={230} y={450} s={0.95} opacity={neon} />
      {/* Lámpara */}
      <path d="M560,0 V330" stroke="#1a0c14" strokeWidth={6} />
      <path d="M560,360 L380,985 L740,985 Z" fill="#ffd27a" opacity={0.1} />
      <path d="M500,372 Q560,290 620,372 Z" fill="#e07a5f" />
      <circle cx={560} cy={378} r={16} fill="#fff1b8" />
      {/* Suelo */}
      <rect x={0} y={985} width={1080} height={940} fill="#1d0f18" />
      {children}
      {/* Barra */}
      <rect x={430} y={760} width={700} height={240} fill="#6b3f29" />
      {Array.from({length: 5}).map((_, i) => (
        <rect key={i} x={470 + i * 130} y={800} width={96} height={170} rx={6} fill="#5a3321" />
      ))}
      <rect x={410} y={742} width={720} height={26} rx={6} fill="#9a6239" />
      <rect x={410} y={742} width={720} height={7} rx={3} fill="#b97a4b" />
    </g>
  );
};

/** Lenguas de fuego: cresta puntiaguda cerrada hasta el fondo. */
export const llamas = (y: number, amp: number, lon: number, fase: number) => {
  let d = `M -60 1930 L -60 ${y}`;
  for (let x = -60; x <= 1140; x += 12) {
    const a = Math.abs(Math.sin((x / lon) * Math.PI + fase));
    const b = Math.abs(Math.sin((x / (lon * 0.37)) * Math.PI - fase * 1.7));
    const yy = y - amp * Math.pow(a, 2.2) - amp * 0.35 * Math.pow(b, 3);
    d += ` L ${x} ${yy.toFixed(1)}`;
  }
  return `${d} L 1140 1930 Z`;
};

export const FondoInfierno: React.FC<{t: number; id: string; furia?: number; children?: React.ReactNode}> = ({
  t,
  id,
  furia = 1,
  children,
}) => (
  <g>
    <Cielo id={id} stops={[[0, '#16020a'], [0.55, '#5e0b15'], [1, '#c2300b']]} alto={1000} />
    {/* Estalactitas */}
    <path
      d="M0,0 L0,330 L60,250 L120,420 L190,270 L260,360 L330,240 L420,330 L500,250 L580,300 L660,240 L740,380 L820,260 L900,430 L970,270 L1030,340 L1080,280 L1080,0 Z"
      fill="#12020a"
    />
    {/* Ascuas */}
    {Array.from({length: 40}).map((_, i) => {
      const vida = 2 + rnd(i, 31) * 2;
      const k = ((t * 0.6 + rnd(i, 32) * vida) % vida) / vida;
      return (
        <circle
          key={i}
          cx={rnd(i, 33) * 1080 + Math.sin(t * 2 + i) * 20}
          cy={lerp(1000, 380, k)}
          r={3 + rnd(i, 34) * 5}
          fill={i % 2 ? '#ffbd00' : '#ff7b00'}
          opacity={(1 - k) * 0.9}
        />
      );
    })}
    <path d={llamas(900, 330 * furia, 330, t * 1.6)} fill="#9d0208" />
    <path d={llamas(940, 250 * furia, 250, -t * 2.1 + 1)} fill="#dc2f02" />
    {children}
    <path d={llamas(1010, 170 * furia, 200, t * 2.6 + 2)} fill="#f48c06" />
    <path d={llamas(1070, 110 * furia, 150, -t * 3.1 + 3)} fill="#ffba08" />
    <defs>
      <linearGradient id={`${id}-fondo`} gradientUnits="userSpaceOnUse" x1="0" y1="1060" x2="0" y2="1230">
        <stop offset="0" stopColor="#5e0b15" stopOpacity="0" />
        <stop offset="1" stopColor="#3a0408" stopOpacity="1" />
      </linearGradient>
    </defs>
    <rect x={0} y={1060} width={1080} height={870} fill={`url(#${id}-fondo)`} />
  </g>
);

/** Tapia encalada al atardecer, con buganvilla. Suelo en y = 985. */
export const FondoTapia: React.FC<{t: number; id: string}> = ({t, id}) => (
  <g>
    <Cielo id={id} stops={PAL.ocaso.cielo} alto={760} />
    <Estrellas t={t} opacity={0.3} maxY={500} n={30} />
    <Luna x={200} y={460} r={70} color="#ffe0a3" />
    <rect x={0} y={690} width={1080} height={300} fill="#f3e3d3" />
    <rect x={0} y={690} width={1080} height={300} fill="#a23b72" opacity={0.18} />
    <rect x={-10} y={664} width={1100} height={30} fill={C.teja} />
    {Array.from({length: 34}).map((_, j) => (
      <path key={j} d={`M${-10 + j * 34},694 q17,16 34,0`} fill={C.tejaOsc} />
    ))}
    {/* Buganvilla */}
    {Array.from({length: 46}).map((_, i) => {
      const bx = 800 + rnd(i, 41) * 300;
      const by = 600 + rnd(i, 42) * 250 * (0.4 + (bx - 800) / 400);
      return (
        <circle
          key={i}
          cx={bx}
          cy={by + Math.sin(t * 1.5 + i) * 2}
          r={18 + rnd(i, 43) * 16}
          fill={i % 3 === 0 ? '#3f8a5c' : i % 3 === 1 ? '#d6336c' : '#f06595'}
        />
      );
    })}
    <rect x={0} y={985} width={1080} height={940} fill="#5b4257" />
    {Array.from({length: 30}).map((_, i) => (
      <ellipse key={i} cx={rnd(i, 44) * 1080} cy={1000 + rnd(i, 45) * 120} rx={30} ry={9} fill="#000" opacity={0.12} />
    ))}
  </g>
);

export const ArbolesHuerto: React.FC<{t: number; ocultos?: number[]; detras?: React.ReactNode}> = ({t, ocultos = [], detras}) => (
  <g>
    <Arbol
      x={170}
      y={990}
      s={1.18}
      t={t}
      frutos={[[-80, -300], [40, -380], [90, -270], [-20, -230], [-110, -230]]}
      ocultos={ocultos.filter((o) => o < 10)}
    />
    {detras}
    <Arbol
      x={910}
      y={990}
      s={1.3}
      t={t}
      frutos={[[-100, -280], [-20, -390], [70, -300], [-50, -220], [100, -240]]}
      ocultos={ocultos.filter((o) => o >= 10).map((o) => o - 10)}
    />
  </g>
);
