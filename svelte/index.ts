/**
 * Warper — Svelte 5 adapter entry point.
 *
 * Subpath export: `@itsmeadarsh/warper/svelte`
 *
 * No React imports in this module graph — React stays an optional peer
 * for the main entry only.
 */

export { createVirtualizer } from './hooks/createVirtualizer.svelte';
export type {
  VirtualRange,
  CreateVirtualizerResult,
} from './hooks/createVirtualizer.svelte';

export { default as Warper } from './components/Warper.svelte';

export type { VirtualizerOptions, VirtualItem } from '../types/core';

// Logging passthrough (framework-agnostic).
export { setLogging, isLoggingEnabled } from '../core/wasm';
