import React, { StrictMode, useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { WarperComponent, usePerformanceMonitor, PerformanceMonitor, WarperComponentRef } from '../../index';

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
    padding: '16px 24px',
    borderBottom: '1px solid #1a1a24',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    background: '#0f0f14',
    flexWrap: 'wrap' as const,
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  label: {
    fontSize: '10px',
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  input: {
    width: '70px',
    padding: '5px 8px',
    background: '#0a0a0f',
    border: '1px solid #1a1a24',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  select: {
    padding: '5px 8px',
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
    padding: '5px 12px',
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
  list: {
    flex: 1,
    overflow: 'hidden',
    margin: '16px 24px',
    borderRadius: '8px',
    border: '1px solid #1a1a24',
    background: '#0f0f14',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid #1a1a24',
    fontSize: '11px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  cell: {
    padding: '10px 8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

// Generate transaction hash
function generateHash(index: number): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  const seed = index * 2654435761;
  for (let i = 0; i < 16; i++) {
    hash += chars[(seed * (i + 1) * 7) % 16];
  }
  return hash;
}

// Generate timestamp
function generateTimestamp(index: number): string {
  const base = Date.now() - index * 1000;
  const date = new Date(base);
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

// Transaction statuses
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return '#00d4aa';
    case 'pending': return '#eab308';
    case 'failed': return '#ef4444';
    default: return '#71717a';
  }
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    transfer: '#3b82f6',
    swap: '#a855f7',
    stake: '#00d4aa',
    mint: '#22c55e',
    burn: '#ef4444',
    bridge: '#f97316',
  };
  return colors[type] || '#71717a';
};

// ============================================================================
// ULTRA-FAST ROW RENDERING - PRE-COMPUTED STYLES
// ============================================================================

// Pre-computed static styles for zero allocation
const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  borderBottom: '1px solid #1a1a24',
  fontSize: '11px',
  height: '100%',
  boxSizing: 'border-box',
  color: '#e4e4e7',
};

const CELL_INDEX: React.CSSProperties = { padding: '10px 8px', width: '70px', color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_HASH: React.CSSProperties = { padding: '10px 8px', width: '180px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_TIME: React.CSSProperties = { padding: '10px 8px', width: '180px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_TYPE: React.CSSProperties = { padding: '10px 8px', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_STATUS: React.CSSProperties = { padding: '10px 8px', width: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_AMOUNT: React.CSSProperties = { padding: '10px 8px', width: '100px', color: '#00d4aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_GAS: React.CSSProperties = { padding: '10px 8px', width: '80px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const STATUS_BADGE: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px' };
const DOT_CONFIRMED: React.CSSProperties = { width: '5px', height: '5px', borderRadius: '50%', background: '#00d4aa' };
const DOT_PENDING: React.CSSProperties = { width: '5px', height: '5px', borderRadius: '50%', background: '#eab308' };
const DOT_FAILED: React.CSSProperties = { width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444' };

// Pre-computed type cell styles
const TYPE_STYLES: Record<string, React.CSSProperties> = {
  transfer: { ...CELL_TYPE, color: '#3b82f6' },
  swap: { ...CELL_TYPE, color: '#a855f7' },
  stake: { ...CELL_TYPE, color: '#00d4aa' },
  mint: { ...CELL_TYPE, color: '#22c55e' },
  burn: { ...CELL_TYPE, color: '#ef4444' },
  bridge: { ...CELL_TYPE, color: '#f97316' },
};

// Ultra-fast row component
const FastRow = React.memo(function FastRow({ index }: { index: number }) {
  const tx = generateTransaction(index);
  const dotStyle = tx.status === 'confirmed' ? DOT_CONFIRMED : tx.status === 'pending' ? DOT_PENDING : DOT_FAILED;
  const typeStyle = TYPE_STYLES[tx.type] || CELL_TYPE;
  
  return (
    <div style={ROW_STYLE}>
      <div style={CELL_INDEX}>{tx.index}</div>
      <div style={CELL_HASH}>{tx.hash}</div>
      <div style={CELL_TIME}>{tx.timestamp}</div>
      <div style={typeStyle}>{tx.type}</div>
      <div style={CELL_STATUS}>
        <span style={STATUS_BADGE}>
          <span style={dotStyle} />
          {tx.status}
        </span>
      </div>
      <div style={CELL_AMOUNT}>{tx.amount.toFixed(2)} ETH</div>
      <div style={CELL_GAS}>{tx.gas}</div>
    </div>
  );
});

function StressTest() {
  const [rowCount, setRowCount] = useState(1000000);
  const [rowCountInput, setRowCountInput] = useState('1000000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(100);
  const [scrollSpeedInput, setScrollSpeedInput] = useState('100');
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random' | 'bounce' | 'teleport'>('smooth');
  const [stressMode, setStressMode] = useState<'normal' | 'extreme' | 'chaos'>('normal');
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();

  // Performant auto-scroll with stress modes
  useEffect(() => {
    if (!isAutoScrolling) return;
    
    const element = warperRef.current?.element;
    if (!element) return;
    
    let rafId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    
    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      frameCount++;
      
      const baseSpeed = scrollSpeed * (stressMode === 'chaos' ? 3 : stressMode === 'extreme' ? 2 : 1);
      const pixelsPerMs = baseSpeed * 0.5;
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
          if (frameCount % 30 === 0) {
            element.scrollTop = Math.random() * (element.scrollHeight - element.clientHeight);
          }
          break;
          
        case 'random':
          element.scrollTop += (Math.random() - 0.5) * scrollAmount * 6;
          break;
          
        case 'bounce':
          element.scrollTop += scrollAmount * scrollDirectionRef.current;
          if (Math.random() < 0.01 * (stressMode === 'chaos' ? 5 : 1)) {
            scrollDirectionRef.current *= -1;
          }
          if (element.scrollTop >= element.scrollHeight - element.clientHeight) {
            scrollDirectionRef.current = -1;
          } else if (element.scrollTop <= 0) {
            scrollDirectionRef.current = 1;
          }
          break;
          
        case 'teleport':
          if (frameCount % 10 === 0) {
            element.scrollTop = Math.random() * (element.scrollHeight - element.clientHeight);
          }
          break;
      }
      
      rafId = requestAnimationFrame(scroll);
    };
    
    rafId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafId);
  }, [isAutoScrolling, scrollSpeed, scrollPattern, stressMode]);

  const applyRowCount = () => {
    const count = parseInt(rowCountInput, 10);
    if (!isNaN(count) && count > 0 && count <= 10000000) {
      setRowCount(count);
    }
  };

  const applyScrollSpeed = () => {
    const speed = parseFloat(scrollSpeedInput);
    if (!isNaN(speed) && speed > 0) {
      setScrollSpeed(Math.min(100, speed));
    }
  };

  const presets = [
    { label: '100K', value: 100000 },
    { label: '1M', value: 1000000 },
    { label: '5M', value: 5000000 },
    { label: '10M', value: 10000000 },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ color: '#ef4444' }}>[</span>
          stress_test
          <span style={{ color: '#ef4444' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {rowCount.toLocaleString()} transactions
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
            <option value="bounce">bounce</option>
            <option value="teleport">teleport</option>
          </select>
          
          <select
            value={stressMode}
            onChange={(e) => setStressMode(e.target.value as any)}
            style={styles.select}
          >
            <option value="normal">normal</option>
            <option value="extreme">extreme</option>
            <option value="chaos">chaos</option>
          </select>
          
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            style={{
              ...styles.button,
              ...(isAutoScrolling ? styles.buttonActive : {}),
            }}
          >
            {isAutoScrolling ? '■ stop' : '▶ run'}
          </button>
        </div>
        
        <PerformanceMonitor metrics={metrics} />
      </div>
      
      {/* Header Row */}
      <div style={{ ...styles.list, flex: 'none', margin: '16px 24px 0', borderRadius: '8px 8px 0 0' }}>
        <div style={{ ...styles.row, background: '#0a0a0f', color: '#71717a', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', height: '36px' }}>
          <div style={{ ...styles.cell, width: '70px' }}>#</div>
          <div style={{ ...styles.cell, width: '180px' }}>tx_hash</div>
          <div style={{ ...styles.cell, width: '180px' }}>timestamp</div>
          <div style={{ ...styles.cell, width: '80px' }}>type</div>
          <div style={{ ...styles.cell, width: '90px' }}>status</div>
          <div style={{ ...styles.cell, width: '100px' }}>amount</div>
          <div style={{ ...styles.cell, width: '80px' }}>gas</div>
        </div>
      </div>
      
      {/* Virtualized List */}
      <div style={{ ...styles.list, marginTop: 0, borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
        <WarperComponent
          ref={warperRef}
          itemCount={rowCount}
          estimateSize={() => 38}
          overscan={stressMode === 'chaos' ? 0 : stressMode === 'extreme' ? 2 : 3}
          style={{ height: '100%' }}
          onRendered={recordRender}
        >
          {(index) => <FastRow index={index} />}
        </WarperComponent>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StressTest />
  </StrictMode>
);