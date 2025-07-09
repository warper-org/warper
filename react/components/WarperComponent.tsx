import React from 'react';
import { useVirtualizer } from '../hooks/useVirtualizer';
import { VirtualizerOptions } from '../../types';

interface WarperComponentProps<T> extends VirtualizerOptions<T> {
  children: (index: number, style: React.CSSProperties) => React.ReactNode;
  onRendered?: () => void;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: (error: Error) => React.ReactNode;
}

function WarperComponentInner<T>(
  {
    data,
    itemCount,
    estimateSize,
    children,
    onRendered,
    overscan,
    height,
    loadingPlaceholder = <div>Loading...</div>,
    errorPlaceholder = (error) => <div>Error: {error.message}</div>,
  }: WarperComponentProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const innerRef = React.useRef<HTMLDivElement>(null);

  // Combine the forwarded ref with the inner ref
  React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  const { containerRef, items, totalHeight, isLoading, error } = useVirtualizer({
    itemCount,
    data,
    estimateSize,
    overscan,
    height,
    scrollTop,
  });

  React.useEffect(() => {
    if (onRendered) {
      onRendered();
    }
  }, [onRendered]);

  React.useEffect(() => {
    if (isLoading || error) {
      return;
    }
  }, [isLoading, error, onRendered]);

  if (error) {
    return <div ref={containerRef} style={{ overflow: 'auto', position: 'relative' }}>{errorPlaceholder(error)}</div>;
  }

  if (isLoading) {
    return <div ref={containerRef} style={{ overflow: 'auto', position: 'relative' }}>{loadingPlaceholder}</div>;
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div ref={innerRef} onScroll={handleScroll} style={{ height: '100%', overflow: 'auto' }}>
      <div
        ref={containerRef}
        style={{
          height: `${totalHeight}px`,
          position: 'relative',
        }}
        data-warper-scroll-container
      >
        {items.map(({ index, style }) => children(index, style))}
      </div>
    </div>
  );
}

const WarperComponent = React.forwardRef(WarperComponentInner) as <T>(
  props: WarperComponentProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;


export { WarperComponent };
