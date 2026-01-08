/**
 * ⚡ WARPER v7.0 BLAZING WarperComponent ⚡
 * 
 * Ultra-fast Virtualized List Component - 120+ FPS ENGINE
 * Minimal allocations, GPU-accelerated transforms, optimized rendering
 */

import React, { memo, useImperativeHandle, forwardRef, CSSProperties, useCallback, useMemo, useEffect, useRef } from 'react';
import { useVirtualizer } from '../hooks/useVirtualizer';
import { VirtualizerOptions } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface WarperComponentProps<T> extends VirtualizerOptions<T> {
  children: (index: number) => React.ReactNode;
  onRendered?: () => void;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: (error: Error) => React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface WarperComponentRef {
  element: HTMLDivElement | null;
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
}

// ============================================================================
// Row Component - Ultra minimal, no paddingTop dependency
// ============================================================================

const baseRowStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  contain: 'layout style paint',
  willChange: 'transform',
};

interface RowProps {
  index: number;
  offset: number;
  size: number;
  render: (index: number) => React.ReactNode;
}

const Row = memo(function Row({ index, offset, size, render }: RowProps) {
  return (
    <div 
      style={{
        ...baseRowStyle,
        transform: `translateY(${offset}px)`,
        height: size,
      }} 
      data-index={index}
    >
      {render(index)}
    </div>
  );
}, (prev, next) => 
  prev.index === next.index &&
  prev.offset === next.offset &&
  prev.size === next.size &&
  prev.render === next.render
);

// ============================================================================
// Container Styles
// ============================================================================

const containerBaseStyle: CSSProperties = {
  width: '100%',
  overflow: 'auto',
  position: 'relative',
  overscrollBehavior: 'contain',
  contain: 'strict',
};

// ============================================================================
// Main Component
// ============================================================================

function WarperComponentInner<T>(
  {
    itemCount,
    estimateSize,
    children,
    overscan = 3,
    height,
    horizontal = false,
    className,
    style,
    loadingPlaceholder,
    errorPlaceholder,
    onRendered,
  }: WarperComponentProps<T>,
  ref: React.ForwardedRef<WarperComponentRef>
) {
  const elementRef = useRef<HTMLDivElement>(null);

  const {
    scrollElementRef,
    range,
    isLoading,
    error,
    scrollToOffset,
    scrollToIndex,
  } = useVirtualizer<T, HTMLDivElement>({
    itemCount,
    estimateSize,
    overscan,
    horizontal,
  });

  const handleRef = useCallback((el: HTMLDivElement | null) => {
    (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    scrollElementRef(el);
  }, [scrollElementRef]);

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
    scrollToOffset,
    scrollToIndex,
  }), [scrollToOffset, scrollToIndex]);

  const renderedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && onRendered && !renderedRef.current) {
      renderedRef.current = true;
      onRendered();
    }
  }, [isLoading, onRendered]);

  const containerStyle = useMemo<CSSProperties>(() => ({
    ...containerBaseStyle,
    height: height ?? '100%',
    ...style,
  }), [height, style]);

  const innerStyle = useMemo<CSSProperties>(() => ({
    width: '100%',
    position: 'relative' as const,
    height: range.totalHeight || 1,
    pointerEvents: 'none' as const,
  }), [range.totalHeight]);

  const renderFn = useCallback((index: number) => children(index), [children]);

  if (error) {
    return (
      <div ref={handleRef} style={containerStyle} className={className}>
        {errorPlaceholder ? errorPlaceholder(error) : (
          <div style={{ padding: 20, color: '#ef4444' }}>⚠️ Error: {error.message}</div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div ref={handleRef} style={containerStyle} className={className}>
        {loadingPlaceholder ?? <div style={{ padding: 20, color: '#888' }}>Loading...</div>}
      </div>
    );
  }

  const { items, offsets, sizes, paddingTop } = range;

  return (
    <div ref={handleRef} style={containerStyle} className={className} data-warper-container>
      <div style={innerStyle} data-warper-inner>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${paddingTop}px)`,
            willChange: 'transform',
          }}
          data-warper-viewport
        >
          {items.map((itemIndex, i) => (
            <Row
              key={itemIndex}
              index={itemIndex}
              offset={offsets[i]}
              size={sizes[i]}
              render={renderFn}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const WarperComponent = forwardRef(WarperComponentInner) as <T>(
  props: WarperComponentProps<T> & { ref?: React.Ref<WarperComponentRef> }
) => React.ReactElement;
