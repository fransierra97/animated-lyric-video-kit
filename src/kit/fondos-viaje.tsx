// Journey pieces and settings / Piezas y escenarios de viaje: locomotora,
// vagones, estación, coche, descampado, foto y maleta. Lienzo 1080x1920.
import React from 'react';
import {C, CORAZON, Cielo, Corazon, Estrellas, Luna, clamp, eo, fuenteArtista, lerp, rad, rnd} from './kit';
import {PAL, Reloj} from './fondos';

const NEGRO = '#161a2b';

/** Locomotora de vapor mirando a la derecha. Origen: carril, bajo el centro. */
export const Locomotora: React.FC<{giro?: number; luz?: number}> = ({giro = 0, luz = 1}) => {
  const pin = (cx: number) => [cx + Math.cos(rad(giro)) * 20, -36 + Math.sin(rad(giro)) * 20];
  const [p1x, p1y] = pin(-70);
  const [p3x, p3y] = pin(78);
  return (
    <g>
      <path d="M190,-150 L640,-250 L640,-20 Z" fill="#fff3b0" opacity={0.13 * luz} />
      <rect x={-150} y={-72} width={346} height={20} fill={NEGRO} />
      <rect x={-150} y={-206} width={132} height={136} fill="#19565e" />
      <rect x={-164} y={-222} width={160} height={18} rx={6} fill={NEGRO} />
      <rect x={-128} y={-186} width={66} height={60} rx={6} fill="#ffe29a" />
      <rect x={-20} y={-156} width={198} height={88} rx={26} fill="#1f6f78" />
      <rect x={150} y={-156} width={36} height={88} rx={14} fill="#15434a" />
      <rect x={28} y={-156} width={7} height={86} fill={C.oro} />
      <rect x={92} y={-156} width={7} height={86} fill={C.oro} />
      <path d="M48,-154 A22,22 0 0 1 92,-154 Z" fill={C.oro} transform="translate(-6 0)" />
      <path d="M128,-154 L134,-204 L120,-216 L172,-216 L158,-204 L164,-154 Z" fill={NEGRO} />
      <rect x={-150} y={-80} width={336} height={9} fill={C.rojo} />
      <path d="M184,-52 L238,-8 L184,-8 Z" fill={C.rojo} />
      <circle cx={190} cy={-150} r={22} fill="#fff3b0" opacity={0.35 * luz} />
      <circle cx={190} cy={-150} r={13} fill="#fff3b0" />
      {[-70, 4, 78].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-36} r={36} fill={NEGRO} />
          <circle cx={cx} cy={-36} r={27} fill="none" stroke={C.rojo} strokeWidth={6} />
          <g transform={`rotate(${giro.toFixed(1)} ${cx} -36)`} stroke={C.rojo} strokeWidth={5}>
            <line x1={cx - 26} y1={-36} x2={cx + 26} y2={-36} />
            <line x1={cx} y1={-62} x2={cx} y2={-10} />
          </g>
          <circle cx={cx} cy={-36} r={8} fill="#c9ccd6" />
        </g>
      ))}
      <circle cx={150} cy={-22} r={22} fill={NEGRO} />
      <circle cx={150} cy={-22} r={8} fill="#c9ccd6" />
      <line x1={p1x} y1={p1y} x2={p3x} y2={p3y} stroke="#c9ccd6" strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

/** Vagón de pasajeros. Origen: carril, bajo el centro. Largo 300. */
export const Vagon: React.FC<{color?: string; children?: React.ReactNode}> = ({color = '#7b2d3a', children}) => (
  <g>
    <rect x={146} y={-52} width={18} height={9} fill={NEGRO} />
    <rect x={-146} y={-186} width={292} height={144} rx={10} fill={color} />
    <rect x={-146} y={-186} width={292} height={30} rx={10} fill="#f3dfb5" />
    {[-124, -58, 8, 74].map((wx) => (
      <rect key={wx} x={wx} y={-148} width={50} height={58} rx={6} fill="#ffe29a" />
    ))}
    {children}
    <rect x={-152} y={-200} width={304} height={17} rx={8} fill={NEGRO} />
    <rect x={-146} y={-46} width={292} height={12} fill={NEGRO} />
    <rect x={-146} y={-74} width={292} height={7} fill="#f3dfb5" opacity={0.7} />
    {[-96, 96].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={-20} r={20} fill={NEGRO} />
        <circle cx={cx} cy={-20} r={7} fill="#c9ccd6" />
      </g>
    ))}
  </g>
);

