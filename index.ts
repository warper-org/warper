/**
 * ⚡ WARPER v7.0 QUANTUM ⚡
 * The World's Fastest Virtualization Library
 * 
 * Powered by WebAssembly with:
 * - O(1) QuantumUniform operations for fixed heights
 * - O(log n) QuantumVariable operations for variable heights
 * - Branchless algorithms & 8x loop unrolling
 * - Zero-allocation hot paths
 * - 120+ FPS performance
 * - Cross-browser scroll virtualization (Chrome, Firefox, Safari, Edge)
 */

// React hooks and components
export { useVirtualizer } from './react/hooks/useVirtualizer';
export type { VirtualRange, UseVirtualizerResult } from './react/hooks/useVirtualizer';
export { WarperComponent } from './react/components/WarperComponent';
export type { WarperComponentRef, WarperComponentProps } from './react/components/WarperComponent';
export { FPSMonitor } from './react/components/FPSMonitor';
export { PerformanceMonitor, usePerformanceMonitor } from './react/components/PerformanceMonitor';
export type { PerformanceMetrics, PerformanceMonitorProps } from './react/components/PerformanceMonitor';
export { TestRunner, useTestRunner } from './react/components/TestRunner';
export type { TestConfig, TestMetrics, TestRunnerProps, TestBreakdown, TestPreset } from './react/components/TestRunner';

// Types
export type { VirtualizerOptions, VirtualItem, DisplayItem } from './types';

// Logging configuration
export { setLogging, isLoggingEnabled } from './core/wasm';

// Core WASM utilities - New QUANTUM API
export { 
  initializeWasm, 
  createVirtualizer, 
  createUniformVirtualizer,
  getWasmStatus,
  getWasmPerformanceStats,
  getRangeData,
  getRangeDataFast,
  getUniformRangeInfo,
  getUniformIndices,
  getUniformOffsets,
  runBenchmark,
  runUniformBenchmark,
  runVariableBenchmark,
  runFullBenchmark,
  // Benchmark functions
  get_version,
  bench_fenwick,
  bench_uniform,
  bench_variable,
  run_benchmarks,
  benchmark_fenwick,
  benchmark_uniform,
  benchmark_variable,
  run_full_benchmark,
  // Types only (classes are dynamically loaded)
  type QuantumVariable,
  type QuantumUniform,
  type QuantumFenwick,
  type QuantumProfiler,
  type Virtualizer,
  type UniformVirtualizer,
  type FenwickTree,
  type PerformanceProfiler,
  type WasmStatus,
  type VirtualItemData,
  type VirtualRangeData,
  type VirtualItem as WasmVirtualItem,
  type VirtualRangeResult,
} from './core/wasm';
