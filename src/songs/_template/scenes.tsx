// Scenes of the story. Each scene receives `t` (song second) and draws on a
// 1080x1920 canvas; keep the drawing between y≈300 and y≈1100 so the header
// and the lyrics (from y≈1150 down) stay clear.
// Replace these two starter scenes with your own (see the skill and README).
import React from 'react';
import {
  C,
  Corazon,
  Lienzo,
  Pareja,
  eo,
  fuenteArtista,
  fuenteLetra,
  lerp,
  pop,
  u,
  type Escena,
} from '../../kit/kit';
import {FondoPuerto, MUELLE_Y, PAL} from '../../kit/fondos';
import {CONFIG} from './config';

/** Cover: artist and title over the harbour at dusk. */
const Cover: Escena = ({t}) => {
  const s0 = CONFIG.start;
  return (
    <Lienzo>
      <FondoPuerto t={t} id="cover-sky" pal={PAL.ocaso} astro={{x: 560, y: 620, r: 210}} />
      <text
        x={540}
        y={330}
        opacity={u(t, s0 + 0.1, s0 + 0.5)}
        textAnchor="middle"
        fontFamily={fuenteArtista}
        fontWeight={900}
        fontSize={104}
        fill="#fff"
      >
        {CONFIG.artist}
      </text>
      <text
        x={540}
        y={lerp(800, 770, eo(u(t, s0 + 0.4, s0 + 0.9)))}
        opacity={u(t, s0 + 0.4, s0 + 0.8)}
        textAnchor="middle"
        fontFamily={fuenteLetra}
        fontWeight={700}
        fontSize={112}
        fill={C.crema}
        stroke="#1b0f33"
        strokeOpacity={0.55}
        strokeWidth={12}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {CONFIG.title}
      </text>
    </Lienzo>
  );
};

/** Starter scene: the couple walks towards each other and a heart pops. */
const Meeting: Escena = ({t}) => {
  const from = CONFIG.start + 3;
  const k = u(t, from, from + 2.5);
  return (
    <Lienzo>
      <FondoPuerto t={t} id="meeting-sky" pal={PAL.noche} />
      <Pareja x={540} y={MUELLE_Y} s={1.45} k={k} t={t} sep={700} />
      <Corazon x={540} y={420} s={1.1 * pop(t, from + 2.5, 0.4)} />
    </Lienzo>
  );
};

/** Scenes in order. `at` = song second where each one starts. */
export const SCENES = [
  {at: CONFIG.start, C: Cover},
  {at: CONFIG.start + 3, C: Meeting},
];
