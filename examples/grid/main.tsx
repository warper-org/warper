import React, { StrictMode, useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  WarperComponent,
  usePerformanceMonitor,
  PerformanceMonitor,
  WarperComponentRef,
  TestRunner,
  TestConfig,
} from '../../index';

// ============================================================================
// RESPONSIVE STYLES
// ============================================================================
const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
    overflow: 'hidden',
  },
  header: {
    padding: 'clamp(8px, 2vw, 16px) clamp(12px, 3vw, 24px)',
    borderBottom: '1px solid #1a1a24',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'clamp(8px, 2vw, 20px)',
    background: '#0f0f14',
    flexWrap: 'wrap' as const,
  },
  title: {
    fontSize: 'clamp(11px, 2vw, 14px)',
    fontWeight: 600,
    color: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(6px, 1.5vw, 12px)',
    flexWrap: 'wrap' as const,
    flex: 1,
    justifyContent: 'flex-end',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  label: {
    fontSize: 'clamp(8px, 1.5vw, 10px)',
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  input: {
    width: 'clamp(45px, 8vw, 60px)',
    padding: 'clamp(3px, 0.5vw, 5px) clamp(4px, 1vw, 8px)',
    background: '#0a0a0f',
    border: '1px solid #1a1a24',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: 'clamp(9px, 1.5vw, 11px)',
    fontFamily: 'inherit',
    outline: 'none',
  },
  select: {
    padding: 'clamp(3px, 0.5vw, 5px) clamp(4px, 1vw, 8px)',
    background: '#0a0a0f',
    border: '1px solid #1a1a24',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: 'clamp(9px, 1.5vw, 11px)',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  button: {
    padding: 'clamp(3px, 0.5vw, 5px) clamp(8px, 1.5vw, 12px)',
    background: '#00d4aa20',
    border: '1px solid #00d4aa40',
    borderRadius: '4px',
    color: '#00d4aa',
    fontSize: 'clamp(8px, 1.5vw, 10px)',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap' as const,
  },
  buttonActive: {
    background: '#00d4aa',
    color: '#0a0a0f',
  },
  grid: {
    flex: 1,
    overflow: 'hidden',
    margin: 'clamp(8px, 2vw, 16px) clamp(12px, 3vw, 24px)',
    borderRadius: '8px',
    border: '1px solid #1a1a24',
    background: '#0f0f14',
    minHeight: 0,
  },
  testPanel: {
    position: 'fixed' as const,
    top: 'clamp(60px, 10vh, 80px)',
    right: 'clamp(8px, 2vw, 24px)',
    zIndex: 1000,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 100px)',
    overflow: 'auto',
  },
};

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================
function useResponsive() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    isMobile: width < 480,
    isTablet: width >= 480 && width < 768,
    isDesktop: width >= 768,
    width,
  };
}

// ============================================================================
// DATA GENERATION
// ============================================================================
const columnDefs = [
  { key: 'id', label: 'id', minWidth: 50, flex: 0.8 },
  { key: 'ticker', label: 'ticker', minWidth: 50, flex: 0.8 },
  { key: 'price', label: 'price', minWidth: 60, flex: 1 },
  { key: 'change', label: 'change', minWidth: 60, flex: 0.9 },
  { key: 'volume', label: 'volume', minWidth: 70, flex: 1 },
  { key: 'mktCap', label: 'mkt_cap', minWidth: 80, flex: 1.2 },
  { key: 'pe', label: 'p/e', minWidth: 45, flex: 0.7 },
  { key: 'sector', label: 'sector', minWidth: 60, flex: 1 },
];

const mobileColumns = ['ticker', 'price', 'change'];
const tabletColumns = ['ticker', 'price', 'change', 'volume', 'sector'];

const tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC', 'ORCL'];
const sectors = ['tech', 'finance', 'health', 'energy', 'retail', 'auto', 'media', 'telecom'];

function generateStockData(index: number) {
  const seed = index * 2654435761;
  const ticker = tickers[index % tickers.length];
  const basePrice = 50 + (seed % 500);
  const change = ((seed % 2000) - 1000) / 100;
  const volume = (seed % 10000000) + 100000;
  const mktCap = basePrice * volume * 100;
  const pe = 10 + (seed % 40);
  
  return {
    id: `#${String(index).padStart(6, '0')}`,
    ticker,
    price: basePrice,
    change,
    volume,
    mktCap,
    pe,
    sector: sectors[index % sectors.length],
  };
}

