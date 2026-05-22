/**
 * React-only Warper types. Pulled in only by consumers of the React adapter.
 */

import React from 'react';
import type { VirtualizerOptions } from './core';

export interface DisplayItem {
  index: number;
  style: React.CSSProperties;
  measureElement?: (element: HTMLElement | null) => void;
}

export interface WarperComponentProps<T> extends VirtualizerOptions<T> {
  children: (index: number, style: React.CSSProperties) => React.ReactNode;
  onRendered?: () => void;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: (error: Error) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
