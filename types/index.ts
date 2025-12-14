import React from 'react';

/**
 * Represents a single virtual item from WASM
 */
export interface VirtualItem {
  index: number;
  offset_top: number;
  size: number;
}

/**
 * Display item with styling for rendering
 */
export interface DisplayItem {
  index: number;
  style: React.CSSProperties;
  measureElement?: (element: HTMLElement | null) => void;
}

/**
 * Options for the virtualizer hook
 */
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

/**
 * Props for WarperComponent
 */
export interface WarperComponentProps<T> extends VirtualizerOptions<T> {
  /** Render function for each item */
  children: (index: number, style: React.CSSProperties) => React.ReactNode;
  /** Called when items have been rendered */
  onRendered?: () => void;
  /** Placeholder while loading */
  loadingPlaceholder?: React.ReactNode;
  /** Placeholder for errors */
  errorPlaceholder?: (error: Error) => React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