/** Tren completo mirando a la derecha: (x, y) = carril bajo la locomotora. */
export const Tren: React.FC<{x: number; y: number; s?: number; vagones?: number; luz?: number}> = ({
  x,
  y,
  s = 1,
  vagones = 3,
  luz = 1,
}) => (
  <g transform={`translate(${x.toFixed(1)} ${y}) scale(${s})`}>
    {Array.from({length: vagones}).map((_, i) => (
      <g key={i} transform={`translate(${-326 - i * 312} 0)`}>
        <Vagon color={i % 2 ? '#8a3a2b' : '#7b2d3a'} />
      </g>
    ))}
    <Locomotora giro={(x / (36 * s)) * 57.3} luz={luz} />
  </g>
);

/** Humo de la chimenea. `xChimenea(tt)` = posición de la chimenea en el instante tt. */
export const Humo: React.FC<{
  t: number;
  xChimenea: (tt: number) => number;
  y: number;
  n?: number;
  vida?: number;
  s?: number;
  corazones?: boolean;
}> = ({t, xChimenea, y, n = 9, vida = 1.8, s = 1, corazones = false}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const fase = (((t / vida + i / n) % 1) + 1) % 1;
      const edad = fase * vida;
      const px = xChimenea(t - edad) + Math.sin(i * 3 + fase * 4) * 14 * s;
      const py = y - 190 * s * eo(fase);
      const r = (16 + 46 * fase) * s;
      const op = (1 - fase) * 0.85 * Math.min(1, fase * 8);
      return corazones && i % 2 === 0 ? (
        <Corazon key={i} x={px} y={py} s={r / 44} opacity={op} color={C.rosa} brillo={false} />
      ) : (
        <circle key={i} cx={px} cy={py} r={r} fill="#e8ecf7" opacity={op * 0.8} />
      );
    })}
  </g>
);

export const ANDEN_Y = 985;
export const VIA_Y = 1004;

/** Estación de noche (o al alba). `tren` se dibuja en la vía, tras el andén. */
export const FondoEstacion: React.FC<{
  t: number;
  id: string;
  alba?: boolean;
  /** Color del piloto del tablero (el tablero no lleva texto). */
  piloto?: string;
  /** Las tablillas del tablero se barajan. */
  baraja?: boolean;
  tren?: React.ReactNode;
  tablero?: boolean;
}> = ({t, id, alba = false, piloto = '#ffd166', baraja = false, tren, tablero = true}) => {
  const hierro = '#1b1f3f';
  const parpadeo = Math.sin(t * 5) > -0.6 ? 1 : 0.35;
  return (
    <g>
      <Cielo id={id} stops={alba ? PAL.alba.cielo : [[0, '#070b24'], [0.6, '#1b2458'], [1, '#3a3b80']]} alto={1010} />
      <Estrellas t={t} maxY={820} opacity={alba ? 0.15 : 1} />
      {alba ? <Luna x={820} y={760} r={170} color="#fff0b8" crateres={false} /> : <Luna x={850} y={600} r={78} />}
      <path
        d="M-20,1010 L-20,860 L70,860 L70,800 L170,800 L170,880 L300,880 L300,760 L330,730 L360,760 L360,850 L500,850 L500,790 L620,790 L620,870 L760,870 L760,810 L880,810 L880,880 L1100,880 L1100,1010 Z"
        fill={alba ? '#5a3d7a' : '#11163f'}
      />
      {[[100, 830], [320, 800], [540, 820], [800, 840], [1000, 910]].map(([wx, wy], i) => (
        <rect key={i} x={wx} y={wy} width={18} height={24} fill="#ffd27a" opacity={alba ? 0.25 : 0.6} />
      ))}
      {/* Vía */}
      <rect x={-20} y={VIA_Y - 4} width={1120} height={8} fill="#8d99ae" />
      {tren}
      {/* Marquesina */}
      <rect x={66} y={436} width={26} height={560} fill={hierro} />
      <rect x={988} y={436} width={26} height={560} fill={hierro} />
      <path d="M92,470 q40,-4 60,-34 M988,470 q-40,-4 -60,-34" stroke={hierro} strokeWidth={10} fill="none" />
      <rect x={-20} y={400} width={1120} height={38} fill={hierro} />
      {Array.from({length: 28}).map((_, i) => (
        <path key={i} d={`M${-20 + i * 40},438 q20,22 40,0 Z`} fill={hierro} />
      ))}
      <rect x={-20} y={400} width={1120} height={7} fill="#2c3160" />
      {/* Reloj y tablero colgantes */}
      <path d="M176,438 v30" stroke={hierro} strokeWidth={8} />
      <Reloj x={176} y={526} r={52} hora={300 + t * 0.5} minuto={t * 6} />
      {tablero ? (
        <g>
          <path d="M620,438 v40 M920,438 v40" stroke={hierro} strokeWidth={8} />
          <rect x={540} y={474} width={460} height={126} rx={10} fill="#0d1030" stroke={hierro} strokeWidth={8} />
          {Array.from({length: 18}).map((_, i) => {
            const fila = Math.floor(i / 9);
            const col = i % 9;
            if (fila === 1 && col === 8) return null;
            const sem = baraja ? Math.floor(t * 9) : 0;
            const w = 8 + rnd(i, 801 + sem) * 22;
            return (
              <g key={i}>
                <rect x={562 + col * 46} y={492 + fila * 50} width={40} height={42} rx={4} fill="#232a5c" />
                <rect x={562 + col * 46 + (40 - w) / 2} y={508 + fila * 50} width={w} height={9} rx={2} fill="#ffd166" opacity={fila ? 0.45 : 0.8} />
                <rect x={562 + col * 46} y={512 + fila * 50} width={40} height={2} fill="#0d1030" />
              </g>
            );
          })}
          <circle cx={950} cy={563} r={24} fill={piloto} opacity={0.25 * parpadeo} />
          <circle cx={950} cy={563} r={14} fill={piloto} opacity={parpadeo} />
        </g>
      ) : null}
      {/* Andén */}
      <rect x={0} y={ANDEN_Y} width={1080} height={940} fill={alba ? '#6a5d86' : '#3d405b'} />
      <rect x={0} y={ANDEN_Y} width={1080} height={9} fill={alba ? '#8b7fa6' : '#565a7c'} />
      {Array.from({length: 14}).map((_, i) => (
        <rect key={i} x={i * 82 - 10} y={ANDEN_Y + 16} width={52} height={9} fill="#ffd166" opacity={0.85} />
      ))}
    </g>
  );
};

