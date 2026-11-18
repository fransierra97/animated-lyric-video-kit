import type {SongDefinition} from '../../song';
import {CONFIG} from './config';
import {LYRICS} from './lyrics';
import {SCENES} from './scenes';

export const song: SongDefinition = {
  ...CONFIG,
  lyrics: LYRICS,
  scenes: SCENES,
};
