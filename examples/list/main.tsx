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

const departments = ['engineering', 'design', 'product', 'marketing', 'sales', 'support', 'hr', 'finance'];
const statuses = ['active', 'away', 'busy', 'offline'];
const firstNames = ['alex', 'jordan', 'taylor', 'morgan', 'casey', 'riley', 'quinn', 'blake', 'drew', 'sage'];
const lastNames = ['chen', 'patel', 'kim', 'garcia', 'wilson', 'lee', 'walker', 'hall', 'young', 'king'];

function generateEmployee(index: number) {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return {
    id: `emp-${String(index).padStart(6, '0')}`,
    name: `${firstName}.${lastName}`,
    email: `${firstName}.${lastName}@acme.io`,
    department: departments[index % departments.length],
    status: statuses[index % statuses.length],
    salary: 50000 + (index * 137) % 150000,
    performance: Math.round((70 + (index * 17) % 30)),
  };
}

// ============================================================================
// PRE-COMPUTED STYLES
// ============================================================================

const DOT_STYLES: Record<string, React.CSSProperties> = {
  active: { width: '6px', height: '6px', borderRadius: '50%', background: '#00d4aa', flexShrink: 0 },
  away: { width: '6px', height: '6px', borderRadius: '50%', background: '#eab308', flexShrink: 0 },
  busy: { width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 },
  offline: { width: '6px', height: '6px', borderRadius: '50%', background: '#71717a', flexShrink: 0 },
};

const DEPT_COLORS: Record<string, string> = {
  engineering: '#3b82f6',
  design: '#a855f7',
  product: '#00d4aa',
  marketing: '#f97316',
  sales: '#22c55e',
  support: '#06b6d4',
  hr: '#ec4899',
  finance: '#eab308',
};

// ============================================================================
// ROW COMPONENT
// ============================================================================

const FastEmployeeRow = React.memo(function FastEmployeeRow({ index }: { index: number }) {
  const emp = generateEmployee(index);
  const perfColor = emp.performance >= 90 ? '#00d4aa' : emp.performance >= 75 ? '#eab308' : '#ef4444';
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '100px 140px 1fr 100px 80px 100px 80px',
      alignItems: 'center',
      padding: '0 16px',
      borderBottom: '1px solid #1a1a24',
      fontSize: '12px',
      height: '100%',
      boxSizing: 'border-box',
      color: '#e4e4e7',
      gap: '8px',
    }}>
      <div style={{ color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.id}</div>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
      <div style={{ color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</div>
      <div style={{ color: DEPT_COLORS[emp.department] || '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.department}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={DOT_STYLES[emp.status]} />
        <span>{emp.status}</span>
      </div>
      <div style={{ color: '#00d4aa' }}>${emp.salary.toLocaleString()}</div>
      <div style={{ color: perfColor }}>{emp.performance}%</div>
    </div>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function DataTable() {
  const [rowCount, setRowCount] = useState(100000);
  const [rowCountInput, setRowCountInput] = useState('100000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random' | 'bounce'>('smooth');
  const [showBenchmark, setShowBenchmark] = useState(false);
  
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();
  
  const rowHeight = 44;
  
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
          element.scrollTop += (Math.random() - 0.5) * scrollAmount * 4;
          break;
        case 'bounce':
          element.scrollTop += scrollAmount * scrollDirectionRef.current;
          if (Math.random() < 0.005) scrollDirectionRef.current *= -1;
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

  const presets = [
    { label: '10K', value: 10000 },
    { label: '100K', value: 100000 },
    { label: '500K', value: 500000 },
    { label: '1M', value: 1000000 },
  ];

  const renderRow = useCallback((index: number) => (
    <FastEmployeeRow index={index} />
  ), []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ color: '#00d4aa' }}>[</span>
          data_table
          <span style={{ color: '#00d4aa' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {rowCount.toLocaleString()} records
          </span>
        </div>
        <PerformanceMonitor metrics={metrics} />
      </div>
      
      {/* Table Header */}
      <div style={{ 
        ...styles.list, 
        flex: 'none', 
        margin: '16px 20px 0',
        borderRadius: '8px 8px 0 0',
        marginBottom: 0,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 140px 1fr 100px 80px 100px 80px',
          alignItems: 'center',
          padding: '0 16px',
          background: '#0a0a0f',
          color: '#71717a',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          height: '40px',
          gap: '8px',
        }}>
          <div>id</div>
          <div>name</div>
          <div>email</div>
          <div>dept</div>
          <div>status</div>
          <div>salary</div>
          <div>perf</div>
        </div>
      </div>
      
      {/* Virtualized List */}
      <div style={{ 
        ...styles.list, 
        marginTop: 0, 
        borderRadius: '0 0 8px 8px', 
        borderTop: 'none',
        marginBottom: '80px',
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
      <div style={styles.floatingPanel}>
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
    <DataTable />
  </StrictMode>
);
