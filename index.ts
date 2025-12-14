/**
 * ⚡ WARPER v5.0 QUANTUM ⚡
 * The World's Fastest Virtualization Library
 * 
 * Powered by WebAssembly with:
 * - O(1) QuantumUniform operations for fixed heights
 * - O(log n) QuantumVariable operations for variable heights
 * - Branchless algorithms & 8x loop unrolling
 * - Zero-allocation hot paths
 * - 120+ FPS performance
 */

// React hooks and components
export { useVirtualizer } from './react/hooks/useVirtualizer';
export type { VirtualRange, UseVirtualizerResult } from './react/hooks/useVirtualizer';
export { WarperComponent } from './react/components/WarperComponent';
export type { WarperComponentRef, WarperComponentProps } from './react/components/WarperComponent';
export { FPSMonitor } from './react/components/FPSMonitor';
export { PerformanceMonitor, usePerformanceMonitor } from './react/components/PerformanceMonitor';
export type { PerformanceMetrics, PerformanceMonitorProps } from './react/components/PerformanceMonitor';

// Types
export type { VirtualizerOptions, VirtualItem, DisplayItem } from './types';

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
  // New QUANTUM classes
  QuantumVariable,
  QuantumUniform,
  QuantumFenwick,
  QuantumProfiler,
  // Legacy aliases
  Virtualizer,
  UniformVirtualizer,
  FenwickTree,
  PerformanceProfiler,
  type WasmStatus,
  type VirtualItemData,
  type VirtualRangeData,
} from './core/wasm';