export const Banco: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${ANDEN_Y})`}>
    <rect x={-96} y={-150} width={192} height={18} rx={6} fill={C.madera} />
    <rect x={-96} y={-122} width={192} height={18} rx={6} fill={C.madera} />
    <rect x={-104} y={-78} width={208} height={20} rx={6} fill="#a8744e" />
    <path d="M-84,-60 v60 M84,-60 v60 M-84,-150 v92 M84,-150 v92" stroke="#1b1f3f" strokeWidth={10} />
  </g>
);

const V_TRAS = 'M-106,-118 L-72,-168 Q-68,-174 -58,-174 L-4,-174 L-4,-118 Z';
const V_DEL = 'M10,-174 L70,-174 Q84,-174 92,-164 L128,-118 L10,-118 Z';

/** Coche de los ochenta mirando a la derecha. Origen: suelo, bajo el centro. */
export const Coche: React.FC<{
  x: number;
  y: number;
  s?: number;
  giro?: number;
  /** Desplazamiento vertical de la carrocería (los amortiguadores). */
  bote?: number;
  /** Cristales empañados, 0..1. */
  vaho?: number;
  /** Trazo del corazón dibujado en el vaho, 0..1. */
  trazo?: number;
  /** Huella de mano en el cristal trasero, 0..1. */
  mano?: number;
  faros?: number;
  pareja?: boolean;
  color?: string;
}> = ({x, y, s = 1, giro = 0, bote = 0, vaho = 0, trazo = 0, mano = 0, faros = 1, pareja = true, color = '#e09f3e'}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}>
    {faros > 0 ? <path d="M206,-88 L560,-150 L560,0 Z" fill="#fff3b0" opacity={0.16 * faros} transform={`translate(0 ${bote})`} /> : null}
    {[-128, 132].map((cx) => (
      <g key={cx}>
        <path
          d={`M${cx - 10},-96 l20,10 l-20,10 l20,10 l-20,10`}
          stroke="#c9ccd6"
          strokeWidth={5}
          fill="none"
          transform={`translate(0 ${bote * 0.5})`}
        />
        <circle cx={cx} cy={-44} r={44} fill="#15171f" />
        <circle cx={cx} cy={-44} r={22} fill="#c9ccd6" />
        <g transform={`rotate(${giro.toFixed(1)} ${cx} -44)`} stroke="#8d99ae" strokeWidth={5}>
          <line x1={cx - 20} y1={-44} x2={cx + 20} y2={-44} />
          <line x1={cx} y1={-64} x2={cx} y2={-24} />
        </g>
      </g>
    ))}
    <g transform={`translate(0 ${bote.toFixed(1)})`}>
      <path
        d="M-212,-44 L-212,-92 Q-208,-108 -182,-112 L-122,-116 L-80,-176 Q-72,-188 -54,-188 L74,-188 Q94,-188 106,-172 L152,-116 L196,-106 Q214,-102 214,-84 L214,-44 L184,-44 A52,52 0 0 0 80,-44 L-76,-44 A52,52 0 0 0 -180,-44 Z"
        fill={color}
      />
      <path d="M-212,-60 L214,-60 L214,-44 L184,-44 A52,52 0 0 0 80,-44 L-76,-44 A52,52 0 0 0 -180,-44 L-212,-44 Z" fill="#000" opacity={0.16} />
      <path d={V_TRAS} fill="#1c2a52" />
      <path d={V_DEL} fill="#1c2a52" />
      {pareja ? (
        <g>
          <circle cx={76} cy={-138} r={21} fill="#e3a983" />
          <path d="M56,-142 A21,21 0 0 1 96,-146 Q78,-150 70,-138 Z" fill={C.pelo} transform="translate(2 -4)" />
          <circle cx={42} cy={-136} r={20} fill="#f1c5a3" />
          <path d="M22,-118 Q14,-150 34,-158 Q54,-162 60,-146 Q44,-150 36,-136 Q32,-126 34,-118 Z" fill="#3a1c14" />
        </g>
      ) : null}
      <path d={V_TRAS} fill="#eef3ff" opacity={vaho * 0.8} />
      <path d={V_DEL} fill="#eef3ff" opacity={vaho * 0.8} />
      {trazo > 0 ? (
        <path
          d={CORAZON}
          transform="translate(62 -150) scale(0.38)"
          fill="none"
          stroke="#1c2a52"
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={420}
          strokeDashoffset={420 * (1 - clamp(trazo))}
        />
      ) : null}
      {mano > 0 ? (
        <g fill="#1c2a52" opacity={clamp(mano)} transform="translate(-52 -142) rotate(-14) scale(0.8)">
          <ellipse cx={0} cy={8} rx={13} ry={15} />
          {[-16, -7, 2, 11].map((dx, i) => (
            <rect key={i} x={dx - 3.5} y={-26 - (i === 1 || i === 2 ? 6 : 0)} width={7} height={26} rx={3.5} />
          ))}
          <rect x={14} y={-4} width={7} height={18} rx={3.5} transform="rotate(50 14 -4)" />
        </g>
      ) : null}
      <path d="M2,-176 V-52" stroke="#000" strokeWidth={4} opacity={0.25} />
      <rect x={-30} y={-104} width={22} height={7} rx={3} fill="#000" opacity={0.3} />
      <rect x={196} y={-98} width={18} height={20} rx={5} fill="#fff3b0" />
      <rect x={-214} y={-96} width={12} height={22} rx={4} fill="#d62839" />
      <rect x={-220} y={-64} width={18} height={12} rx={4} fill="#c9ccd6" />
      <rect x={204} y={-64} width={18} height={12} rx={4} fill="#c9ccd6" />
    </g>
  </g>
);

const Torre: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x.toFixed(1)} ${y}) scale(${s})`} stroke="#0e1238" strokeWidth={7} fill="none" strokeLinecap="round">
    <path d="M-40,0 L-12,-300 L12,-300 L40,0 M-34,-70 L34,-70 M-28,-140 L28,-140 M-20,-210 L20,-210 M-34,-70 L28,-140 M34,-70 L-28,-140 M-28,-140 L20,-210 M28,-140 L-20,-210" />
    <path d="M-70,-300 L70,-300 M-52,-250 L52,-250" />
  </g>
);