// ============================================================================
// RESPONSIVE GRID ROW
// ============================================================================
const GridRow = React.memo(function GridRow({ 
  index, 
  visibleColumns 
}: { 
  index: number; 
  visibleColumns: typeof columnDefs;
}) {
  const data = generateStockData(index);
  
  const getCellContent = (key: string) => {
    switch (key) {
      case 'id': return { value: data.id, color: '#52525b' };
      case 'ticker': return { value: data.ticker, color: '#3b82f6' };
      case 'price': return { value: `$${data.price.toFixed(2)}`, color: '#e4e4e7' };
      case 'change': return { 
        value: `${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%`, 
        color: data.change >= 0 ? '#00d4aa' : '#ef4444' 
      };
      case 'volume': return { value: (data.volume / 1000000).toFixed(2) + 'M', color: '#a1a1aa' };
      case 'mktCap': return { value: '$' + (data.mktCap / 1000000000).toFixed(1) + 'B', color: '#a855f7' };
      case 'pe': return { value: data.pe.toFixed(1), color: '#71717a' };
      case 'sector': return { value: data.sector, color: '#eab308' };
      default: return { value: '', color: '#e4e4e7' };
    }
  };
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: visibleColumns.map(c => `minmax(${c.minWidth}px, ${c.flex}fr)`).join(' '),
      borderBottom: '1px solid #1a1a24',
      fontSize: 'clamp(9px, 1.5vw, 11px)',
      height: '100%',
      alignItems: 'center',
      padding: '0 clamp(8px, 2vw, 12px)',
      gap: 'clamp(4px, 1vw, 8px)',
    }}>
      {visibleColumns.map((col) => {
        const { value, color } = getCellContent(col.key);
        return (
          <div
            key={col.key}
            style={{
              color,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: 'clamp(6px, 1vw, 10px) 0',
            }}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
function GridExample() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const [rowCount, setRowCount] = useState(100000);
  const [rowCountInput, setRowCountInput] = useState('100000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [scrollSpeedInput, setScrollSpeedInput] = useState('50');
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random'>('smooth');
  const [showBenchmark, setShowBenchmark] = useState(false);
  
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();

  // Responsive columns
  const visibleColumns = isMobile 
    ? columnDefs.filter(c => mobileColumns.includes(c.key))
    : isTablet 
      ? columnDefs.filter(c => tabletColumns.includes(c.key))
      : columnDefs;
  
  const rowHeight = isMobile ? 32 : 36;
  
  const testConfig: TestConfig = {
    itemCount: rowCount,
    itemHeight: rowHeight,
    scrollSpeed: 5000,
    sampleCount: 50,
  };

  useEffect(() => {
    if (!isAutoScrolling) return;
    
    const element = warperRef.current?.element;
    if (!element) return;
    
    let rafId: number;
    let lastTime = performance.now();
    
    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      const pixelsPerMs = scrollSpeed * 0.5;
      const scrollAmount = pixelsPerMs * delta;
      
      switch (scrollPattern) {
        case 'smooth':
          element.scrollTop += scrollAmount * scrollDirectionRef.current;
          if (element.scrollTop >= element.scrollHeight - element.clientHeight) {
            scrollDirectionRef.current = -1;
          } else if (element.scrollTop <= 0) {
            scrollDirectionRef.current = 1;
          }
          break;
        case 'jump':
          if (Math.random() < 0.02) {
            element.scrollTop = Math.random() * (element.scrollHeight - element.clientHeight);
          }
          break;
        case 'random':
          element.scrollTop += (Math.random() - 0.5) * scrollAmount * 5;
          break;
      }
      
      rafId = requestAnimationFrame(scroll);
    };
    
    rafId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafId);
  }, [isAutoScrolling, scrollSpeed, scrollPattern]);

  const applyRowCount = useCallback(() => {
    const count = parseInt(rowCountInput, 10);
    if (!isNaN(count) && count > 0 && count <= 10000000) {
      setRowCount(count);
    }
  }, [rowCountInput]);

  const applyScrollSpeed = useCallback(() => {
    const speed = parseFloat(scrollSpeedInput);
    if (!isNaN(speed) && speed > 0) {
      setScrollSpeed(Math.min(100, speed));
    }
  }, [scrollSpeedInput]);

  const presets = isMobile 
    ? [{ label: '10K', value: 10000 }, { label: '100K', value: 100000 }]
    : [
        { label: '10K', value: 10000 },
        { label: '100K', value: 100000 },
        { label: '500K', value: 500000 },
        { label: '1M', value: 1000000 },
      ];

  const renderRow = useCallback((index: number) => (
    <GridRow index={index} visibleColumns={visibleColumns} />
  ), [visibleColumns]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ color: '#a855f7' }}>[</span>
          data_grid
          <span style={{ color: '#a855f7' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {(rowCount * visibleColumns.length).toLocaleString()} {isMobile ? '' : 'cells'}
          </span>
        </div>
        
        <div style={styles.controls}>
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setRowCount(preset.value);
                setRowCountInput(String(preset.value));
              }}
              style={{
                ...styles.button,
                ...(rowCount === preset.value ? styles.buttonActive : {}),
              }}
            >
              {preset.label}
            </button>
          ))}
          
          {isDesktop && (
            <>
              <div style={{ width: '1px', height: '20px', background: '#1a1a24' }} />
              
              <div style={styles.controlGroup}>
                <span style={styles.label}>rows</span>
                <input
                  type="text"
                  value={rowCountInput}
                  onChange={(e) => setRowCountInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyRowCount()}
                  onBlur={applyRowCount}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.controlGroup}>
                <span style={styles.label}>speed</span>
                <input
                  type="text"
                  value={scrollSpeedInput}
                  onChange={(e) => setScrollSpeedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyScrollSpeed()}
                  onBlur={applyScrollSpeed}
                  style={{ ...styles.input, width: '45px' }}
                />
              </div>
              
              <select
                value={scrollPattern}
                onChange={(e) => setScrollPattern(e.target.value as any)}
                style={styles.select}
              >
                <option value="smooth">smooth</option>
                <option value="jump">jump</option>
                <option value="random">random</option>
              </select>
            </>
          )}
          
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            style={{
              ...styles.button,
              ...(isAutoScrolling ? styles.buttonActive : {}),
            }}
          >
            {isAutoScrolling ? '■ stop' : '▶ scroll'}
          </button>
          
          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            style={{
              ...styles.button,
              ...(showBenchmark ? styles.buttonActive : {}),
            }}
          >
            {showBenchmark ? '✕ close' : '⚡ bench'}
          </button>
        </div>
        
        {isDesktop && <PerformanceMonitor metrics={metrics} />}
      </div>
      
      {/* Header Row */}
      <div style={{ 
        ...styles.grid, 
        flex: 'none', 
        margin: 'clamp(8px, 2vw, 16px) clamp(12px, 3vw, 24px) 0', 
        borderRadius: '8px 8px 0 0',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: visibleColumns.map(c => `minmax(${c.minWidth}px, ${c.flex}fr)`).join(' '),
          background: '#0a0a0f',
          borderBottom: '1px solid #1a1a24',
          padding: '0 clamp(8px, 2vw, 12px)',
          gap: 'clamp(4px, 1vw, 8px)',
        }}>
          {visibleColumns.map((col) => (
            <div
              key={col.key}
              style={{
                padding: 'clamp(8px, 1vw, 10px) 0',
                fontSize: 'clamp(7px, 1.2vw, 9px)',
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
              }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Virtualized Grid */}
      <div style={{ 
        ...styles.grid, 
        marginTop: 0, 
        borderRadius: '0 0 8px 8px', 
        borderTop: 'none',
      }}>
        <WarperComponent
          ref={warperRef}
          itemCount={rowCount}
          estimateSize={() => rowHeight}
          overscan={5}
          style={{ height: '100%' }}
          onRendered={recordRender}
        >
          {renderRow}
        </WarperComponent>
      </div>
      
      {/* Benchmark Panel */}
      {showBenchmark && (
        <div style={styles.testPanel}>
          <TestRunner
            config={testConfig}
            scrollRef={warperRef}
            enabled={!isAutoScrolling}
            onComplete={(results) => {
              console.log('Benchmark complete:', results);
            }}
          />
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GridExample />
  </StrictMode>
);
