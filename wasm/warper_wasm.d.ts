/* tslint:disable */
/* eslint-disable */
/**
 * Benchmark Fenwick tree - returns ops/second
 */
export function bench_fenwick(count: number, iterations: number): number;
export function init(): void;
export function get_version(): string;
/**
 * Benchmark variable virtualizer - returns ops/second
 */
export function bench_variable(count: number, iterations: number): number;
/**
 * Benchmark uniform virtualizer - returns ops/second
 */
export function bench_uniform(count: number, iterations: number): number;
/**
 * Run full benchmark suite - returns formatted results
 */
export function run_benchmarks(): string;
/**
 * Ultra-optimized Fenwick Tree (Binary Indexed Tree)
 * Features:
 * - Branchless bit manipulation
 * - Cache-friendly sequential updates
 * - O(1) total query via cached sum
 * - O(log n) prefix sum and point update
 */
export class QuantumFenwick {
  free(): void;
  /**
   * Find index at offset using branchless binary search - O(log n)
   * This is the CRITICAL hot path for variable-size virtualization
   */
  find_index(offset: number): number;
  /**
   * Query prefix sum [0, idx) - O(log n)
   * Uses branchless bit manipulation
   */
  prefix_sum(idx: number): number;
  /**
   * Create with uniform sizes
   */
  static new_uniform(count: number, size: number): QuantumFenwick;
  /**
   * Batch update multiple sizes - optimized for bulk ops
   */
  batch_update(indices: Uint32Array, new_sizes: Float64Array): void;
  /**
   * Get number of items
   */
  len(): number;
  /**
   * Construct Fenwick tree in O(n) time
   */
  constructor(sizes: Float64Array);
  /**
   * Get total height - O(1) cached
   */
  total(): number;
  /**
   * Update size at index - O(log n)
   */
  update(idx: number, new_size: number): void;
  /**
   * Get size at specific index - O(1)
   */
  get_size(idx: number): number;
  /**
   * Check if empty
   */
  is_empty(): boolean;
}
/**
 * High-performance profiler with O(1) running statistics
 */
export class QuantumProfiler {
  free(): void;
  /**
   * Add sample with O(1) ring buffer insert
   */
  add(value: number): void;
  /**
   * Get average - O(1)
   */
  avg(): number;
  /**
   * Get FPS from frame times - O(1)
   */
  fps(): number;
  /**
   * Get max - O(1)
   */
  max(): number;
  /**
   * Get min - O(1)
   */
  min(): number;
  constructor(capacity: number);
  /**
   * Reset statistics
   */
  reset(): void;
}
/**
 * Ultimate O(1) virtualizer for fixed-height items
 * Every single operation completes in constant time
 * Zero allocations in hot path - uses pre-allocated pools
 */
export class QuantumUniform {
  free(): void;
  /**
   * Calculate visible range with ADAPTIVE OVERSCAN
   * Returns packed: [start, end, total_height, velocity]
   */
  calc_range(scroll: number, viewport: number, overscan: number): Float64Array;
  /**
   * Get offset for index - O(1) BRANCHLESS
   */
  get_offset(index: number): number;
  /**
   * Get item count - O(1)
   */
  item_count(): number;
  /**
   * Get visible indices as zero-copy typed array
   */
  get_indices(start: number, end: number): Uint32Array;
  /**
   * Get visible offsets as zero-copy typed array
   */
  get_offsets(start: number, end: number): Float64Array;
  /**
   * Update scroll velocity for adaptive overscan
   */
  set_velocity(v: number): void;
  /**
   * Get total scrollable height - O(1)
   */
  total_height(): number;
  /**
   * Check if range has changed (for skip-render)
   */
  range_changed(scroll: number, viewport: number, overscan: number): boolean;
  /**
   * Update item size - O(1)
   */
  set_item_size(size: number): void;
  /**
   * Create new uniform virtualizer - O(1)
   */
  constructor(count: number, item_size: number);
  /**
   * Free resources
   */
  free(): void;
  /**
   * Get index at offset - O(1) BRANCHLESS
   */
  get_index(offset: number): number;
  /**
   * Get visible sizes as zero-copy typed array
   */
  get_sizes(count: number): Float64Array;
  /**
   * Get item size - O(1)
   */
  item_size(): number;
  /**
   * Update item count - O(1)
   */
  set_count(count: number): void;
}
/**
 * High-performance virtualizer for variable item heights
 * Uses Fenwick tree for O(log n) prefix sums and binary search
 */
