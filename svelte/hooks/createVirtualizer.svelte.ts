/**
 * Svelte 5 virtualizer hook — port of react/hooks/useVirtualizer.ts.
 *
 * Uses the latest Svelte 5 runes:
 * - $state.raw for the `range` object (TypedArray-backed views reassigned
 *   wholesale — proxy overhead would be pure waste)
 * - $state for scalar isLoading / error
 * - $effect for lifecycle + cleanup
 * - @attach attachments (Svelte 5.29+) for the scroll container
 *
 * Reuses core/buffers.ts so the zero-allocation hot path is shared with
 * the React adapter.
 */

import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';
import type { VirtualizerOptions } from '../../types/core';
import {
  initializeWasm,
  createVirtualizer as createWasmVirtualizer,
  createUniformVirtualizer,
  type QuantumVariable,
  type QuantumUniform,
} from '../../core/wasm';
import {
  MAX_SAFE_SCROLL_HEIGHT,
  MAX_VISIBLE,
  bufferA,
  bufferB,
  cached,
  EMPTY_RANGE,
  type VirtualRangeSnapshot,
} from '../../core/buffers';

export type VirtualRange = VirtualRangeSnapshot;

export interface CreateVirtualizerResult {
  /** Attach to the scroll container via `{@attach scrollElement}` */
  scrollElement: Attachment<HTMLElement>;
  readonly range: VirtualRange;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly totalHeight: number;
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
}

/**
 * Create a Warper virtualizer. Pass options as a getter so reactivity
 * crosses the function boundary:
 *
 *     const v = createVirtualizer(() => ({ itemCount, estimateSize }));
 *
 * Must be called from a component `<script>` (or any tracking context).
 * For non-component usage, wrap in `$effect.root`.
 */
