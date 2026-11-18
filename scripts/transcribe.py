"""Transcribe a song with word timestamps (Whisper).

    python scripts/transcribe.py <audio> <out.json> [--language es] [--engine auto|mlx|faster] [--model NAME]

Engines (install one, see requirements.txt):
  mlx     mlx-whisper, Apple Silicon Macs. Default model: mlx-community/whisper-large-v3-turbo
  faster  faster-whisper, any system (CPU or NVIDIA GPU). Default model: large-v3
"auto" uses mlx if it is installed, otherwise faster.

The output keeps Whisper's shape: {"text", "language", "segments": [{"start",
"end", "text", "words": [{"word", "start", "end"}]}]}. Whisper often mishears
sung lyrics; that is fine, scripts/align.py matches its timings against your
real lyrics.
"""
import argparse
import importlib.util
import json
import sys


def with_mlx(audio, language, model):
    import mlx_whisper

    result = mlx_whisper.transcribe(
        audio,
        path_or_hf_repo=model or "mlx-community/whisper-large-v3-turbo",
        word_timestamps=True,
        language=language,
    )
    segments = [
        {
            "start": s["start"],
            "end": s["end"],
            "text": s["text"],
            "words": [{"word": w["word"], "start": w["start"], "end": w["end"]} for w in s.get("words", [])],
        }
        for s in result["segments"]
    ]
    return {"text": result.get("text", ""), "language": result.get("language", language), "segments": segments}


def with_faster(audio, language, model):
    from faster_whisper import WhisperModel

    whisper = WhisperModel(model or "large-v3", device="auto", compute_type="auto")
    found, info = whisper.transcribe(audio, language=language, word_timestamps=True)
    segments = []
    for s in found:
        segments.append(
            {
                "start": s.start,
                "end": s.end,
                "text": s.text,
                "words": [{"word": w.word, "start": w.start, "end": w.end} for w in (s.words or [])],
            }
        )
        print(f"  {s.start:7.2f}  {s.text.strip()}", file=sys.stderr)
    return {"text": " ".join(x["text"] for x in segments), "language": info.language, "segments": segments}


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("audio")
    p.add_argument("out")
    p.add_argument("--language", default=None, help="language code, e.g. es, en (default: detect)")
    p.add_argument("--engine", choices=["auto", "mlx", "faster"], default="auto")
    p.add_argument("--model", default=None)
    a = p.parse_args()

    engine = a.engine
    if engine == "auto":
        if importlib.util.find_spec("mlx_whisper"):
            engine = "mlx"
        elif importlib.util.find_spec("faster_whisper"):
            engine = "faster"
        else:
            sys.exit("No Whisper engine found. Install one: pip install mlx-whisper (Apple Silicon) or pip install faster-whisper")

    print(f"Transcribing {a.audio} with {engine}… (the first run downloads the model)", file=sys.stderr)
    data = with_mlx(a.audio, a.language, a.model) if engine == "mlx" else with_faster(a.audio, a.language, a.model)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    words = sum(len(s["words"]) for s in data["segments"])
    print(f"Wrote {a.out}: {len(data['segments'])} segments, {words} words.", file=sys.stderr)


if __name__ == "__main__":
    main()
