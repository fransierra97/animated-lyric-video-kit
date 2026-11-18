// Creates src/songs/<id>/ from the template, copies the audio into public/
// and registers the song in src/songs/index.ts.
//
//   npm run new-song -- <id> --audio <file> --title "Title" --artist "ARTIST" [--credit "Words and music: …"]
//
// <id>: kebab-case, e.g. my-song. It becomes the composition id and the
// output file name.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const audioIn = opt('--audio');
const title = opt('--title', 'Song title');
const artist = opt('--artist', 'ARTIST');
const credit = opt('--credit', '');
const [id] = args;

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};
if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail('Usage: npm run new-song -- <kebab-case-id> --audio <file> --title "…" --artist "…"');
if (!audioIn || !fs.existsSync(audioIn)) fail(`Audio file not found: ${audioIn}`);
const dir = path.join('src', 'songs', id);
if (fs.existsSync(dir)) fail(`${dir} already exists.`);

// 1. Audio into public/
const ext = path.extname(audioIn).toLowerCase() || '.mp3';
const audio = `${id}${ext}`;
fs.copyFileSync(audioIn, path.join('public', audio));

// 2. Duration (ffprobe if available) to propose an excerpt of up to 60 s
let duration = 60;
try {
  duration = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join('public', audio)])
      .toString()
      .trim(),
  );
} catch {
  console.log('(ffprobe not found: end set to 60 s, adjust it in config.ts)');
}
const end = Math.min(60, Math.floor(duration * 10) / 10);

// 3. Song folder from the template
fs.cpSync(path.join('src', 'songs', '_template'), dir, {recursive: true});
const configPath = path.join(dir, 'config.ts');
const q = (s) => JSON.stringify(s).slice(1, -1).replace(/'/g, "\\'");
let config = fs.readFileSync(configPath, 'utf8');
config = config
  .replace("id: 'my-song'", `id: '${id}'`)
  .replace("audio: 'my-song.mp3'", `audio: '${audio}'`)
  .replace('end: 60', `end: ${end}`)
  .replace("title: 'Song title'", `title: '${q(title)}'`)
  .replace("artist: 'ARTIST'", `artist: '${q(artist)}'`)
  .replace("credit: 'Words and music: Name Surname'", `credit: '${q(credit)}'`);
fs.writeFileSync(configPath, config);
fs.writeFileSync(path.join(dir, 'lyrics.txt'), '');

// 4. Register it
const registry = path.join('src', 'songs', 'index.ts');
const camel = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
let reg = fs.readFileSync(registry, 'utf8');
reg = reg
  .replace('// new-song:imports', `import {song as ${camel}} from './${id}';\n// new-song:imports`)
  .replace('  // new-song:entries', `  ${camel},\n  // new-song:entries`);
fs.writeFileSync(registry, reg);

console.log(`Created ${dir}/ and public/${audio} (song length ${duration.toFixed(1)} s; excerpt 0–${end} s).

Next:
  1. Paste the lyrics into ${dir}/lyrics.txt, one screen line per line.
  2. python scripts/transcribe.py public/${audio} ${dir}/transcription.json --language <es|en|…>
  3. python scripts/align.py ${dir}
  4. Write the story in ${dir}/scenes.tsx and check it with npm run stills -- ${id} <seconds…>
  5. npm run render -- ${id}`);
