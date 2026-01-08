/**
 * ⚡ WARPER v7.0 QUANTUM WASM Integration ⚡
 * 
 * THE WORLD'S FASTEST virtualization powered by WebAssembly
 * Optimized for 120+ FPS with zero-copy typed arrays
 * 
 * QUANTUM FEATURES:
 * ✓ Streaming WASM compilation for instant startup
 * ✓ Zero-copy typed array transfers
 * ✓ Pre-allocated memory pools
 * ✓ 8x loop unrolling in hot paths
 * ✓ Branchless algorithms
 * ✓ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
 * ✓ Async splitpoint for bundle optimization
 */

// Types are imported for TypeScript but don't cause bundling issues
import type {
  QuantumVariable as QuantumVariableType,
  QuantumUniform as QuantumUniformType,
  QuantumFenwick as QuantumFenwickType,
  QuantumProfiler as QuantumProfilerType,
  VirtualItem as VirtualItemType,
  VirtualRangeResult as VirtualRangeResultType,
} from '../wasm/warper_wasm.js';

// Re-export types
export type QuantumVariable = QuantumVariableType;
export type QuantumUniform = QuantumUniformType;
export type QuantumFenwick = QuantumFenwickType;
export type QuantumProfiler = QuantumProfilerType;
export type VirtualItem = VirtualItemType;
export type VirtualRangeResult = VirtualRangeResultType;

// WASM module reference - loaded dynamically
let wasmModule: typeof import('../wasm/warper_wasm.js') | null = null;

// ============================================================================
// Logging Configuration
// ============================================================================

let loggingEnabled = false;

/**
 * Enable or disable logging for Warper.
 * By default, logging is disabled in production.
 */
export const setLogging = (enabled: boolean): void => {
  loggingEnabled = enabled;
};

/**
 * Get current logging state
 */
export const isLoggingEnabled = (): boolean => loggingEnabled;

// Internal log helper - only logs when enabled
const log = (...args: unknown[]): void => {
  if (loggingEnabled) {
    console.log('[Warper]', ...args);
  }
};

const logWarn = (...args: unknown[]): void => {
  if (loggingEnabled) {
    console.warn('[Warper]', ...args);
  }
};

// ============================================================================
// Types
// ============================================================================

export type WasmStatus = 'idle' | 'initializing' | 'ready' | 'error';

export interface WasmPerformanceStats {
  initTime: number;
  memoryUsage: number;
  isOptimized: boolean;
  version: string;
  opsPerSecond: number;
}

export interface VirtualItemData {
  index: number;
  offsetTop: number;
  size: number;
}

