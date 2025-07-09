import React, { useState, useRef, useEffect, useMemo } from 'react';
import { VirtualizerOptions, VirtualItem, DisplayItem } from '../../types';
import { initializeWasm, Virtualizer, getWasmStatus } from '../../core/wasm';

interface WasmResult {
  items: VirtualItem[];
  total_height: number;
}

export function useVirtualizer<T>(options: VirtualizerOptions<T>) {
  const { itemCount, estimateSize, overscan = 2, height, scrollTop = 0 } = options;
  const [virtualState, setVirtualState] = useState<{
    items: DisplayItem[];
    totalHeight: number;
  }>({ items: [], totalHeight: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const virtualizerRef = useRef<Virtualizer | null>(null);
  const [wasmState, setWasmState] = useState(getWasmStatus());
  const [error, setError] = useState<Error | null>(null);

  // Determine if all items are the same size
  const isFixedSize = useMemo(() => {
    if (itemCount < 2) return true;
    // Check a sample of items for size consistency
    for (let i = 1; i < Math.min(itemCount, 100); i++) {
      if (estimateSize(i) !== estimateSize(0)) return false;
    }
    return true;
  }, [itemCount, estimateSize]);

  // Initialize WASM and the Virtualizer instance
  useEffect(() => {
    let localVirtualizer: Virtualizer | null = null;

    const initWasmAndVirtualizer = async () => {
      try {
        setWasmState(getWasmStatus());
        if (getWasmStatus().status !== 'ready') {
          await initializeWasm();
        }
        setWasmState(getWasmStatus());

        if (getWasmStatus().status !== 'ready') {
          throw new Error('WASM module is not ready.');
        }

        if (isFixedSize && itemCount > 0) {
          localVirtualizer = Virtualizer.newWithFixedSize(itemCount, estimateSize(0));
        } else {
          const itemSizes = new Float64Array(itemCount).map((_, index) => estimateSize(index));
          localVirtualizer = new Virtualizer(itemSizes);
        }
        virtualizerRef.current = localVirtualizer;
        // Force a re-render to run the scroll effect
        setVirtualState(prevState => ({ ...prevState }));

      } catch (err) {
        console.error('Failed to initialize WASM or Virtualizer:', err);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setWasmState(getWasmStatus());
      }
    };

    initWasmAndVirtualizer();

    return () => {
      if (virtualizerRef.current) {
        virtualizerRef.current.free();
        virtualizerRef.current = null;
      }
    };
  }, [itemCount, estimateSize, isFixedSize]); // Re-create virtualizer if item count or sizing changes

  // Handle scroll events
  useEffect(() => {
    if (virtualizerRef.current && containerRef.current) {
      const result = virtualizerRef.current.getRangeAndTotalHeight(
        scrollTop,
        height,
        overscan
      ) as WasmResult;
      const displayItems: DisplayItem[] = result.items.map((item) => ({
        index: item.index,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${item.size}px`,
          transform: `translateY(${item.offset_top}px)`,
        },
      }));
      setVirtualState({ items: displayItems, totalHeight: result.total_height });
    }
  }, [scrollTop, height, overscan, wasmState, virtualizerRef.current]);


  return {
    containerRef,
    items: virtualState.items,
    totalHeight: virtualState.totalHeight,
    isLoading: wasmState.status === 'initializing' || wasmState.status === 'idle',
    error,
  };
}
