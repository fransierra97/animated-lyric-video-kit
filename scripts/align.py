"""Align your real lyrics with Whisper's word timings and write lyrics.ts.

    python scripts/align.py src/songs/<id> [--start S] [--end E] [--lead 0.45]

Reads, from the song folder:
  lyrics.txt          your lyrics, one SCREEN line per line, in the order they
                      are sung (write repeated choruses again). Blank lines and
                      lines starting with # are ignored. Keep lines short:
                      about 2–7 words read well under the animation.
  transcription.json  output of scripts/transcribe.py
  config.ts           its `start` and `end` (the excerpt), unless you pass them

Writes lyrics.ts with one row per line: [word, start, end]. It is meant to be
hand-edited afterwards if a word lands early or late.

Notes:
- Words Whisper missed get times interpolated between their neighbours.
- Lines with no recognised word inside the excerpt are dropped (listed).
- Whisper tends to stretch the first word after a pause back into the
  silence; `--lead` caps how long the first word of a line can last.
"""
import argparse
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return "".join(c for c in w if c.isalnum())


def config_number(text, key):
    m = re.search(rf"\b{key}\s*:\s*([0-9.]+)", text)
    return float(m.group(1)) if m else None


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("song_dir")
    p.add_argument("--start", type=float)
    p.add_argument("--end", type=float)
    p.add_argument("--lead", type=float, default=0.45, help="max duration of a line's first word (s)")
    a = p.parse_args()

    d = Path(a.song_dir)
    config = (d / "config.ts").read_text(encoding="utf-8")
    start = a.start if a.start is not None else config_number(config, "start") or 0.0
    end = a.end if a.end is not None else config_number(config, "end")
    if end is None:
        sys.exit("No `end` in config.ts; pass --end")

    lines = [
        l.strip()
        for l in (d / "lyrics.txt").read_text(encoding="utf-8").splitlines()
        if l.strip() and not l.strip().startswith("#")
    ]
    if not lines:
        sys.exit(f"{d / 'lyrics.txt'} is empty: paste the lyrics first, one screen line per line.")

    data = json.loads((d / "transcription.json").read_text(encoding="utf-8"))
    pool = [
        {"text": w["word"].strip(), "start": float(w["start"]), "end": float(w["end"])}
        for s in data["segments"]
        for w in s.get("words", [])
        if w["word"].strip() and start - 1 <= float(w["start"]) <= end + 1
    ]

    tokens = [(li, tok) for li, line in enumerate(lines) for tok in line.split()]
    a_seq = [norm(t) for _, t in tokens]
    b_seq = [norm(w["text"]) for w in pool]
    sm = difflib.SequenceMatcher(None, a_seq, b_seq, autojunk=False)
    timed = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                timed[i1 + k] = pool[j1 + k]
        elif tag == "replace":
            used = set()
            for i in range(i1, i2):
                best_j, best_r = None, 0.0
                for j in range(j1, j2):
                    if j in used:
                        continue
                    r = difflib.SequenceMatcher(None, a_seq[i], b_seq[j]).ratio()
                    if r > best_r:
                        best_r, best_j = r, j
                if best_j is not None and best_r >= 0.55:
                    timed[i] = pool[best_j]
                    used.add(best_j)

    # Words with timing
    words = []
    for i, (li, tok) in enumerate(tokens):
        w = timed.get(i)
        words.append({"line": li, "text": tok, "ok": w is not None, "start": w["start"] if w else None, "end": w["end"] if w else None})
    by_line = [[w for w in words if w["line"] == li] for li in range(len(lines))]
    heard_in = [sum(w["ok"] for w in ws) for ws in by_line]

    # Lines with some words heard: interpolate the missing words between neighbours
    for i, w in enumerate(words):
        if w["ok"] or heard_in[w["line"]] == 0:
            continue
        prev = next((words[k] for k in range(i - 1, -1, -1) if words[k]["ok"]), None)
        nxt = next((words[k] for k in range(i + 1, len(words)) if words[k]["ok"]), None)
        ps = prev["end"] if prev else start
        ns = nxt["start"] if nxt else end
        w["start"], w["end"] = ps, min(ns, ps + 0.35)

    # Lines Whisper missed entirely: share out the gap between the lines
    # around them, by length. Lines at the edges of the excerpt are dropped.
    dropped, estimated = [], []
    li = 0
    while li < len(lines):
        if heard_in[li]:
            li += 1
            continue
        lj = li
        while lj < len(lines) and heard_in[lj] == 0:
            lj += 1
        run = list(range(li, lj))
        prev_end = by_line[li - 1][-1]["end"] if li > 0 and heard_in[li - 1] else None
        next_start = by_line[lj][0]["start"] if lj < len(lines) else None
        if prev_end is None or next_start is None or next_start - prev_end < 0.8 * len(run):
            dropped += run
        else:
            a0, a1 = prev_end + 0.3, next_start - 0.3
            weights = [sum(len(w["text"]) + 2 for w in by_line[k]) for k in run]
            total = sum(weights)
            cursor = a0
            for k, wk in zip(run, weights):
                span = (a1 - a0) * wk / total
                l0, l1 = cursor, cursor + span * 0.9
                chars = [len(w["text"]) + 1 for w in by_line[k]]
                c = l0
                for w, ch in zip(by_line[k], chars):
                    dur = (l1 - l0) * ch / sum(chars)
                    w["start"], w["end"] = c, c + dur
                    c += dur
                cursor += span
                estimated.append(k)
        li = lj

    rows, weak = [], []
    for li, ws in enumerate(by_line):
        if li in dropped:
            continue
        ok = heard_in[li]
        if ok and ok / len(ws) < 0.6:
            weak.append(f"{lines[li]}  ({ok}/{len(ws)} words heard)")
        first = ws[0]
        if first["end"] - first["start"] > a.lead:
            first["start"] = first["end"] - a.lead
        rows.append(ws)
    dropped = [lines[k] for k in dropped]
    weak += [f"{lines[k]}  (not heard: timing estimated)" for k in estimated]

    # Keep words in order and non-overlapping
    flat = [w for r in rows for w in r]
    for prev, cur in zip(flat, flat[1:]):
        if cur["start"] < prev["end"]:
            cur["start"] = prev["end"]
        if cur["end"] < cur["start"]:
            cur["end"] = cur["start"] + 0.05

    def q(s):
        return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"

    body = "\n".join(
        "  [" + ", ".join(f"[{q(w['text'])}, {w['start']:.2f}, {w['end']:.2f}]" for w in r) + "],"
        for r in rows
    )
    out = f"""// Lyrics with word timings. Generated by `scripts/align.py`; safe to edit by hand.
// One row per screen line: [word, start, end] in seconds of the audio file.
import type {{KaraokeWord}} from '../../types';

type Row = [string, number, number][];

const ROWS: Row[] = [
{body}
];

export const LYRICS: KaraokeWord[][] = ROWS.map((row) => row.map(([text, start, end]) => ({{text, start, end}})));
"""
    (d / "lyrics.ts").write_text(out, encoding="utf-8")

    total = sum(len(r) for r in rows)
    heard = sum(w["ok"] for r in rows for w in r)
    print(f"Wrote {d / 'lyrics.ts'}: {len(rows)} lines, {heard}/{total} words matched to the audio.")
    if dropped:
        print("\nDropped (outside the excerpt, or not heard at its edges):")
        for l in dropped:
            print("  -", l)
    if weak:
        print("\nCheck these timings by ear:")
        for l in weak:
            print("  -", l)
        print("\nTip: a bigger model often hears more, e.g. --model mlx-community/whisper-large-v3-mlx (mlx) or large-v3 (faster).")


if __name__ == "__main__":
    main()