export class QuantumVariable {
  free(): void;
  /**
   * Calculate visible range with adaptive overscan - O(log n)
   */
  calc_range(scroll: number, viewport: number, overscan: number): Float64Array;
  /**
   * Get offset for index - O(log n)
   */
  get_offset(index: number): number;
  /**
   * Get item count - O(1)
   */
  item_count(): number;
  /**
   * Get visible indices as zero-copy typed array
   */
  get_indices(start: number, end: number): Uint32Array;
  /**
   * Get visible offsets as zero-copy typed array - O(k)
   */
  get_offsets(start: number, end: number): Float64Array;
  /**
   * Create with uniform sizes (variable-ready)
   */
  static new_uniform(count: number, size: number): QuantumVariable;
  /**
   * Update item size - O(log n)
   */
  update_size(index: number, new_size: number): void;
  /**
   * Batch update sizes - optimized for bulk ops
   */
  batch_update(indices: Uint32Array, new_sizes: Float64Array): void;
  /**
   * Update velocity
   */
  set_velocity(v: number): void;
  /**
   * Get total height - O(1)
   */
  total_height(): number;
  getRangeAndTotalHeight(scroll: number, viewport: number, overscan: number): VirtualRangeResult;
  /**
   * Create variable virtualizer from sizes array
   */
  constructor(sizes: Float64Array);
  /**
   * Free resources
   */
  free(): void;
  /**
   * Get size at index - O(1)
   */
  get_size(index: number): number;
  /**
   * Get index at offset - O(log n) branchless
   */
  get_index(offset: number): number;
  /**
   * Get visible sizes as zero-copy typed array - O(k)
   */
  get_sizes(start: number, end: number): Float64Array;
}
/**
 * Legacy virtual item struct
 */
export class VirtualItem {
  free(): void;
  constructor(index: number, offset_top: number, size: number);
  free(): void;
  index: number;
  offset_top: number;
  size: number;
}
/**
 * Legacy range result struct
 */
