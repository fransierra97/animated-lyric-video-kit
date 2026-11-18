---
name: animated-lyric-video
description: Make a vertical animated lyric video (a drawn story plus karaoke lyrics right below it) for YouTube Shorts, Instagram Reels or TikTok, using this repository's Remotion kit. Use when the user gives a song (audio file and lyrics) and wants an animated or lyric video of it.
---

# Animated lyric video

The video is one song excerpt, a short drawn story that follows the lyrics,
and the lyrics shown line by line under the animation with the sung word
highlighted. The shell (`src/kit/LyricVideo.tsx`) handles audio, header,
lyrics, credit, social handles and fades. Your job is the excerpt, the timings
and the story. Answer in the user's language.

## 0. Inputs

Get what is missing, nothing more:

- Audio file and the lyrics text. If they only give a title, ask for the files.
  Do not download songs.
- Artist, song title, credit line (e.g. "Words and music: …"), optional social
  handles (`{network: 'instagram' | 'youtube', handle}`).
- Maximum length. Default to 60 s if they don't say.

Only work with songs the user owns or has permission to use. Never upload or
publish anything.

## 1. Create the song

```bash
npm run new-song -- <kebab-id> --audio <file> --title "…" --artist "…" --credit "…"
```

This creates `src/songs/<id>/` (config, lyrics, scenes), copies the audio to
`public/` and registers the composition `<id>`.

## 2. Lyrics, transcription, alignment

1. Write `src/songs/<id>/lyrics.txt`: one screen line per line, in sung order,
   repeated choruses written out again. 2–7 words per line read well; split
   longer lines at a natural pause.
2. `python scripts/transcribe.py public/<audio> src/songs/<id>/transcription.json --language <code>`
3. Pick the excerpt and set `start` / `end` in `config.ts`:
   - stay within the maximum length;
   - start 2–3 s before the first sung line you keep (room for a cover scene);
   - end after a complete phrase, ideally a chorus line, plus ~1.5 s for the
     fade (the shell fades audio and picture over the last ~1.8 s);
   - use `transcription.json` segment times to find phrase boundaries.
4. `python scripts/align.py src/songs/<id>` and read its report:
   - "not heard: timing estimated": Whisper skipped the line; the time is a
     guess. Try a bigger model (`--model mlx-community/whisper-large-v3-mlx`
     or `--model large-v3`) or fix it by hand in `lyrics.ts`.
   - "Dropped": lines outside the excerpt. Expected if the user pasted the
     whole song.
   - Whisper's words are often wrong; the user's lyrics win. Never "correct"
     the user's lyrics to match Whisper. If the recording clearly sings
     different words, tell the user and ask which version to show.

## 3. Write the story before the code

Make a short beat sheet: one beat per line (or per couplet), with its start
time from `lyrics.ts`. Then turn beats into scenes.

Style rules. These are what make the videos work; follow them:

- **Suggest, don't illustrate word by word.** No on-screen words or
  onomatopoeia that repeat the lyrics: no signs, labels, destinations, speech
  bubbles, "WOOF", "shhh", "∞". Tell it with action, objects, light, weather,
  colour and recurring motifs. If a line names a thing (a train, a dog, a
  phone call), ask what it means in the story and show that instead, or show
  the thing without naming it.
- **One story, one cast.** Keep the same characters and a few recurring
  settings and props, so the video reads as a story and not as a slideshow.
- **Hit the key words.** Time pops, impacts and changes to the start of the
  important word (`pop(t, word.start)`, `sacudida(t, word.start)`).
- **Always moving.** No frame should be still for more than about a second.
- **Respect the layout.** Draw the scene between y≈300 and y≈1100 on the
  1080x1920 canvas. The header sits above, the lyrics start at y≈1150.
- Scenes change about 0.3–0.5 s before the line they illustrate; the shell
  crossfades for 0.12 s.
- The first scene is a cover (artist and title, before the vocals). The
  header appears when the second scene starts.

## 4. Code the scenes

