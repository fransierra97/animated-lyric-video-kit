// Renders a song to out/<id>.mp4 with settings that upload cleanly to
// Shorts, Reels and TikTok (H.264, yuv420p, BT.709, AAC 256 kb/s).
//
//   npm run render -- <composition-id>
import {spawnSync} from 'node:child_process';

const [id] = process.argv.slice(2);
if (!id) {
  console.error('Usage: npm run render -- <composition-id>');
  process.exit(1);
}
const result = spawnSync(
  'npx',
  [
    'remotion', 'render', 'src/index.ts', id, `out/${id}.mp4`,
    '--codec=h264', '--crf=17', '--image-format=png', '--pixel-format=yuv420p',
    '--color-space=bt709', '--audio-bitrate=256k',
  ],
  {stdio: 'inherit'},
);
process.exit(result.status ?? 1);
