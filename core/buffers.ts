/**
 * Shared zero-allocation hot-path scratch space.
 *
 * Used by every framework adapter (React, Svelte, …) so the optimisation
 * isn't duplicated. The pools are module-level singletons — adapters take
 * turns through the `useBufferA` flag stored on each virtualizer instance.
 */

export const MAX_SAFE_SCROLL_HEIGHT = 15_000_000;
export const MAX_VISIBLE = 200;

export interface ScratchBuffer {
  items: Int32Array;
  offsets: Float64Array;
  sizes: Float64Array;
}

export const bufferA: ScratchBuffer = {
  items: new Int32Array(MAX_VISIBLE),
  offsets: new Float64Array(MAX_VISIBLE),
  sizes: new Float64Array(MAX_VISIBLE),
};

export const bufferB: ScratchBuffer = {
  items: new Int32Array(MAX_VISIBLE),
  offsets: new Float64Array(MAX_VISIBLE),
  sizes: new Float64Array(MAX_VISIBLE),
};

export const cached = {
  itemsA: [] as number[],
  itemsB: [] as number[],
  offsetsA: [] as number[],
  offsetsB: [] as number[],
  sizesA: [] as number[],
  sizesB: [] as number[],
};

export interface VirtualRangeSnapshot {
  startIndex: number;
  endIndex: number;
  items: readonly number[];
  offsets: readonly number[];
  sizes: readonly number[];
  totalHeight: number;
  paddingTop: number;
  velocity: number;
}

export const EMPTY_RANGE: VirtualRangeSnapshot = Object.freeze({
  startIndex: 0,
  endIndex: 0,
  items: Object.freeze([]) as readonly number[],
  offsets: Object.freeze([]) as readonly number[],
  sizes: Object.freeze([]) as readonly number[],
  totalHeight: 0,
  paddingTop: 0,
  velocity: 0,
});