Edit `src/songs/<id>/scenes.tsx`. A scene is a component that receives `t`,
the song time in seconds, and draws inside `<Lienzo>`:

```tsx
const Meeting: Escena = ({t}) => {
  const k = u(t, 31.2, 33.0);            // 0→1 between two song seconds
  return (
    <Lienzo>
      <FondoPuerto t={t} id="meeting-sky" pal={PAL.noche} />
      <Pareja x={540} y={MUELLE_Y} s={1.45} k={k} t={t} />
      <Corazon x={540} y={420} s={pop(t, 33.0)} />
    </Lienzo>
  );
};

export const SCENES = [
  {at: CONFIG.start, C: Cover},
  {at: 30.9, C: Meeting},
];
```

Kit reference (names are Spanish; `README.md` has a glossary). Browse every
piece in the `kit-gallery` composition.

- **Time helpers** (`kit.tsx`): `u(t, a, b)` progress 0→1; `lerp`, `lerp2`;
  easings `eo` (out), `ei` (in), `eio` (in-out), `back` (overshoot);
  `pop(t, at)` springy appearance; `sacudida(t, at)` damped shake; `rnd(i)`
  deterministic random. Never use `Math.random()`.
- **Characters**: `<Persona tipo="el" | "ella" x y s mira pose enMano>`. `x, y`
  are the feet. `mira` 1 faces right, -1 left. `pose`: `bd`/`bt` front/back arm
  `[shoulder°, elbow°]` (0 down, 90 forward, 180 up), `paso` + `zancada`
  (walk), `inclina` (lean), `cabeza` (head tilt), `ojo: 'cerrado'`, `beso`,
  `sonrojo` (blush). `ikBrazo(...)` aims a hand at a point; `puntoMano`,
  `puntoCabeza` return canvas points. `<Pareja k>`: 0 apart, 1 kissing.
  `<Perro>`.
- **Settings**: `FondoPuerto` (harbour, palettes `PAL.noche | ocaso | alba`),
  `FondoHuerto` (orchard), `FondoTejados` (rooftops), `FachadaFondo` +
  `FachadaFrente` (balcony; draw characters between them), `FondoBar`,
  `FondoInfierno`, `FondoTapia` (whitewashed wall), `FondoEstacion` (station,
  pass a `tren`), `FondoDescampado` (wasteland at night). Ground is y=985 in
  most of them (`MUELLE_Y`, `ANDEN_Y`); balcony floor `BALCON_Y`, street
  `CALLE_Y`.
- **Objects**: `Barco`, `Tren` + `Humo`, `Coche` (fogged windows, heart drawn
  in the fog), `Casa`, `Arbol`, `Banco`, `Maleta`, `Polaroid`, `Corazon`,
  `Labios`, `Flor`, `Manzana`, `Anillo`, `NeonCopa`, `Gaviota`, `Destello`,
  `Estallido` (burst of hearts and lips), `Flotantes` (floating hearts),
  `Recuerdo` (memory tint), `Luna`, `Estrellas`, `Mar`, `Cielo`.

Rules of thumb: every gradient/clip `id` must be unique in the whole video
(prefix it with the scene name); compute everything from `t` (no state);
draw back to front.

New pieces go in `src/kit/`, in the same style: flat colours, no outlines,
drawn around their own origin, with an `s` scale prop. Add them to
`Gallery.tsx`.

## 5. Check frames

```bash
npm run typecheck
npm run stills -- <id> <second> <second> …
```

Ask for frames at the start and middle of every scene and at each key word.
It writes `out/stills/<id>/sheet.jpg`; look at it and fix before rendering:
legibility, nothing covering faces, nothing in the header or lyrics area,
same characters throughout, no literal labels, the lyric shown matches the
audio moment.

## 6. Render and report

```bash
npm run render -- <id>
```

Output: `out/<id>.mp4`, 1080x1920, 30 fps, H.264 + AAC. Check its duration
with `ffprobe` and report to the user: file path, length, the excerpt used,
the story in two or three sentences, and every timing you estimated or lyric
doubt you found. Say that you checked still frames, not the playing video.
