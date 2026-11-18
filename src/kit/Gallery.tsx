// Kit gallery: every setting, character and object of the kit, labelled
// with its component name. Open it in Remotion Studio (`npm start`) to pick
// pieces for a new scene. Three pages, three seconds each.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS} from './LyricVideo';
import {
  Anillo,
  Arbol,
  Barco,
  Casa,
  Corazon,
  Destello,
  Flor,
  Gaviota,
  Labios,
  Lienzo,
  Manzana,
  NeonCopa,
  Pareja,
  Perro,
  Persona,
  fuenteArtista,
} from './kit';
import {
  FachadaFondo,
  FachadaFrente,
  FondoBar,
  FondoHuerto,
  FondoInfierno,
  FondoPuerto,
  FondoTapia,
  FondoTejados,
  PAL,
} from './fondos';
import {Banco, Coche, FondoDescampado, FondoEstacion, Maleta, Polaroid, Tren} from './fondos-viaje';

export const GALLERY_SECONDS = 9;

const Label: React.FC<{x: number; y: number; text: string; size?: number}> = ({x, y, text, size = 30}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Menlo, monospace" fontSize={size} fill="#e8ecf7">
    {text}
  </text>
);

const Title: React.FC<{text: string}> = ({text}) => (
  <text x={540} y={200} textAnchor="middle" fontFamily={fuenteArtista} fontWeight={900} fontSize={50} fill="#ffd166">
    {text}
  </text>
);

/** A cell that shows `children` drawn in its own coordinates (`viewBox`). */
const Cell: React.FC<{x: number; y: number; w: number; h: number; viewBox: string; children: React.ReactNode}> = ({
  x,
  y,
  w,
  h,
  viewBox,
  children,
}) => (
  <svg x={x} y={y} width={w} height={h} viewBox={viewBox} preserveAspectRatio="xMidYMid meet" overflow="hidden">
    {children}
  </svg>
);

const SettingsPage: React.FC<{t: number}> = ({t}) => {
  const thumbs: [string, React.ReactNode][] = [
    ['FondoPuerto', <FondoPuerto key="a" t={t} id="g-puerto" pal={PAL.ocaso} />],
    ['FondoHuerto', <FondoHuerto key="b" t={t} id="g-huerto" />],
    ['FondoTejados', <FondoTejados key="c" t={t} id="g-tejados" />],
    [
      'FachadaFondo + Frente',
      <g key="d">
        <FachadaFondo t={t} id="g-fachada" />
        <FachadaFrente t={t} />
      </g>,
    ],
    ['FondoBar', <FondoBar key="e" t={t} id="g-bar" />],
    ['FondoInfierno', <FondoInfierno key="f" t={t} id="g-infierno" />],
    ['FondoTapia', <FondoTapia key="g" t={t} id="g-tapia" />],
    ['FondoEstacion', <FondoEstacion key="h" t={t} id="g-estacion" />],
    ['FondoDescampado', <FondoDescampado key="i" t={t} id="g-descampado" />],
  ];
  return (
    <Lienzo>
      <rect width={1080} height={1920} fill="#10142e" />
      <Title text="SETTINGS · ESCENARIOS" />
      {thumbs.map(([name, node], i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 30 + col * 345;
        const y = 280 + row * 520;
        return (
          <g key={name}>
            <rect x={x - 4} y={y - 4} width={338} height={438} rx={10} fill="#2a3160" />
            <Cell x={x} y={y} w={330} h={430} viewBox="0 280 1080 1400">
              {node}
            </Cell>
            <Label x={x + 165} y={y + 478} text={name} size={24} />
          </g>
        );
      })}
    </Lienzo>
  );
};

