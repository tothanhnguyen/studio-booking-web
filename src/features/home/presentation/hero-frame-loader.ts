import { getFrameUrl } from "./hero-frame-sequence";

export class HeroFrameLoader {
  private readonly frames = new Map<number, HTMLImageElement>();
  private readonly pending = new Map<number, Promise<HTMLImageElement>>();
  private disposed = false;

  get(index: number): HTMLImageElement | undefined {
    return this.frames.get(index);
  }

  getNearest(index: number): HTMLImageElement | undefined {
    let nearestDistance = Number.POSITIVE_INFINITY;
    let nearestFrame: HTMLImageElement | undefined;

    for (const [loadedIndex, frame] of this.frames) {
      const distance = Math.abs(loadedIndex - index);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestFrame = frame;
      }
    }

    return nearestFrame;
  }

  load(index: number, priority: "auto" | "high" = "auto"): Promise<HTMLImageElement> {
    const cached = this.frames.get(index);
    if (cached) {
      return Promise.resolve(cached);
    }

    const existing = this.pending.get(index);
    if (existing) {
      return existing;
    }

    const request = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = priority;
      image.onload = () => {
        if (!this.disposed) {
          this.frames.set(index, image);
        }
        resolve(image);
      };
      image.onerror = () => reject(new Error(`Failed to load hero frame ${index + 1}`));
      image.src = getFrameUrl(index);
    }).finally(() => this.pending.delete(index));

    this.pending.set(index, request);
    return request;
  }

  async preloadProgressively(batches: number[][]): Promise<void> {
    for (const batch of batches) {
      if (this.disposed) {
        return;
      }

      await Promise.allSettled(batch.map((index) => this.load(index)));
      await new Promise((resolve) => window.setTimeout(resolve, 24));
    }
  }

  dispose() {
    this.disposed = true;
    this.frames.clear();
    this.pending.clear();
  }
}
