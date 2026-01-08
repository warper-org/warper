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
// STYLES
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
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#0f0f14',
    borderBottom: '1px solid #1a1a24',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  list: {
    flex: 1,
    overflow: 'hidden',
    margin: '16px 20px',
    borderRadius: '8px',
    border: '1px solid #1a1a24',
    background: '#0f0f14',
    minHeight: 0,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '70px 1fr 1fr 80px 90px 100px 80px',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid #1a1a24',
    fontSize: '11px',
    height: '100%',
    boxSizing: 'border-box' as const,
    color: '#e4e4e7',
    gap: '8px',
  },
  cell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    padding: '10px 0',
  },
  floatingPanel: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0f0f14',
    border: '1px solid #1a1a24',
    borderRadius: '12px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '10px',
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  input: {
    width: '70px',
    padding: '6px 10px',
    background: '#0a0a0f',
    border: '1px solid #1a1a24',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  select: {
    padding: '6px 10px',
    background: '#0a0a0f',
    border: '1px solid #1a1a24',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  button: {
    padding: '6px 14px',
    background: '#00d4aa20',
    border: '1px solid #00d4aa40',
    borderRadius: '4px',
    color: '#00d4aa',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  buttonActive: {
    background: '#00d4aa',
    color: '#0a0a0f',
  },
  divider: {
    width: '1px',
    height: '24px',
    background: '#1a1a24',
  },
  testPanel: {
    position: 'fixed' as const,
    top: '80px',
    right: '20px',
    zIndex: 1000,
    maxHeight: 'calc(100vh - 180px)',
    overflow: 'auto',
  },
};

// ============================================================================
// DATA GENERATION
// ============================================================================

function generateHash(index: number): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  const seed = index * 2654435761;
  for (let i = 0; i < 16; i++) {
    hash += chars[(seed * (i + 1) * 7) % 16];
  }
  return hash;
}

function generateTimestamp(index: number): string {
  const base = Date.now() - index * 1000;
  const date = new Date(base);
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

const statuses = ['confirmed', 'pending', 'failed'];
const types = ['transfer', 'swap', 'stake', 'mint', 'burn', 'bridge'];

function generateTransaction(index: number) {
  return {
    index,
    hash: generateHash(index),
    timestamp: generateTimestamp(index),
    type: types[index % types.length],
    status: statuses[index % statuses.length],
    amount: ((index * 137) % 100000) / 100,
    gas: ((index * 31) % 50000) + 21000,
  };
}

// ============================================================================
// ROW COMPONENT
// ============================================================================

const DOT_STYLES: Record<string, React.CSSProperties> = {
  confirmed: { width: '5px', height: '5px', borderRadius: '50%', background: '#00d4aa', flexShrink: 0 },
  pending: { width: '5px', height: '5px', borderRadius: '50%', background: '#eab308', flexShrink: 0 },
  failed: { width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 },
};

const TYPE_COLORS: Record<string, string> = {
  transfer: '#3b82f6',
  swap: '#a855f7',
  stake: '#00d4aa',
  mint: '#22c55e',
  burn: '#ef4444',
  bridge: '#f97316',
};

const FastRow = React.memo(function FastRow({ index, isMobile }: { index: number; isMobile?: boolean }) {
  const tx = generateTransaction(index);
  
  if (isMobile) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 80px',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid #1a1a24',
        fontSize: '11px',
        height: '100%',
        boxSizing: 'border-box' as const,
        color: '#e4e4e7',
        gap: '8px',
      }}>
        <div style={{ ...styles.cell, color: TYPE_COLORS[tx.type] || '#71717a' }}>{tx.type}</div>
        <div style={styles.cell}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={DOT_STYLES[tx.status]} />
            <span style={{ fontSize: '10px' }}>{tx.status}</span>
          </span>
        </div>
        <div style={{ ...styles.cell, color: '#00d4aa', fontSize: '10px' }}>{tx.amount.toFixed(2)}</div>
      </div>
    );
  }
  
  return (
    <div style={styles.row}>
      <div style={{ ...styles.cell, color: '#52525b' }}>{tx.index}</div>
      <div style={{ ...styles.cell, color: '#71717a' }}>{tx.hash}</div>
      <div style={{ ...styles.cell, color: '#a1a1aa' }}>{tx.timestamp}</div>
      <div style={{ ...styles.cell, color: TYPE_COLORS[tx.type] || '#71717a' }}>{tx.type}</div>
      <div style={styles.cell}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style={DOT_STYLES[tx.status]} />
          {tx.status}
        </span>
      </div>
      <div style={{ ...styles.cell, color: '#00d4aa' }}>{tx.amount.toFixed(2)} ETH</div>
      <div style={{ ...styles.cell, color: '#71717a' }}>{tx.gas}</div>
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function StressTest() {
  const { isMobile, isDesktop } = useResponsive();
  const [rowCount, setRowCount] = useState(1000000);
  const [rowCountInput, setRowCountInput] = useState('1000000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(100);
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random' | 'bounce'>('smooth');
  const [showBenchmark, setShowBenchmark] = useState(false);
  
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();

  const rowHeight = 38;

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
          element.scrollTop += (Math.random() - 0.5) * scrollAmount * 6;
          break;
          
        case 'bounce':
          element.scrollTop += scrollAmount * scrollDirectionRef.current;
          if (Math.random() < 0.01) {
            scrollDirectionRef.current *= -1;
          }
          if (element.scrollTop >= element.scrollHeight - element.clientHeight) {
            scrollDirectionRef.current = -1;
          } else if (element.scrollTop <= 0) {
            scrollDirectionRef.current = 1;
          }
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

  const presets = isMobile
    ? [
        { label: '100K', value: 100000 },
        { label: '1M', value: 1000000 },
      ]
    : [
        { label: '100K', value: 100000 },
        { label: '1M', value: 1000000 },
        { label: '5M', value: 5000000 },
        { label: '10M', value: 10000000 },
      ];

  const renderRow = useCallback((index: number) => (
    <FastRow index={index} isMobile={isMobile} />
  ), [isMobile]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ ...styles.header, padding: isMobile ? '10px 12px' : '12px 20px' }}>
        <div style={{ ...styles.title, fontSize: isMobile ? '12px' : '14px' }}>
          <span style={{ color: '#ef4444' }}>[</span>
          stress_test
          <span style={{ color: '#ef4444' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {rowCount.toLocaleString()}{isMobile ? '' : ' transactions'}
          </span>
        </div>
        {isDesktop && <PerformanceMonitor metrics={metrics} />}
      </div>
      
      {/* Table Header */}
      <div style={{ 
        ...styles.list, 
        flex: 'none', 
        margin: isMobile ? '12px 12px 0' : '16px 20px 0', 
        borderRadius: '8px 8px 0 0',
        marginBottom: 0,
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 80px 80px' : '70px 1fr 1fr 80px 90px 100px 80px',
          alignItems: 'center',
          padding: isMobile ? '0 12px' : '0 16px',
          background: '#0a0a0f', 
          color: '#71717a', 
          fontSize: '9px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px', 
          height: '36px',
          gap: '8px',
        }}>
          {isMobile ? (
            <>
              <div style={styles.cell}>type</div>
              <div style={styles.cell}>status</div>
              <div style={styles.cell}>amount</div>
            </>
          ) : (
            <>
              <div style={styles.cell}>#</div>
              <div style={styles.cell}>tx_hash</div>
              <div style={styles.cell}>timestamp</div>
              <div style={styles.cell}>type</div>
              <div style={styles.cell}>status</div>
              <div style={styles.cell}>amount</div>
              <div style={styles.cell}>gas</div>
            </>
          )}
        </div>
      </div>
      
      {/* Virtualized List */}
      <div style={{ 
        ...styles.list, 
        marginTop: 0, 
        borderRadius: '0 0 8px 8px', 
        borderTop: 'none',
        marginBottom: '80px',
        margin: isMobile ? '0 12px 80px' : undefined,
      }}>
        <WarperComponent
          ref={warperRef}
          itemCount={rowCount}
          estimateSize={() => rowHeight}
          overscan={3}
          style={{ height: '100%' }}
          onRendered={recordRender}
        >
          {renderRow}
        </WarperComponent>
      </div>
      
      {/* Floating Control Panel */}
      <div style={{
        ...styles.floatingPanel,
        padding: isMobile ? '10px 14px' : '12px 20px',
        gap: isMobile ? '10px' : '16px',
        flexWrap: 'wrap' as const,
        maxWidth: isMobile ? 'calc(100% - 24px)' : undefined,
        justifyContent: 'center',
      }}>
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
            <div style={styles.divider} />
            
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
            
            <select
              value={scrollPattern}
              onChange={(e) => setScrollPattern(e.target.value as any)}
              style={styles.select}
            >
              <option value="smooth">smooth</option>
              <option value="jump">jump</option>
              <option value="random">random</option>
              <option value="bounce">bounce</option>
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
          {isAutoScrolling ? '■ stop' : '▶ run'}
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
    <StressTest />
  </StrictMode>
);
