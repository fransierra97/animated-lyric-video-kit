// Renders check frames at given song seconds and, if ffmpeg is installed,
// joins them into one contact sheet so you can review a whole stretch at once.
//
//   npm run stills -- <composition-id> <second> [<second> ...] [--scale 0.4] [--out out/stills/<id>]
//
// Seconds are song seconds (the same numbers as in lyrics.ts and scenes.tsx).
// For kit-gallery they are seconds from the start of the composition.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const scale = Number(opt('--scale', '0.4'));
const outArg = opt('--out', null);
const [id, ...times] = args;
if (!id || times.length === 0) {
  console.error('Usage: npm run stills -- <composition-id> <second> [<second> ...] [--scale 0.4] [--out dir]');
  process.exit(1);
}
const outDir = outArg ?? path.join('out', 'stills', id);
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id});
const start = Number(composition.props?.start ?? 0);
const files = [];
for (const value of times) {
  const t = Number(value);
  const frame = Math.min(composition.durationInFrames - 1, Math.max(0, Math.round((t - start) * composition.fps)));
  const output = path.join(outDir, `t-${t.toFixed(2).padStart(7, '0')}.jpg`);
  await renderStill({composition, serveUrl, frame, output, scale, imageFormat: 'jpeg', jpegQuality: 88});
  files.push(output);
  console.log('still', output);
}

try {
  const cols = Math.min(files.length, 8);
  const rows = Math.ceil(files.length / cols);
  const sheet = path.join(outDir, 'sheet.jpg');
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    ...files.flatMap((f) => ['-i', f]),
    '-filter_complex',
    `${files.map((_, i) => `[${i}:v]`).join('')}xstack=inputs=${files.length}:layout=${files
      .map((_, i) => `${(i % cols) === 0 ? '0' : Array.from({length: i % cols}, () => 'w0').join('+')}_${Math.floor(i / cols) === 0 ? '0' : Array.from({length: Math.floor(i / cols)}, () => 'h0').join('+')}`)
      .join('|')}:fill=black`,
    '-frames:v', '1', sheet,
  ].concat(files.length === 1 ? [] : []), {stdio: 'inherit'});
  console.log(`sheet ${sheet} (${cols}x${rows})`);
} catch {
  console.log('(ffmpeg not found or failed: individual stills are in', outDir + ')');
}
