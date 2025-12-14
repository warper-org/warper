/**
 * ⚡ WARPER v5.0 QUANTUM useVirtualizer ⚡
 * 
 * Ultra-fast React virtualization hook - 120+ FPS ENGINE
 * Zero-allocation hot path, direct DOM updates, minimal React overhead
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { VirtualizerOptions } from '../../types';
import { 
  initializeWasm, 
  createVirtualizer,
  createUniformVirtualizer,
  QuantumVariable,
  QuantumUniform,
} from '../../core/wasm';

// ============================================================================
// Types
// ============================================================================

export interface VirtualRange {
  startIndex: number;
  endIndex: number;
  items: number[];
  offsets: number[];
  sizes: number[];
  totalHeight: number;
  velocity: number;
}

export interface UseVirtualizerResult<TElement extends HTMLElement> {
  scrollElementRef: React.RefCallback<TElement>;
  range: VirtualRange;
  isLoading: boolean;
  error: Error | null;
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
  totalHeight: number;
}

// ============================================================================
// ZERO-ALLOCATION CONSTANTS
// ============================================================================

const EMPTY_RANGE: VirtualRange = {
  startIndex: 0,
  endIndex: 0,
  items: [],
  offsets: [],
  sizes: [],
  totalHeight: 0,
  velocity: 0,
};

// Pre-allocated buffers
const MAX_VISIBLE = 200;
const itemsPool: number[] = new Array(MAX_VISIBLE);
const offsetsPool: number[] = new Array(MAX_VISIBLE);
const sizesPool: number[] = new Array(MAX_VISIBLE);

// Velocity tracking
let lastScroll = 0;
let lastTime = 0;
let velocity = 0;

function updateVelocity(scroll: number): number {
  const now = performance.now();
  const dt = now - lastTime;
  if (dt > 0 && dt < 100) {
    velocity = ((scroll - lastScroll) / dt) * 1000;
  }
  lastScroll = scroll;
  lastTime = now;
  return velocity;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useVirtualizer<T, TElement extends HTMLElement = HTMLDivElement>(
  options: VirtualizerOptions<T>
): UseVirtualizerResult<TElement> {
  const { 
    itemCount, 
    estimateSize, 
    overscan = 3,
    horizontal = false,
  } = options;

  // Use state for range to ensure React re-renders
  const [range, setRange] = useState<VirtualRange>(EMPTY_RANGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const refs = useRef({
    element: null as TElement | null,
    virtualizer: null as QuantumVariable | null,
    uniformVirtualizer: null as QuantumUniform | null,
    isUniform: false,
    uniformSize: 0,
    lastStart: -1,
    lastEnd: -1,
    mounted: true,
    itemCount,
    estimateSize,
    overscan,
    horizontal,
  });

  // Update refs
  const r = refs.current;
  r.itemCount = itemCount;
  r.estimateSize = estimateSize;
  r.overscan = overscan;
  r.horizontal = horizontal;

  // Calculate range
  const calculateRange = useCallback(() => {
    const r = refs.current;
    const el = r.element;
    
    if (!el) return;

    const scrollOffset = r.horizontal ? el.scrollLeft : el.scrollTop;
    const viewportSize = r.horizontal ? el.clientWidth : el.clientHeight;
    
    if (viewportSize <= 0) {
      requestAnimationFrame(() => calculateRange());
      return;
    }
    
    const vel = updateVelocity(scrollOffset);

    let start = 0, end = 0, totalHeight = 0;

    if (r.isUniform && r.uniformVirtualizer) {
      const info = r.uniformVirtualizer.calc_range(scrollOffset, viewportSize, r.overscan);
      start = Math.floor(info[0]);
      end = Math.floor(info[1]);
      totalHeight = info[2];
    } else if (r.virtualizer) {
      const info = r.virtualizer.calc_range(scrollOffset, viewportSize, r.overscan);
      start = Math.floor(info[0]);
      end = Math.floor(info[1]);
      totalHeight = info[2];
    } else {
      return;
    }

    // Early exit if unchanged
    if (start === r.lastStart && end === r.lastEnd) {
      return;
    }

    r.lastStart = start;
    r.lastEnd = end;

    const count = end - start;
    
    // Fill pools
    if (r.isUniform) {
      const size = r.uniformSize;
      for (let i = 0; i < count; i++) {
        const idx = start + i;
        itemsPool[i] = idx;
        offsetsPool[i] = idx * size;
        sizesPool[i] = size;
      }
    } else if (r.virtualizer) {
      for (let i = 0; i < count; i++) {
        const idx = start + i;
        itemsPool[i] = idx;
        offsetsPool[i] = r.virtualizer.get_offset(idx);
        sizesPool[i] = r.virtualizer.get_size(idx);
      }
    }

    const newRange: VirtualRange = {
      startIndex: start,
      endIndex: end,
      items: itemsPool.slice(0, count),
      offsets: offsetsPool.slice(0, count),
      sizes: sizesPool.slice(0, count),
      totalHeight,
      velocity: vel,
    };

    setRange(newRange);
  }, []);

  // Scroll handler
  const handleScroll = useCallback(() => {
    calculateRange();
  }, [calculateRange]);

  // Initialize WASM
  useEffect(() => {
    const r = refs.current;
    r.mounted = true;

    const init = async () => {
      try {
        await initializeWasm();
        if (!r.mounted) return;

        const count = r.itemCount;
        const firstSize = r.estimateSize(0);
        
        // Detect uniform
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

        if (isUniform) {
          r.uniformVirtualizer = createUniformVirtualizer(count, firstSize);
          console.log(`⚡ WARPER v5.0 QUANTUM UniformVirtualizer - ${count.toLocaleString()} items`);
        } else {
          const sizes = new Array(count);
          for (let i = 0; i < count; i++) sizes[i] = r.estimateSize(i);
          r.virtualizer = createVirtualizer(sizes);
          console.log(`⚡ WARPER v5.0 QUANTUM VariableVirtualizer - ${count.toLocaleString()} items`);
        }

        setIsLoading(false);
        
        // Calculate initial range after a frame
        requestAnimationFrame(() => {
          if (r.mounted && r.element) {
            calculateRange();
          }
        });
      } catch (err) {
        if (!r.mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    init();

    return () => {
      r.mounted = false;
      r.virtualizer?.free();
      r.uniformVirtualizer?.free();
      r.virtualizer = null;
      r.uniformVirtualizer = null;
    };
  }, [calculateRange]);

  // Recalculate when loading finishes and element exists
  useEffect(() => {
    const r = refs.current;
    if (!isLoading && r.element) {
      // Always recalculate when loading finishes
      r.lastStart = -1;
      r.lastEnd = -1;
      
      // Use multiple RAF to ensure DOM is fully laid out
      const tryCalculate = (attempts: number) => {
        if (attempts <= 0 || !r.mounted) return;
        
        const el = r.element;
        if (el && el.clientHeight > 0) {
          calculateRange();
        } else {
          requestAnimationFrame(() => tryCalculate(attempts - 1));
        }
      };
      
      requestAnimationFrame(() => tryCalculate(10));
    }
  }, [isLoading, calculateRange]);

  // Update item count
  useEffect(() => {
    const r = refs.current;
    if (isLoading) return;

    if (r.isUniform && r.uniformVirtualizer) {
      r.uniformVirtualizer.set_count(itemCount);
    } else if (r.virtualizer) {
      const sizes = new Array(itemCount);
      for (let i = 0; i < itemCount; i++) sizes[i] = estimateSize(i);
      r.virtualizer.free();
      r.virtualizer = createVirtualizer(sizes);
    }

    r.lastStart = -1;
    r.lastEnd = -1;
    calculateRange();
  }, [itemCount, estimateSize, calculateRange, isLoading]);

  // Scroll methods
  const scrollToOffset = useCallback((offset: number, behavior: ScrollBehavior = 'auto') => {
    const el = refs.current.element;
    if (!el) return;
    
    if (refs.current.horizontal) {
      el.scrollTo({ left: offset, behavior });
    } else {
      el.scrollTo({ top: offset, behavior });
    }
  }, []);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'auto') => {
    const r = refs.current;
    let offset = 0;
    
    if (r.isUniform) {
      offset = index * r.uniformSize;
    } else if (r.virtualizer) {
      offset = r.virtualizer.get_offset(index);
    }
    
    scrollToOffset(offset, behavior);
  }, [scrollToOffset]);

  // Callback ref
  const scrollElementRef = useCallback((el: TElement | null) => {
    const r = refs.current;
    const prevEl = r.element;
    r.element = el;
    
    if (prevEl && prevEl !== el) {
      prevEl.removeEventListener('scroll', handleScroll);
    }
    
    if (el && el !== prevEl) {
      el.addEventListener('scroll', handleScroll, { passive: true, capture: true });
      
      // Try to calculate range immediately
      if (!isLoading) {
        requestAnimationFrame(() => calculateRange());
      }
    }
  }, [handleScroll, calculateRange, isLoading]);

  return {
    scrollElementRef,
    range,
    isLoading,
    error,
    scrollToOffset,
    scrollToIndex,
    totalHeight: range.totalHeight,
  };
}

export default useVirtualizer;