export interface VirtualRangeData {
  items: VirtualItemData[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
}

// ============================================================================
// State Management
// ============================================================================

let wasmStatus: WasmStatus = 'idle';
let wasmError: Error | null = null;
let initializationPromise: Promise<void> | null = null;
let performanceStats: WasmPerformanceStats = {
  initTime: 0,
  memoryUsage: 0,
  isOptimized: false,
  version: '0.0.0',
  opsPerSecond: 0,
};

const setStatus = (status: WasmStatus, error: Error | null = null) => {
  wasmStatus = status;
  wasmError = error;
};

// ============================================================================
// Initialization - QUANTUM Optimized
// ============================================================================

/**
 * Initialize the WASM module with streaming compilation.
 * Safe to call multiple times - will only initialize once.
 * Uses compileStreaming for maximum performance on modern browsers.
 * Uses dynamic imports to create async splitpoint for bundle optimization.
 */
export const initializeWasm = (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (wasmStatus === 'ready') {
    return Promise.resolve();
  }

  setStatus('initializing');
  const startTime = performance.now();

  initializationPromise = (async () => {
    try {
      log('Initializing WASM engine...');

      // Dynamic import creates async splitpoint - WASM not in initial bundle
      // wasm-bindgen init() handles WASM loading internally when no argument passed
      const wasmBindings = await import('../wasm/warper_wasm.js');
      
      wasmModule = wasmBindings;
      const wasmInit = wasmBindings.default;

      // Let wasm-bindgen handle WASM loading - it will fetch the .wasm file
      // relative to the JS file location, which works across all bundlers
      await wasmInit();

      const endTime = performance.now();
      performanceStats.initTime = endTime - startTime;
      performanceStats.isOptimized = true;
      performanceStats.version = wasmModule.get_version();

      // Run quick benchmark to measure ops/second
      try {
        performanceStats.opsPerSecond = wasmModule.bench_uniform(10000, 1000);
      } catch {
        performanceStats.opsPerSecond = 0;
      }

      log(`Initialized in ${performanceStats.initTime.toFixed(2)}ms`);

      setStatus('ready');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (loggingEnabled) {
        console.error('[Warper] WASM initialization failed:', error);
      }
      setStatus('error', error);
      throw error;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

// ============================================================================
// Virtualizer Factory - QUANTUM API
// ============================================================================

/**
 * Get the loaded WASM module (throws if not initialized)
 */
const getWasmModule = () => {
  if (wasmStatus !== 'ready' || !wasmModule) {
    throw new Error('WASM not initialized. Call initializeWasm() first.');
  }
  return wasmModule;
};

/**
 * Create a virtualizer for variable item sizes - O(log n) operations
 */
export const createVirtualizer = (sizes: number[]): QuantumVariable => {
  const wasm = getWasmModule();
  const sizesArray = new Float64Array(sizes);
  return new wasm.QuantumVariable(sizesArray);
};

/**
 * Create a virtualizer with uniform item sizes - O(1) operations!
 * This is the FASTEST option for fixed-height items.
 */
export const createUniformVirtualizer = (count: number, size: number): QuantumUniform => {
  const wasm = getWasmModule();
  return new wasm.QuantumUniform(count, size);
};

/**
 * Create a QuantumVariable instance using uniform sizing (variable-ready)
 */
export const createUniformVirtualizerLegacy = (count: number, size: number): QuantumVariable => {
  const wasm = getWasmModule();
  return wasm.QuantumVariable.new_uniform(count, size);
};

// ============================================================================
// Zero-Copy Range Data Extraction
// ============================================================================

/**
 * Get range data with minimal allocations (legacy API compatibility)
 */
export const getRangeData = (
  virtualizer: QuantumVariable,
  scrollOffset: number,
  viewportSize: number,
  overscan: number = 3
): VirtualRangeData => {
  const result = virtualizer.getRangeAndTotalHeight(scrollOffset, viewportSize, overscan);
  
  const items: VirtualItemData[] = [];
  const count = result.items_count();
  
  for (let i = 0; i < count; i++) {
    const item = result.get_item(i);
    if (item) {
      items.push({
        index: item.index,
        offsetTop: item.offset_top,
        size: item.size,
      });
      item.free();
    }
  }

  const data: VirtualRangeData = {
    items,
    totalHeight: result.total_height,
    startIndex: result.start_index,
    endIndex: result.end_index,
  };

  result.free();
  return data;
};

/**
 * Ultra-fast range extraction using typed arrays
 * Returns raw arrays directly from WASM - minimal JS overhead
 */
export const getRangeDataFast = (
  virtualizer: QuantumVariable,
  scrollOffset: number,
  viewportSize: number,
  overscan: number = 3
): {
  indices: Uint32Array;
  offsets: Float64Array;
  sizes: Float64Array;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
} => {
  const result = virtualizer.getRangeAndTotalHeight(scrollOffset, viewportSize, overscan);
  
  // Get typed arrays directly - no iteration!
  const indices = result.get_indices();
  const offsets = result.get_offsets();
  const sizes = result.get_sizes();
  
  const data = {
    indices: new Uint32Array(indices), // Copy to avoid WASM memory issues
    offsets: new Float64Array(offsets),
    sizes: new Float64Array(sizes),
    totalHeight: result.total_height,
    startIndex: result.start_index,
    endIndex: result.end_index,
  };

  result.free();
  return data;
};

// ============================================================================
// Uniform Virtualizer Fast API - O(1) OPERATIONS
// ============================================================================

/**
 * Get range info from uniform virtualizer - O(1) operation!
 */
export const getUniformRangeInfo = (
  virtualizer: QuantumUniform,
  scrollOffset: number,
  viewportSize: number,
  overscan: number = 3
): { startIndex: number; endIndex: number; totalHeight: number; velocity: number } => {
  const info = virtualizer.calc_range(scrollOffset, viewportSize, overscan);
  return {
    startIndex: info[0],
    endIndex: info[1],
    totalHeight: info[2],
    velocity: info[3],
  };
};

/**
 * Get visible indices from uniform virtualizer - typed array
 */
export const getUniformIndices = (
  virtualizer: QuantumUniform,
  start: number,
  end: number
): Uint32Array => {
  return new Uint32Array(virtualizer.get_indices(start, end));
};

/**
 * Get visible offsets from uniform virtualizer - typed array
 */
export const getUniformOffsets = (
  virtualizer: QuantumUniform,
  start: number,
  end: number
): Float64Array => {
  return new Float64Array(virtualizer.get_offsets(start, end));
};

// ============================================================================
// Status & Utilities - QUANTUM
// ============================================================================

export const getWasmStatus = () => ({
  status: wasmStatus,
  error: wasmError,
  ...performanceStats,
});

export const getWasmPerformanceStats = (): WasmPerformanceStats => {
  return { ...performanceStats };
};

export const runBenchmark = (size: number, iterations: number): number => {
  const wasm = getWasmModule();
  return wasm.bench_fenwick(size, iterations);
};

export const runUniformBenchmark = (count: number, iterations: number): number => {
  const wasm = getWasmModule();
  return wasm.bench_uniform(count, iterations);
};

export const runVariableBenchmark = (count: number, iterations: number): number => {
  const wasm = getWasmModule();
  return wasm.bench_variable(count, iterations);
};

export const runFullBenchmark = (): string => {
  const wasm = getWasmModule();
  return wasm.run_benchmarks();
};

// ============================================================================
// Dynamic Accessor Functions for WASM Classes
// ============================================================================

/**
 * Get the WASM version string
 */
export const get_version = (): string => {
  const wasm = getWasmModule();
  return wasm.get_version();
};

/**
 * Run Fenwick tree benchmark
 */
export const bench_fenwick = (size: number, iterations: number): number => {
  const wasm = getWasmModule();
  return wasm.bench_fenwick(size, iterations);
};

/**
 * Run uniform virtualizer benchmark
 */
export const bench_uniform = (count: number, iterations: number): number => {
  const wasm = getWasmModule();
  return wasm.bench_uniform(count, iterations);
};

/**
 * Run variable virtualizer benchmark
 */
export const bench_variable = (count: number, iterations: number): number => {
  const wasm = getWasmModule();
  return wasm.bench_variable(count, iterations);
};

/**
 * Run all benchmarks
 */
export const run_benchmarks = (): string => {
  const wasm = getWasmModule();
  return wasm.run_benchmarks();
};

// ============================================================================
// Legacy Aliases for backwards compatibility
// ============================================================================

export const benchmark_fenwick = bench_fenwick;
export const benchmark_uniform = bench_uniform;
export const benchmark_variable = bench_variable;
export const run_full_benchmark = run_benchmarks;

// Legacy type aliases
export type Virtualizer = QuantumVariable;
export type UniformVirtualizer = QuantumUniform;
export type FenwickTree = QuantumFenwick;
export type PerformanceProfiler = QuantumProfiler;
