import React from 'react';

export interface VirtualItem {
  index: number;
  offset_top: number;
  size: number;
}

export interface DisplayItem {
  index: number;
  style: React.CSSProperties;
}

export interface VirtualizerOptions<T> {
  itemCount: number;
  estimateSize: (index: number) => number;
  data?: T[]; // Data is optional now
  overscan?: number;
  height: number;
  scrollTop?: number;
}

export interface WarperComponentProps<T> extends VirtualizerOptions<T> {
  children: (index: number, style: React.CSSProperties) => React.ReactNode;
  onRendered?: () => void;
}
