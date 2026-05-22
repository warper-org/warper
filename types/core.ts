/**
 * Framework-agnostic Warper types — safe to import from any adapter
 * (React, Svelte, Vue, …) without pulling in framework dependencies.
 */

export interface VirtualItem {
  index: number;
  offset_top: number;
  size: number;
}

export interface VirtualizerOptions<T> {
  /** Total number of items */
  itemCount: number;
  /** Function to estimate size for an item at index */
  estimateSize: (index: number) => number;
  /** Optional data array */
  data?: T[];
  /** Number of items to render outside visible area (default: 3) */
  overscan?: number;
  /** Fixed height of the container (optional, defaults to 100%) */
  height?: number;
  /** Initial scroll position */
  scrollTop?: number;
  /** Function to measure actual element size */
  measureElement?: (element: HTMLElement) => number;
  /** Enable horizontal mode */
  horizontal?: boolean;
}
