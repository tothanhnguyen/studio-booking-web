#!/usr/bin/env python3
"""Batch re-matte the 96-frame MowStudio hero sequence onto warm off-white."""

from __future__ import annotations

import argparse
from io import BytesIO
from pathlib import Path

import numpy as np

# Compatibility aliases for the bundled pymatting/scipy combination.
np.long = np.int_  # type: ignore[attr-defined]
np.ulong = np.uint  # type: ignore[attr-defined]

from PIL import Image, ImageFilter
from rembg import new_session, remove


TARGET_RGB = (243, 241, 236)


def as_mask(result: bytes | Image.Image) -> Image.Image:
    image = result if isinstance(result, Image.Image) else Image.open(BytesIO(result))
    return image.convert("L").filter(ImageFilter.GaussianBlur(0.55))


def composite_frame(
    source_path: Path,
    output_path: Path,
    mask_path: Path,
    session: object,
) -> float:
    source = Image.open(source_path).convert("RGB")
    mask = as_mask(remove(source, session=session, only_mask=True, post_process_mask=True))
    coverage = float(np.asarray(mask, dtype=np.float32).mean() / 255.0)
    if not 0.12 <= coverage <= 0.68:
        raise RuntimeError(f"Suspicious matte coverage {coverage:.3f}: {source_path.name}")

    background = Image.new("RGB", source.size, TARGET_RGB)
    output = Image.composite(source, background, mask)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    mask_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(output_path, "WEBP", quality=90, method=6)
    mask.save(mask_path, "PNG", optimize=True)
    return coverage


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("mask_dir", type=Path)
    parser.add_argument("poster_output", type=Path)
    args = parser.parse_args()

    frames = sorted(args.input_dir.glob("frame-*.webp"))
    if len(frames) != 96:
        raise RuntimeError(f"Expected 96 frames, found {len(frames)}")

    session = new_session("u2net")
    coverages: list[float] = []
    for index, frame in enumerate(frames, start=1):
        output = args.output_dir / frame.name
        mask_output = args.mask_dir / f"{frame.stem}.png"
        coverage = composite_frame(frame, output, mask_output, session)
        coverages.append(coverage)
        print(f"[{index:02d}/96] {frame.name} coverage={coverage:.3f}", flush=True)

    poster_source = args.output_dir / "frame-0001.webp"
    args.poster_output.parent.mkdir(parents=True, exist_ok=True)
    args.poster_output.write_bytes(poster_source.read_bytes())
    print(
        f"complete frames=96 coverage_min={min(coverages):.3f} "
        f"coverage_max={max(coverages):.3f}",
        flush=True,
    )


if __name__ == "__main__":
    main()
