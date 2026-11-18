import type {LyricVideoProps} from './kit/LyricVideo';

/** Everything a song folder exports (src/songs/<id>/index.ts). */
export type SongDefinition = LyricVideoProps & {
  /** Composition id; also the output file name. Use kebab-case. */
  id: string;
};