/** Descampado de noche. El suelo queda en y = 985. `avance` desplaza el fondo. */
export const FondoDescampado: React.FC<{t: number; id: string; avance?: number}> = ({t, id, avance = 0}) => {
  const mod = (v: number, m: number) => ((v % m) + m) % m;
  return (
    <g>
      <Cielo id={id} stops={[[0, '#070b24'], [0.6, '#1b2458'], [1, '#4a3f8c']]} alto={1010} />
      <Estrellas t={t} maxY={860} n={90} />
      <Luna x={820} y={470} r={92} />
      {/* Ciudad lejana */}
      <path d="M-20,1010 L-20,930 Q260,880 540,910 Q820,940 1100,900 L1100,1010 Z" fill="#161a4a" />
      {Array.from({length: 38}).map((_, i) => (
        <circle
          key={i}
          cx={mod(rnd(i, 201) * 1300 - avance * 0.15, 1300) - 100}
          cy={900 + rnd(i, 202) * 34}
          r={3 + rnd(i, 203) * 2}
          fill={i % 3 ? '#ffd27a' : '#ff9e6d'}
          opacity={0.5 + 0.4 * Math.sin(t * 2 + i)}
        />
      ))}
      {/* Torres de alta tensión */}
      {[0, 1, 2].map((i) => {
        const tx = mod(i * 520 + 180 - avance * 0.4, 1560) - 240;
        return <Torre key={i} x={tx} y={990} s={1.25} />;
      })}
      {/* Suelo */}
      <rect x={0} y={985} width={1080} height={940} fill="#3b2f4a" />
      <path d="M-20,1000 Q200,972 420,990 Q700,1012 1100,980 L1100,1010 L-20,1010 Z" fill="#3b2f4a" />
      {Array.from({length: 16}).map((_, i) => {
        const gx = mod(rnd(i, 211) * 1400 - avance, 1400) - 160;
        const gy = 992 + rnd(i, 212) * 90;
        return i % 3 === 0 ? (
          <ellipse key={i} cx={gx} cy={gy + 10} rx={26 + rnd(i, 213) * 20} ry={10} fill="#2a2138" />
        ) : (
          <path
            key={i}
            d={`M${gx},${gy} q-10,-26 -18,-34 M${gx},${gy} q0,-30 4,-42 M${gx},${gy} q12,-22 22,-30`}
            stroke="#8a7a5a"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

/** Viñeta suave de recuerdo. */
export const Recuerdo: React.FC<{id: string; opacity?: number}> = ({id, opacity = 1}) => (
  <g opacity={opacity}>
    <defs>
      <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={540} cy={720} r={900}>
        <stop offset="0.45" stopColor="#ffd6e0" stopOpacity="0" />
        <stop offset="1" stopColor="#ffb3c6" stopOpacity="0.55" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#${id})`} />
  </g>
);

/** Foto instantánea de ella. */
export const Polaroid: React.FC<{x: number; y: number; s?: number; rot?: number; opacity?: number}> = ({x, y, s = 1, rot = 0, opacity = 1}) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`} opacity={opacity}>
      <rect x={-62} y={-74} width={124} height={150} rx={5} fill="#fff" />
      <rect x={-52} y={-64} width={104} height={104} fill="#ffd6e0" />
      <path d="M-34,40 L-20,2 Q0,-10 20,2 L34,40 Z" fill={C.rojo} />
      <path d="M-30,-10 Q-36,-52 0,-54 Q34,-52 28,-6 Q30,20 20,34 L10,10 Z" fill="#3a1c14" />
      <circle cx={0} cy={-18} r={22} fill="#f1c5a3" />
      <path d="M-22,-22 Q-14,-44 6,-40 Q22,-36 22,-22 Q8,-32 -22,-22 Z" fill="#3a1c14" />
      <circle cx={-8} cy={-16} r={2.6} fill="#1b1414" />
      <circle cx={8} cy={-16} r={2.6} fill="#1b1414" />
      <path d="M-7,-6 q7,6 14,0" stroke="#7a2e2e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d={CORAZON} fill={C.rojo} transform="translate(0 54) scale(0.14)" />
    </g>
  );

/** Maleta enorme de recuerdos. Origen: suelo, bajo el centro. */
export const Maleta: React.FC<{x: number; y: number; s?: number; rot?: number; abierta?: number}> = ({x, y, s = 1, rot = 0, abierta = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s})`}>
    <g transform={`rotate(${(-70 * abierta).toFixed(1)} -150 -200)`}>
      <rect x={-150} y={-232} width={300} height={36} rx={12} fill="#6b4226" />
      <path d="M-30,-232 v-22 q0,-12 12,-12 h36 q12,0 12,12 v22" stroke="#3e2616" strokeWidth={10} fill="none" />
    </g>
    <rect x={-150} y={-200} width={300} height={200} rx={16} fill="#8a5a3b" />
    <rect x={-150} y={-200} width={300} height={200} rx={16} fill="none" stroke="#5f3b25" strokeWidth={8} />
    <rect x={-96} y={-200} width={22} height={200} fill="#5f3b25" />
    <rect x={74} y={-200} width={22} height={200} fill="#5f3b25" />
    <Corazon x={0} y={-104} s={0.9} />
    <rect x={-136} y={-60} width={54} height={34} rx={4} fill={C.crema} transform="rotate(-8 -110 -44)" />
  </g>
);

