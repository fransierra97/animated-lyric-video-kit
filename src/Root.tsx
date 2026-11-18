import React from 'react';
import {Composition} from 'remotion';
import {FPS, LyricVideo} from './kit/LyricVideo';
import {KitGallery, GALLERY_SECONDS} from './kit/Gallery';
import {SONGS} from './songs';

// One component per song, built once. Scenes are React components and
// Remotion serialises defaultProps to JSON, so they cannot travel as props.
// Only `start` is passed as a prop (scripts/stills.mjs reads it).
const VIDEOS = SONGS.map(({id, ...props}) => ({
  id,
  seconds: props.end - props.start,
  start: props.start,
  Component: (() => <LyricVideo {...props} />) as React.FC<{start: number}>,
}));

export const RemotionRoot: React.FC = () => (
  <>
    {/* Every piece of the kit, to browse in Remotion Studio */}
    <Composition id="kit-gallery" component={KitGallery} width={1080} height={1920} fps={FPS} durationInFrames={GALLERY_SECONDS * FPS} />
    {VIDEOS.map(({id, seconds, start, Component}) => (
      <Composition
        key={id}
        id={id}
        component={Component}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={Math.max(1, Math.round(seconds * FPS))}
        defaultProps={{start}}
      />
    ))}
  </>
);