const CharactersPage: React.FC<{t: number}> = ({t}) => (
  <Lienzo>
    <rect width={1080} height={1920} fill="#10142e" />
    <Title text="CHARACTERS · PERSONAJES" />
    <rect x={0} y={1000} width={1080} height={8} fill="#2a3160" />
    <Persona tipo="el" x={200} y={1000} s={1.35} pose={{bd: [150 + Math.sin(t * 8) * 14, -24]}} />
    <Persona tipo="ella" x={520} y={1000} s={1.35} mira={-1} pose={{sonrojo: 0.9}} />
    <Perro x={800} y={1000} s={1.35} t={t} />
    <Label x={200} y={1060} text={'Persona "el"'} />
    <Label x={520} y={1060} text={'Persona "ella"'} />
    <Label x={840} y={1060} text="Perro" />
    <rect x={0} y={1640} width={1080} height={8} fill="#2a3160" />
    <Pareja x={540} y={1640} s={1.2} k={1} t={t} />
    <Label x={540} y={1700} text="<Pareja k={1}>  (k: 0 → 1 = apart → kiss)" />
  </Lienzo>
);

const OBJECTS: [string, string, (t: number) => React.ReactNode][] = [
  ['Barco', '-200 -360 400 420', (t) => <Barco x={0} y={0} t={t} />],
  ['Tren', '-500 -240 760 260', () => <Tren x={0} y={0} vagones={1} />],
  ['Coche', '-240 -230 480 250', () => <Coche x={0} y={0} faros={0} />],
  ['Casa', '-30 -210 260 220', () => <Casa x={0} y={0} w={200} h={160} ventanas={[[30, 40], [120, 40]]} />],
  ['Arbol', '-240 -520 480 540', (t) => <Arbol x={0} y={0} t={t} frutos={[[-60, -300], [50, -360]]} />],
  ['Banco', '-110 -170 220 180', () => <Banco x={0} />],
  ['Maleta', '-170 -280 340 300', () => <Maleta x={0} y={0} />],
  ['Polaroid', '-80 -85 160 170', () => <Polaroid x={0} y={0} />],
  ['Corazon', '-70 -60 140 130', () => <Corazon />],
  ['Labios', '-60 -40 120 80', () => <Labios />],
  ['Flor', '-40 -40 80 80', () => <Flor x={0} y={0} />],
  ['Manzana', '-40 -45 80 80', () => <Manzana />],
  ['Anillo', '-70 -95 140 150', () => <Anillo x={0} y={0} />],
  ['NeonCopa', '-100 -100 200 200', () => <NeonCopa x={0} y={0} />],
  ['Gaviota', '-40 -35 80 50', (t) => <Gaviota x={0} y={0} t={t} color="#e8ecf7" />],
  ['Destello', '-45 -45 90 90', (t) => <Destello x={0} y={0} rot={t * 60} />],
];

const ObjectsPage: React.FC<{t: number}> = ({t}) => (
  <Lienzo>
    <rect width={1080} height={1920} fill="#10142e" />
    <Title text="OBJECTS · OBJETOS" />
    {/* Banco reads ANDEN_Y internally; shift it into its cell */}
    {OBJECTS.map(([name, viewBox, draw], i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 30 + col * 258;
      const y = 300 + row * 380;
      const shiftBanco = name === 'Banco' ? 'translate(0 -985)' : undefined;
      return (
        <g key={name}>
          <rect x={x} y={y} width={246} height={300} rx={12} fill="#1b2050" />
          <Cell x={x + 12} y={y + 12} w={222} h={276} viewBox={viewBox}>
            <g transform={shiftBanco}>{draw(t)}</g>
          </Cell>
          <Label x={x + 123} y={y + 344} text={`<${name}>`} size={26} />
        </g>
      );
    })}
  </Lienzo>
);

export const KitGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const page = Math.min(2, Math.floor(t / 3));
  return (
    <AbsoluteFill style={{backgroundColor: '#10142e'}}>
      {page === 0 ? <SettingsPage t={t} /> : page === 1 ? <CharactersPage t={t} /> : <ObjectsPage t={t} />}
    </AbsoluteFill>
  );
};
