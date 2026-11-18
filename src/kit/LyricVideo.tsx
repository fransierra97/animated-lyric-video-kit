// LyricVideo: the shared shell of every video. Audio, scenes with short
// crossfades, header (artist + title), karaoke lyrics right below the
// animation, credit line, social handles and a fade to black.
// Vertical 1080x1920 (Shorts / Reels / TikTok).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {KaraokeWord} from '../types';
import {clamp, fuenteArtista, fuenteLetra, u, type Escena} from './kit';

export const FPS = 30;

/** Crossfade between scenes, in seconds (each side). */
const CROSSFADE = 0.12;

const InstagramIcon: React.FC<{size: number}> = ({size}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
  </svg>
);

const YouTubeIcon: React.FC<{size: number}> = ({size}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
  </svg>
);

export type SocialHandle = {network?: 'instagram' | 'youtube'; handle: string};

export type SceneEntry = {
  /** Song second where the scene starts. It lasts until the next one. */
  at: number;
  C: Escena;
};

export type LyricVideoProps = {
  /** Audio file inside public/. */
  audio: string;
  /** Song excerpt used by the video, in seconds of the audio file. */
  start: number;
  end: number;
  lyrics: KaraokeWord[][];
  scenes: SceneEntry[];
  title: string;
  artist: string;
  credit?: string;
  social?: SocialHandle[];
  /** Song second where the header appears (after the cover scene). */
  headerFrom?: number;
  /** Colour of the word being sung. */
  accent?: string;
};

const Pill: React.FC<{item: SocialHandle}> = ({item}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 26px',
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.45)',
      color: '#ffffff',
      fontFamily: '-apple-system, "Helvetica Neue", Arial, sans-serif',
      fontSize: 32,
      fontWeight: 600,
      letterSpacing: 0.5,
    }}
  >
    {item.network === 'instagram' ? <InstagramIcon size={38} /> : null}
    {item.network === 'youtube' ? <YouTubeIcon size={38} /> : null}
    {item.handle}
  </div>
);

export const LyricVideo: React.FC<LyricVideoProps> = ({
  audio,
  start,
  end,
  lyrics,
  scenes,
  title,
  artist,
  credit,
  social = [],
  headerFrom,
  accent = '#ffd166',
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = start + frame / FPS;

  const volume = (f: number) =>
    interpolate(f, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(f, [durationInFrames - 54, durationInFrames - 1], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  // Active lyric line: the last one that has already started
  let idx = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].length && t >= lyrics[i][0].start - 0.3) idx = i;
  }
  const line = idx >= 0 ? lyrics[idx] : null;
  let lineOpacity = 0;
  let lineY = 0;
  if (line) {
    const lineStart = line[0].start;
    const lineEnd = line[line.length - 1].end;
    lineOpacity = u(t, lineStart - 0.3, lineStart - 0.05) * (1 - u(t, lineEnd + 0.45, lineEnd + 0.8));
    lineY = 26 * (1 - u(t, lineStart - 0.3, lineStart - 0.02));
  }

  const from = headerFrom ?? (scenes.length > 1 ? scenes[1].at - 0.3 : start);
  const header = u(t, from, from + 0.6);
  const black = u(t, end - 1.3, end - 0.05);

  return (
    <AbsoluteFill style={{backgroundColor: '#0a0d24'}}>
      <Audio
        src={staticFile(audio)}
        startFrom={Math.round(start * FPS)}
        endAt={Math.round(end * FPS)}
        volume={volume}
      />

      {/* Scenes */}
      {scenes.map(({at, C}, i) => {
        const next = i + 1 < scenes.length ? scenes[i + 1].at : end + 1;
        if (t < at - CROSSFADE || t >= next + CROSSFADE) return null;
        const opacity = i === 0 ? 1 : clamp((t - (at - CROSSFADE)) / (2 * CROSSFADE));
        return (
          <AbsoluteFill key={i} style={{opacity}}>
            <C t={t} />
          </AbsoluteFill>
        );
      })}

      {/* Top and bottom shade so header and lyrics are always readable */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,10,28,0.5) 0%, rgba(8,10,28,0) 17%, rgba(8,10,28,0) 54%, rgba(8,10,28,0.8) 63%, rgba(8,10,28,0.94) 100%)',
        }}
      />

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: header * 0.92,
        }}
      >
        <div
          style={{
            fontFamily: fuenteArtista,
            fontWeight: 900,
            fontSize: 80,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            textShadow: '0 4px 24px rgba(0,0,0,0.75)',
          }}
        >
          {artist}
        </div>
        <div
          style={{
            fontFamily: fuenteLetra,
            fontWeight: 700,
            fontSize: 52,
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 2px 14px rgba(0,0,0,0.8)',
          }}
        >
          {title}
        </div>
      </div>

      {/* Lyrics, right below the animation */}
      <div
        style={{
          position: 'absolute',
          top: 1150,
          left: 0,
          width: '100%',
          height: 260,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {line ? (
          <div
            style={{
              opacity: lineOpacity,
              transform: `translateY(${lineY}px)`,
              maxWidth: 900,
              textAlign: 'center',
              textWrap: 'balance',
              fontFamily: fuenteLetra,
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.16,
            }}
          >
            {line.map((w, i) => {
              const reached = u(t, w.start - 0.04, w.start + 0.1);
              const passed = u(t, w.end, w.end + 0.25);
              const active = reached * (1 - passed);
              return (
                <React.Fragment key={i}>
                  {i > 0 ? ' ' : null}
                  <span
                    style={{
                      display: 'inline-block',
                      color: active > 0.5 ? accent : '#ffffff',
                      opacity: 0.5 + 0.5 * reached,
                      transform: `translateY(${-6 * active}px) scale(${1 + 0.07 * active})`,
                      textShadow: '0 4px 18px rgba(0,0,0,0.85)',
                    }}
                  >
                    {w.text}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Credit and social handles */}
      {credit ? (
        <div
          style={{
            position: 'absolute',
            bottom: social.length ? 418 : 340,
            width: '100%',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.72)',
            fontFamily: fuenteLetra,
            fontSize: 32,
            fontWeight: 700,
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          }}
        >
          {credit}
        </div>
      ) : null}
      {social.length ? (
        <div
          style={{
            position: 'absolute',
            bottom: 320,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          {social.map((item, i) => (
            <Pill key={i} item={item} />
          ))}
        </div>
      ) : null}

      {/* Fade to black */}
      <AbsoluteFill style={{backgroundColor: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};
