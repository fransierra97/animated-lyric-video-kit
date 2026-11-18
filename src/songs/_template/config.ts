// Song settings. Edit freely; `npm run new-song` fills them in.
import type {SocialHandle} from '../../kit/LyricVideo';

export const CONFIG = {
  id: 'my-song',
  /** Audio file inside public/. */
  audio: 'my-song.mp3',
  /** Excerpt of the song used by the video, in seconds of the audio file. */
  start: 0,
  end: 60,
  title: 'Song title',
  artist: 'ARTIST',
  credit: 'Words and music: Name Surname',
  social: [] as SocialHandle[],
};