export class VirtualRangeResult {
  private constructor();
  free(): void;
  get_indices(): Uint32Array;
  get_offsets(): Float64Array;
  items_count(): number;
  free(): void;
  get_item(idx: number): VirtualItem | undefined;
  get_sizes(): Float64Array;
  total_height: number;
  start_index: number;
  end_index: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_get_virtualitem_index: (a: number) => number;
  readonly __wbg_get_virtualitem_offset_top: (a: number) => number;
  readonly __wbg_get_virtualitem_size: (a: number) => number;
  readonly __wbg_get_virtualrangeresult_end_index: (a: number) => number;
  readonly __wbg_get_virtualrangeresult_start_index: (a: number) => number;
  readonly __wbg_quantumfenwick_free: (a: number, b: number) => void;
  readonly __wbg_quantumprofiler_free: (a: number, b: number) => void;
  readonly __wbg_quantumuniform_free: (a: number, b: number) => void;
  readonly __wbg_quantumvariable_free: (a: number, b: number) => void;
  readonly __wbg_set_virtualitem_index: (a: number, b: number) => void;
  readonly __wbg_set_virtualitem_offset_top: (a: number, b: number) => void;
  readonly __wbg_set_virtualitem_size: (a: number, b: number) => void;
  readonly __wbg_set_virtualrangeresult_end_index: (a: number, b: number) => void;
  readonly __wbg_set_virtualrangeresult_start_index: (a: number, b: number) => void;
  readonly __wbg_virtualitem_free: (a: number, b: number) => void;
  readonly __wbg_virtualrangeresult_free: (a: number, b: number) => void;
  readonly bench_fenwick: (a: number, b: number) => number;
  readonly bench_uniform: (a: number, b: number) => number;
  readonly bench_variable: (a: number, b: number) => number;
  readonly get_version: (a: number) => void;
  readonly init: () => void;
  readonly quantumfenwick_batch_update: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly quantumfenwick_find_index: (a: number, b: number) => number;
  readonly quantumfenwick_get_size: (a: number, b: number) => number;
  readonly quantumfenwick_is_empty: (a: number) => number;
  readonly quantumfenwick_len: (a: number) => number;
  readonly quantumfenwick_new: (a: number, b: number) => number;
  readonly quantumfenwick_new_uniform: (a: number, b: number) => number;
  readonly quantumfenwick_prefix_sum: (a: number, b: number) => number;
  readonly quantumfenwick_total: (a: number) => number;
  readonly quantumfenwick_update: (a: number, b: number, c: number) => void;
  readonly quantumprofiler_add: (a: number, b: number) => void;
  readonly quantumprofiler_avg: (a: number) => number;
  readonly quantumprofiler_fps: (a: number) => number;
  readonly quantumprofiler_max: (a: number) => number;
  readonly quantumprofiler_min: (a: number) => number;
  readonly quantumprofiler_new: (a: number) => number;
  readonly quantumprofiler_reset: (a: number) => void;
  readonly quantumuniform_calc_range: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly quantumuniform_free: (a: number) => void;
  readonly quantumuniform_get_index: (a: number, b: number) => number;
  readonly quantumuniform_get_indices: (a: number, b: number, c: number) => number;
  readonly quantumuniform_get_offset: (a: number, b: number) => number;
  readonly quantumuniform_get_offsets: (a: number, b: number, c: number) => number;
  readonly quantumuniform_get_sizes: (a: number, b: number) => number;
  readonly quantumuniform_item_count: (a: number) => number;
  readonly quantumuniform_new: (a: number, b: number) => number;
  readonly quantumuniform_range_changed: (a: number, b: number, c: number, d: number) => number;
  readonly quantumuniform_set_count: (a: number, b: number) => void;
  readonly quantumuniform_set_item_size: (a: number, b: number) => void;
  readonly quantumuniform_set_velocity: (a: number, b: number) => void;
  readonly quantumvariable_batch_update: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly quantumvariable_calc_range: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly quantumvariable_free: (a: number) => void;
  readonly quantumvariable_getRangeAndTotalHeight: (a: number, b: number, c: number, d: number) => number;
  readonly quantumvariable_get_indices: (a: number, b: number, c: number) => number;
  readonly quantumvariable_get_offsets: (a: number, b: number, c: number) => number;
  readonly quantumvariable_get_sizes: (a: number, b: number, c: number) => number;
  readonly quantumvariable_new: (a: number, b: number) => number;
  readonly quantumvariable_new_uniform: (a: number, b: number) => number;
  readonly quantumvariable_set_velocity: (a: number, b: number) => void;
  readonly quantumvariable_update_size: (a: number, b: number, c: number) => void;
  readonly run_benchmarks: (a: number) => void;
  readonly virtualitem_free: (a: number) => void;
  readonly virtualitem_new: (a: number, b: number, c: number) => number;
  readonly virtualrangeresult_free: (a: number) => void;
  readonly virtualrangeresult_get_indices: (a: number) => number;
  readonly virtualrangeresult_get_item: (a: number, b: number) => number;
  readonly virtualrangeresult_get_offsets: (a: number) => number;
  readonly virtualrangeresult_get_sizes: (a: number) => number;
  readonly virtualrangeresult_items_count: (a: number) => number;
  readonly __wbg_set_virtualrangeresult_total_height: (a: number, b: number) => void;
  readonly quantumvariable_get_index: (a: number, b: number) => number;
  readonly quantumvariable_get_size: (a: number, b: number) => number;
  readonly __wbg_get_virtualrangeresult_total_height: (a: number) => number;
  readonly quantumvariable_get_offset: (a: number, b: number) => number;
  readonly quantumuniform_item_size: (a: number) => number;
  readonly quantumuniform_total_height: (a: number) => number;
  readonly quantumvariable_item_count: (a: number) => number;
  readonly quantumvariable_total_height: (a: number) => number;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