export function createVirtualizer<T>(
  getOptions: () => VirtualizerOptions<T>
): CreateVirtualizerResult {
  let range = $state.raw<VirtualRange>(EMPTY_RANGE);
  let isLoading = $state(true);
  let error = $state<Error | null>(null);

  const r = {
    element: null as HTMLElement | null,
    virtualizer: null as QuantumVariable | null,
    uniformVirtualizer: null as QuantumUniform | null,
    isUniform: false,
    uniformSize: 0,
    lastStart: -1,
    lastEnd: -1,
    lastPaddingTop: 0,
    rafId: 0,
    rafPending: false,
    mounted: true,
    itemCount: 0,
    estimateSize: ((_: number) => 0) as (i: number) => number,
    overscan: 3,
    horizontal: false,
    scrollMultiplier: 1,
    virtualTotalHeight: 0,
    actualScrollHeight: 0,
    useBufferA: true,
    lastScrollTime: 0,
    lastScrollPos: 0,
    velocity: 0,
    initialized: false,
  };

  function readOptions(): void {
    const o = getOptions();
    r.itemCount = o.itemCount;
    r.estimateSize = o.estimateSize;
    r.overscan = o.overscan ?? 3;
    r.horizontal = o.horizontal ?? false;
  }

  function recomputeScrollMetrics(virtualTotalHeight: number): void {
    r.virtualTotalHeight = virtualTotalHeight;
    if (virtualTotalHeight > MAX_SAFE_SCROLL_HEIGHT) {
      r.actualScrollHeight = MAX_SAFE_SCROLL_HEIGHT;
      r.scrollMultiplier = virtualTotalHeight / MAX_SAFE_SCROLL_HEIGHT;
    } else {
      r.actualScrollHeight = virtualTotalHeight;
      r.scrollMultiplier = 1;
    }
  }

  function buildVirtualizer(): void {
    const count = r.itemCount;
    const firstSize = r.estimateSize(0);

    let isUniform = true;
    const checkCount = Math.min(10, count);
    for (let i = 1; i < checkCount; i++) {
      if (r.estimateSize(i) !== firstSize) {
        isUniform = false;
        break;
      }
    }

    r.isUniform = isUniform;
    r.uniformSize = firstSize;

    let virtualTotalHeight: number;
    if (isUniform) {
      r.uniformVirtualizer = createUniformVirtualizer(count, firstSize);
      virtualTotalHeight = count * firstSize;
    } else {
      const sizes = new Array(count);
      for (let i = 0; i < count; i++) sizes[i] = r.estimateSize(i);
      r.virtualizer = createWasmVirtualizer(sizes);
      virtualTotalHeight = sizes.reduce((a, b) => a + b, 0);
    }

    recomputeScrollMetrics(virtualTotalHeight);
  }

  function resizeVirtualizer(): void {
    const count = r.itemCount;
    let virtualTotalHeight: number;

    if (r.isUniform && r.uniformVirtualizer) {
      r.uniformVirtualizer.set_count(count);
      virtualTotalHeight = count * r.uniformSize;
    } else if (r.virtualizer) {
      const sizes = new Array(count);
      for (let i = 0; i < count; i++) sizes[i] = r.estimateSize(i);
      r.virtualizer.free();
      r.virtualizer = createWasmVirtualizer(sizes);
      virtualTotalHeight = sizes.reduce((a, b) => a + b, 0);
    } else {
      return;
    }

    recomputeScrollMetrics(virtualTotalHeight);
    r.lastStart = -1;
    r.lastEnd = -1;
  }

  function calculateRange(): void {
    const el = r.element;
    if (!el || !r.mounted) return;

    const scrollPos = r.horizontal ? el.scrollLeft : el.scrollTop;
    const viewportSize = r.horizontal ? el.clientWidth : el.clientHeight;
    if (viewportSize <= 0) return;

    const now = performance.now();
    const dt = now - r.lastScrollTime;
    if (dt > 0 && dt < 100) {
      r.velocity = Math.abs((scrollPos - r.lastScrollPos) / dt) * 1000;
    }
    r.lastScrollTime = now;
    r.lastScrollPos = scrollPos;

    const virtualScroll = scrollPos * r.scrollMultiplier;

    let start = 0;
    let end = 0;
    if (r.isUniform && r.uniformVirtualizer) {
      const info = r.uniformVirtualizer.calc_range(virtualScroll, viewportSize, r.overscan);
      start = info[0] | 0;
      end = info[1] | 0;
    } else if (r.virtualizer) {
      const info = r.virtualizer.calc_range(virtualScroll, viewportSize, r.overscan);
      start = info[0] | 0;
      end = info[1] | 0;
    } else {
      return;
    }

    start = Math.max(0, start);
    end = Math.min(r.itemCount, end);

    let firstItemVirtualOffset = 0;
    if (r.isUniform) {
      firstItemVirtualOffset = start * r.uniformSize;
    } else if (r.virtualizer) {
      firstItemVirtualOffset = r.virtualizer.get_offset(start);
    }

    const paddingTop = firstItemVirtualOffset / r.scrollMultiplier;

    if (
      start === r.lastStart &&
      end === r.lastEnd &&
      Math.abs(paddingTop - r.lastPaddingTop) < 0.5
    ) {
      return;
    }

    r.lastStart = start;
    r.lastEnd = end;
    r.lastPaddingTop = paddingTop;

    const count = Math.min(end - start, MAX_VISIBLE);
    const useA = r.useBufferA;
    const buffer = useA ? bufferA : bufferB;
    r.useBufferA = !r.useBufferA;

    if (r.isUniform) {
      const size = r.uniformSize;
      for (let i = 0; i < count; i++) {
        const idx = start + i;
        buffer.items[i] = idx;
        buffer.offsets[i] = i * size;
        buffer.sizes[i] = size;
      }
    } else if (r.virtualizer) {
      for (let i = 0; i < count; i++) {
        const idx = start + i;
        buffer.items[i] = idx;
        buffer.offsets[i] = r.virtualizer.get_offset(idx) - firstItemVirtualOffset;
        buffer.sizes[i] = r.virtualizer.get_size(idx);
      }
    }

    let cachedItems = useA ? cached.itemsA : cached.itemsB;
    let cachedOffsets = useA ? cached.offsetsA : cached.offsetsB;
    let cachedSizes = useA ? cached.sizesA : cached.sizesB;

    if (cachedItems.length !== count) {
      cachedItems = new Array(count);
      cachedOffsets = new Array(count);
      cachedSizes = new Array(count);
      if (useA) {
        cached.itemsA = cachedItems;
        cached.offsetsA = cachedOffsets;
        cached.sizesA = cachedSizes;
      } else {
        cached.itemsB = cachedItems;
        cached.offsetsB = cachedOffsets;
        cached.sizesB = cachedSizes;
      }
    }

    for (let i = 0; i < count; i++) {
      cachedItems[i] = buffer.items[i];
      cachedOffsets[i] = buffer.offsets[i];
      cachedSizes[i] = buffer.sizes[i];
    }

    range = {
      startIndex: start,
      endIndex: end,
      items: cachedItems as readonly number[],
      offsets: cachedOffsets as readonly number[],
      sizes: cachedSizes as readonly number[],
      totalHeight: r.actualScrollHeight,
      paddingTop,
      velocity: r.velocity,
    };
  }

  function handleScroll(): void {
    if (r.rafPending) return;
    r.rafPending = true;
    r.rafId = requestAnimationFrame(() => {
      r.rafPending = false;
      calculateRange();
    });
  }

  // Populate r.itemCount / r.estimateSize before WASM init runs.
  readOptions();

  // One-time initialisation: load WASM, build the virtualizer, attach cleanup.
  $effect(() => {
    r.mounted = true;
    let cancelled = false;

    (async () => {
      try {
        await initializeWasm();
        if (cancelled || !r.mounted) return;
        buildVirtualizer();
        r.initialized = true;
        isLoading = false;
        if (r.element) {
          requestAnimationFrame(() => {
            if (r.mounted) calculateRange();
          });
        }
      } catch (err) {
        if (cancelled || !r.mounted) return;
        error = err instanceof Error ? err : new Error(String(err));
        isLoading = false;
      }
    })();

    return () => {
      cancelled = true;
      r.mounted = false;
      if (r.rafId) cancelAnimationFrame(r.rafId);
      r.virtualizer?.free();
      r.uniformVirtualizer?.free();
      r.virtualizer = null;
      r.uniformVirtualizer = null;
    };
  });

  // React to option changes (itemCount / estimateSize / overscan / horizontal).
  // Calling `getOptions()` inside the effect performs reactive reads on the
  // consumer-side state, registering them as dependencies of this effect.
  $effect(() => {
    getOptions();
    if (!r.initialized) return;
    readOptions();
    resizeVirtualizer();
    calculateRange();
  });

  const scrollElement: Attachment<HTMLElement> = (node) => {
    r.element = node;
    const off = on(node, 'scroll', handleScroll, { passive: true });
    if (r.initialized) {
      requestAnimationFrame(() => {
        if (r.mounted) calculateRange();
      });
    }
    return () => {
      off();
      if (r.element === node) r.element = null;
    };
  };

  function scrollToOffset(offset: number, behavior: ScrollBehavior = 'auto'): void {
    const el = r.element;
    if (!el) return;
    const actualOffset = offset / r.scrollMultiplier;
    if (r.horizontal) {
      el.scrollTo({ left: actualOffset, behavior });
    } else {
      el.scrollTo({ top: actualOffset, behavior });
    }
  }

  function scrollToIndex(index: number, behavior: ScrollBehavior = 'auto'): void {
    let virtualOffset = 0;
    if (r.isUniform) {
      virtualOffset = index * r.uniformSize;
    } else if (r.virtualizer) {
      virtualOffset = r.virtualizer.get_offset(index);
    }
    scrollToOffset(virtualOffset, behavior);
  }

  return {
    scrollElement,
    get range() {
      return range;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get totalHeight() {
      return range.totalHeight;
    },
    scrollToOffset,
    scrollToIndex,
  };
}
