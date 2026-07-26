#!/usr/bin/env python3
"""Stabilize per-frame mattes with optical-flow-aligned temporal consensus."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


TARGET_RGB = np.array([243, 241, 236], dtype=np.float32)
FLOW_WIDTH = 360
RADIUS = 2


def load_rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"))


def load_mask(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("L"), dtype=np.float32)


def align_mask(current_rgb: np.ndarray, neighbor_rgb: np.ndarray, neighbor_mask: np.ndarray) -> np.ndarray:
    height, width = current_rgb.shape[:2]
    scale = FLOW_WIDTH / width
    small_size = (FLOW_WIDTH, max(1, round(height * scale)))
    current_gray = cv2.cvtColor(cv2.resize(current_rgb, small_size), cv2.COLOR_RGB2GRAY)
    neighbor_gray = cv2.cvtColor(cv2.resize(neighbor_rgb, small_size), cv2.COLOR_RGB2GRAY)
    flow = cv2.calcOpticalFlowFarneback(
        current_gray,
        neighbor_gray,
        None,
        pyr_scale=0.5,
        levels=4,
        winsize=25,
        iterations=4,
        poly_n=7,
        poly_sigma=1.5,
        flags=0,
    )
    flow = cv2.resize(flow, (width, height), interpolation=cv2.INTER_LINEAR)
    flow[..., 0] *= width / small_size[0]
    flow[..., 1] *= height / small_size[1]
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    return cv2.remap(
        neighbor_mask,
        xx + flow[..., 0],
        yy + flow[..., 1],
        interpolation=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0,
    )


def fill_enclosed_holes(mask: np.ndarray) -> np.ndarray:
    solid = (mask >= 32).astype(np.uint8) * 255
    flood = solid.copy()
    flood_buffer = np.zeros((solid.shape[0] + 2, solid.shape[1] + 2), dtype=np.uint8)
    cv2.floodFill(flood, flood_buffer, (0, 0), 255)
    holes = cv2.bitwise_not(flood)
    holes = cv2.dilate(holes, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    return np.maximum(mask, holes.astype(np.float32))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("mask_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("poster_output", type=Path)
    args = parser.parse_args()

    frames = sorted(args.source_dir.glob("frame-*.webp"))
    masks = sorted(args.mask_dir.glob("frame-*.png"))
    if len(frames) != 96 or len(masks) != 96:
        raise RuntimeError(f"Expected 96 frames/masks, found {len(frames)}/{len(masks)}")

    rgb_cache: dict[int, np.ndarray] = {}
    mask_cache: dict[int, np.ndarray] = {}

    def rgb_at(index: int) -> np.ndarray:
        if index not in rgb_cache:
            rgb_cache[index] = load_rgb(frames[index])
        return rgb_cache[index]

    def mask_at(index: int) -> np.ndarray:
        if index not in mask_cache:
            mask_cache[index] = load_mask(masks[index])
        return mask_cache[index]

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(frames):
        current = rgb_at(index)
        current_mask = mask_at(index)
        aligned = [current_mask]
        for neighbor_index in range(max(0, index - RADIUS), min(len(frames), index + RADIUS + 1)):
            if neighbor_index == index:
                continue
            aligned.append(align_mask(current, rgb_at(neighbor_index), mask_at(neighbor_index)))

        consensus = np.percentile(np.stack(aligned), 75, axis=0)
        repaired_mask = np.maximum(current_mask, consensus)
        repaired_mask = fill_enclosed_holes(repaired_mask)
        repaired_mask = cv2.GaussianBlur(repaired_mask, (0, 0), 0.35)
        alpha = np.clip(repaired_mask / 255.0, 0.0, 1.0)[..., None]
        output = current.astype(np.float32) * alpha + TARGET_RGB * (1.0 - alpha)
        output_path = args.output_dir / frame.name
        Image.fromarray(np.clip(output, 0, 255).astype(np.uint8)).save(
            output_path,
            "WEBP",
            quality=90,
            method=6,
        )
        coverage = float(repaired_mask.mean() / 255.0)
        print(f"[{index + 1:02d}/96] {frame.name} repaired_coverage={coverage:.3f}", flush=True)

        for cached_index in list(rgb_cache):
            if cached_index < index - RADIUS:
                rgb_cache.pop(cached_index, None)
                mask_cache.pop(cached_index, None)

    args.poster_output.parent.mkdir(parents=True, exist_ok=True)
    args.poster_output.write_bytes((args.output_dir / "frame-0001.webp").read_bytes())
    print("complete frames=96", flush=True)


if __name__ == "__main__":
    main()
