# Animated Lyric Video Kit

Vertical animated lyric videos for YouTube Shorts, Instagram Reels and TikTok, made with [Remotion](https://www.remotion.dev): a short drawn story that follows the song, with the lyrics shown line by line right below it and the sung word highlighted.

It ships with a drawing kit (characters, settings, objects), scripts that turn an audio file and its lyrics into word-timed karaoke, and a [Claude Code](https://claude.com/claude-code) skill that walks through the whole process.

**[English](#english) · [Español](#español)**

---

## English

### What you get

- **A video shell** (`src/kit/LyricVideo.tsx`): audio excerpt with fades, scenes with crossfades, artist and title header, karaoke lyrics, credit line and social handles. 1080x1920, 30 fps.
- **A drawing kit** (`src/kit/`): two characters with posable arms, walk cycle and kiss, a dog, nine settings (harbour, orchard, rooftops, balcony, bar, inferno, whitewashed wall, train station, wasteland) and objects such as a boat, train, car, suitcase, photo, hearts, lips and flowers. All flat SVG, animated from the song time.
- **Scripts**: create a song, transcribe it with Whisper, align your lyrics to the audio, render check frames as a contact sheet, and render the final MP4.
- **A Claude Code skill** (`.claude/skills/animated-lyric-video/`) with the method and the style rules.

### Requirements

- [Node.js](https://nodejs.org) 18 or newer (tested with 22).
- Python 3.9 or newer, with one Whisper engine:
  - Apple Silicon Mac: `mlx-whisper` (tested).
  - Any other system: `faster-whisper` (supported by the script but not tested yet).
- [ffmpeg](https://ffmpeg.org) (optional): reads the audio length and builds contact sheets.

### Setup

```bash
git clone https://github.com/fransierra97/animated-lyric-video-kit.git animated-lyric-video-kit
cd animated-lyric-video-kit
npm install

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # edit it first if you are not on an Apple Silicon Mac
```

Check it works: `npm start` opens Remotion Studio. The `kit-gallery` composition shows every piece of the kit with its name.

### Make a video

**1. Create the song.** Use a kebab-case id; it becomes the composition id and the file name.

```bash
npm run new-song -- my-song --audio ~/Music/my-song.mp3 --title "My Song" --artist "ARTIST" --credit "Words and music: Name Surname"
```

This creates `src/songs/my-song/`, copies the audio to `public/` and registers the video.

**2. Paste the lyrics** into `src/songs/my-song/lyrics.txt`: one screen line per line, in the order they are sung, writing repeated choruses out again. Two to seven words per line read well under the animation.

**3. Transcribe** (the first run downloads the Whisper model):

```bash
python scripts/transcribe.py public/my-song.mp3 src/songs/my-song/transcription.json --language en
```

**4. Choose the excerpt.** Set `start` and `end` (seconds) in `src/songs/my-song/config.ts`. Begin 2–3 s before the first line you keep, so there is room for a cover, and end after a complete phrase plus about 1.5 s for the fade. Social handles go in `social` in the same file.

**5. Align the lyrics** to the audio:

```bash
python scripts/align.py src/songs/my-song
```

It writes `lyrics.ts` and lists the lines to check by ear. Whisper often skips sung lines; when it does, the script estimates their timing from the gap around them. You can fix any word by hand in `lyrics.ts`: every row is `[word, start, end]`.

**6. Tell the story** in `src/songs/my-song/scenes.tsx` (see [Writing scenes](#writing-scenes)), and check it with still frames at any song seconds:

```bash
npm run stills -- my-song 12 14.5 18 22
```

Frames and a contact sheet (`sheet.jpg`) land in `out/stills/my-song/`. `npm start` lets you scrub the video in Remotion Studio.

**7. Render:**

```bash
npm run render -- my-song
```

The result is `out/my-song.mp4` (H.264, AAC, 1080x1920), ready to upload.

### With Claude Code

Open the folder in Claude Code and ask for it, for example: *"Make an animated lyric video of ~/Music/my-song.mp3, max 60 seconds. Here are the lyrics: …"*. The `animated-lyric-video` skill loads automatically and follows the steps above: it writes a beat sheet, codes the scenes, checks still frames and renders.

To use the skill from any folder, copy `.claude/skills/animated-lyric-video` into `~/.claude/skills/`. It still needs this repository's code to render.

### Writing scenes

A scene is a React component that receives `t` (the current song second) and draws on a 1080x1920 SVG canvas. Keep the drawing between y≈300 and y≈1100: the header sits above and the lyrics start at y≈1150.

```tsx
const Meeting: Escena = ({t}) => {
  const k = u(t, 31.2, 33.0); // goes 0 → 1 between those song seconds
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
  {at: 30.9, C: Meeting}, // each scene lasts until the next one starts
];
```

Style rules that make these videos work:

- **Suggest, don't illustrate word by word.** No on-screen words or sound effects that repeat the lyrics: no signs, labels, speech bubbles or "WOOF". Tell it with action, objects, light and recurring motifs.
- **One story, one cast.** Same characters and a few recurring settings from start to end.
- **Hit the key words.** Time pops and impacts to the start of the important word.
- **Always moving.** No frame still for more than about a second.

### Kit glossary

The kit's names are in Spanish.

| Name | Meaning |
|---|---|
| `Persona tipo="el" / "ella"` | Character: him / her |
| `pose.bd`, `pose.bt` | Front / back arm `[shoulder°, elbow°]` |
| `mira`, `inclina`, `cabeza` | Facing (1 right, -1 left), lean, head tilt |
| `paso`, `zancada` | Walk phase, stride |
| `ojo`, `beso`, `sonrojo` | Eyes (`abierto` / `cerrado`), kiss mark, blush |
| `enMano` | Object held in the front hand |
| `Pareja` (`k` 0 → 1) | Couple walking together into a kiss |
| `Perro` | Dog |
| `FondoPuerto`, `FondoHuerto`, `FondoTejados` | Harbour, orchard, rooftops |
| `FachadaFondo` + `FachadaFrente` | Façade with balcony (back and front layers) |
| `FondoBar`, `FondoInfierno`, `FondoTapia` | Bar, inferno, whitewashed wall |
| `FondoEstacion`, `FondoDescampado` | Train station, wasteland |
| `Barco`, `Tren`, `Humo`, `Coche` | Boat, train, smoke, car |
| `Casa`, `Arbol`, `Banco`, `Maleta` | House, tree, bench, suitcase |
| `Corazon`, `Labios`, `Flor`, `Manzana`, `Anillo` | Heart, lips, flower, apple, ring |
| `Estallido`, `Flotantes`, `Destello` | Burst, floating hearts, sparkle |
| `Cielo`, `Luna`, `Estrellas`, `Mar`, `Gaviota` | Sky, moon, stars, sea, seagull |
| `Lienzo`, `Escena` | Canvas, scene |
| `u`, `lerp`, `eo` / `ei` / `eio`, `pop`, `sacudida` | Progress, interpolation, easings, pop-in, shake |

### Project layout

```
src/kit/            LyricVideo shell, drawing kit, settings, gallery
src/songs/_template Template copied by new-song
src/songs/<id>/     One folder per song: config, lyrics, scenes
src/songs/index.ts  Song registry
scripts/            new-song, transcribe, align, stills, render
public/             Audio files
.claude/skills/     Claude Code skill
```

### Rights and licences

- This kit's code is under the [MIT licence](LICENSE).
- Remotion has its own licence: free for individuals, for-profit organisations with up to 3 employees, and non-profits; larger companies need a company licence. Read the [Remotion licence](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) before using it commercially.
- The fonts (Kalam and Unbounded) are loaded from Google Fonts and are under the SIL Open Font License.
- Only make videos of songs you own or have permission to use. `.gitignore` keeps `public/` and your song folders out of the repository so audio and lyrics are not published by accident.

---

## Español

### Qué incluye

- **Un armazón de video** (`src/kit/LyricVideo.tsx`): fragmento de audio con fundidos, escenas con transición, cabecera con artista y título, letra tipo karaoke, crédito y redes sociales. 1080x1920, 30 fps.
- **Un kit de dibujo** (`src/kit/`): dos personajes con brazos articulados, paso al andar y beso, un perro, nueve escenarios (puerto, huerto, tejados, balcón, bar, infierno, tapia encalada, estación de tren y descampado) y objetos como barco, tren, coche, maleta, foto, corazones, labios y flores. Todo en SVG plano, animado con el tiempo de la canción.
- **Scripts**: crear una canción, transcribirla con Whisper, alinear tu letra con el audio, sacar fotogramas de control en una hoja de contactos y renderizar el MP4 final.
- **Una skill para Claude Code** (`.claude/skills/animated-lyric-video/`) con el método y los criterios de estilo.

### Requisitos

- [Node.js](https://nodejs.org) 18 o superior (probado con la 22).
- Python 3.9 o superior, con un motor de Whisper:
  - Mac con Apple Silicon: `mlx-whisper` (probado).
  - Cualquier otro sistema: `faster-whisper` (el script lo admite, pero aún no está probado).
- [ffmpeg](https://ffmpeg.org) (opcional): lee la duración del audio y monta las hojas de contactos.

### Instalación

```bash
git clone https://github.com/fransierra97/animated-lyric-video-kit.git animated-lyric-video-kit
cd animated-lyric-video-kit
npm install

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # edítalo antes si no usas un Mac con Apple Silicon
```

Comprueba que funciona: `npm start` abre Remotion Studio. La composición `kit-gallery` enseña todas las piezas del kit con su nombre.

### Hacer un video

**1. Crea la canción.** Usa un identificador en minúsculas y con guiones; será el nombre de la composición y del archivo.

```bash
npm run new-song -- mi-cancion --audio ~/Music/mi-cancion.mp3 --title "Mi canción" --artist "ARTISTA" --credit "Letra y música: Nombre Apellido"
```

Crea `src/songs/mi-cancion/`, copia el audio a `public/` y registra el video.

**2. Pega la letra** en `src/songs/mi-cancion/lyrics.txt`: una línea de pantalla por línea, en el orden en que se canta, repitiendo los estribillos. De dos a siete palabras por línea se leen bien bajo la animación.

**3. Transcribe** (la primera vez descarga el modelo de Whisper):

```bash
python scripts/transcribe.py public/mi-cancion.mp3 src/songs/mi-cancion/transcription.json --language es
```

**4. Elige el fragmento.** Pon `start` y `end` (en segundos) en `src/songs/mi-cancion/config.ts`. Empieza 2–3 s antes del primer verso que uses, para dejar sitio a una portada, y termina tras una frase completa más 1,5 s para el fundido. Las redes van en `social`, en el mismo archivo.

**5. Alinea la letra** con el audio:

```bash
python scripts/align.py src/songs/mi-cancion
```

Escribe `lyrics.ts` y te dice qué versos conviene revisar de oído. Whisper a menudo se salta versos cantados; cuando pasa, el script calcula sus tiempos a partir del hueco que dejan. Puedes corregir cualquier palabra a mano en `lyrics.ts`: cada fila es `[palabra, inicio, fin]`.

**6. Cuenta la historia** en `src/songs/mi-cancion/scenes.tsx` (ver [Escribir escenas](#escribir-escenas)) y compruébala con fotogramas en los segundos que quieras:

```bash
npm run stills -- mi-cancion 12 14.5 18 22
```

Los fotogramas y una hoja de contactos (`sheet.jpg`) quedan en `out/stills/mi-cancion/`. Con `npm start` puedes recorrer el video en Remotion Studio.

**7. Renderiza:**

```bash
npm run render -- mi-cancion
```

El resultado es `out/mi-cancion.mp4` (H.264, AAC, 1080x1920), listo para subir.

### Con Claude Code

Abre la carpeta en Claude Code y pídelo, por ejemplo: *"Haz un video animado con la letra de ~/Music/mi-cancion.mp3, de 60 segundos como máximo. Esta es la letra: …"*. La skill `animated-lyric-video` se carga sola y sigue los pasos de arriba: escribe un guion por versos, programa las escenas, revisa fotogramas y renderiza.

Para usar la skill desde cualquier carpeta, copia `.claude/skills/animated-lyric-video` en `~/.claude/skills/`. Para renderizar sigue necesitando el código de este repositorio.

### Escribir escenas

Una escena es un componente de React que recibe `t` (el segundo actual de la canción) y dibuja en un lienzo SVG de 1080x1920. Mantén el dibujo entre y≈300 e y≈1100: arriba va la cabecera y la letra empieza en y≈1150.

```tsx
const Encuentro: Escena = ({t}) => {
  const k = u(t, 31.2, 33.0); // pasa de 0 a 1 entre esos dos segundos
  return (
    <Lienzo>
      <FondoPuerto t={t} id="encuentro-cielo" pal={PAL.noche} />
      <Pareja x={540} y={MUELLE_Y} s={1.45} k={k} t={t} />
      <Corazon x={540} y={420} s={pop(t, 33.0)} />
    </Lienzo>
  );
};

export const SCENES = [
  {at: CONFIG.start, C: Cover},
  {at: 30.9, C: Encuentro}, // cada escena dura hasta que empieza la siguiente
];
```

Criterios de estilo que hacen que funcionen:

- **Sugerir, no ilustrar palabra por palabra.** Nada de textos ni onomatopeyas en pantalla que repitan la letra: ni carteles, ni rótulos, ni bocadillos, ni «¡GUAU!». Cuéntalo con acciones, objetos, luz y motivos que se repiten.
- **Una historia, unos personajes.** Los mismos personajes y pocos escenarios recurrentes de principio a fin.
- **Marcar las palabras clave.** Los golpes y apariciones, justo al empezar la palabra importante.
- **Siempre en movimiento.** Ningún plano quieto más de un segundo.

### Glosario del kit

Los nombres del kit están en español; la tabla de equivalencias en inglés está en el [glosario de la sección en inglés](#kit-glossary).

### Estructura

```
src/kit/            Armazón LyricVideo, kit de dibujo, escenarios y galería
src/songs/_template Plantilla que copia new-song
src/songs/<id>/     Una carpeta por canción: config, letra, escenas
src/songs/index.ts  Registro de canciones
scripts/            new-song, transcribe, align, stills, render
public/             Audios
.claude/skills/     Skill de Claude Code
```

### Derechos y licencias

- El código de este kit tiene licencia [MIT](LICENSE).
- Remotion tiene su propia licencia: es gratuito para particulares, empresas con ánimo de lucro de hasta 3 empleados y organizaciones sin ánimo de lucro; las empresas más grandes necesitan una licencia de empresa. Lee la [licencia de Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) antes de usarlo con fines comerciales.
- Las fuentes (Kalam y Unbounded) se cargan desde Google Fonts y tienen licencia SIL Open Font License.
- Haz videos solo de canciones que sean tuyas o para las que tengas permiso. El `.gitignore` deja fuera del repositorio `public/` y las carpetas de tus canciones, para que no publiques audio ni letras por error.
