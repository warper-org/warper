import React, { StrictMode, useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { WarperComponent, usePerformanceMonitor, PerformanceMonitor, WarperComponentRef } from '../../index';

// Monospace styles
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
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  input: {
    width: '80px',
    padding: '6px 10px',
    background: '#0a0a0f',
    border: '1px solid #1a1a24',
    borderRadius: '4px',
    color: '#e4e4e7',
    fontSize: '12px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  button: {
    padding: '6px 14px',
    background: '#00d4aa20',
    border: '1px solid #00d4aa40',
    borderRadius: '4px',
    color: '#00d4aa',
    fontSize: '11px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    transition: 'all 0.15s',
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
    fontSize: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  rowHeader: {
    background: '#0a0a0f',
    color: '#71717a',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  cell: {
    padding: '12px 8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

// Generate meaningful employee data
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return '#00d4aa';
    case 'away': return '#eab308';
    case 'busy': return '#ef4444';
    default: return '#71717a';
  }
};

const getDeptColor = (dept: string) => {
  const colors: Record<string, string> = {
    engineering: '#3b82f6',
    design: '#a855f7',
    product: '#00d4aa',
    marketing: '#f97316',
    sales: '#22c55e',
    support: '#06b6d4',
    hr: '#ec4899',
    finance: '#eab308',
  };
  return colors[dept] || '#71717a';
};

// ============================================================================
// ULTRA-FAST ROW RENDERING - PRE-COMPUTED STYLES FOR 120+ FPS
// ============================================================================

const ROW_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  borderBottom: '1px solid #1a1a24',
  fontSize: '12px',
  height: '100%',
  boxSizing: 'border-box',
  color: '#e4e4e7',
};

const CELL_ID: React.CSSProperties = { padding: '12px 8px', width: '100px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_NAME: React.CSSProperties = { padding: '12px 8px', width: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_EMAIL: React.CSSProperties = { padding: '12px 8px', width: '200px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_DEPT: React.CSSProperties = { padding: '12px 8px', width: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_STATUS: React.CSSProperties = { padding: '12px 8px', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_SALARY: React.CSSProperties = { padding: '12px 8px', width: '100px', color: '#00d4aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const CELL_PERF: React.CSSProperties = { padding: '12px 8px', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const STATUS_BADGE: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px' };
const DOT_ACTIVE: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', background: '#00d4aa' };
const DOT_AWAY: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' };
const DOT_BUSY: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' };
const DOT_OFFLINE: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', background: '#71717a' };

const DEPT_STYLES: Record<string, React.CSSProperties> = {
  engineering: { ...CELL_DEPT, color: '#3b82f6' },
  design: { ...CELL_DEPT, color: '#a855f7' },
  product: { ...CELL_DEPT, color: '#00d4aa' },
  marketing: { ...CELL_DEPT, color: '#f97316' },
  sales: { ...CELL_DEPT, color: '#22c55e' },
  support: { ...CELL_DEPT, color: '#06b6d4' },
  hr: { ...CELL_DEPT, color: '#ec4899' },
  finance: { ...CELL_DEPT, color: '#eab308' },
};

const PERF_HIGH: React.CSSProperties = { ...CELL_PERF, color: '#00d4aa' };
const PERF_MED: React.CSSProperties = { ...CELL_PERF, color: '#eab308' };
const PERF_LOW: React.CSSProperties = { ...CELL_PERF, color: '#ef4444' };

// Ultra-fast row component
const FastEmployeeRow = React.memo(function FastEmployeeRow({ index }: { index: number }) {
  const emp = generateEmployee(index);
  const dotStyle = emp.status === 'active' ? DOT_ACTIVE : emp.status === 'away' ? DOT_AWAY : emp.status === 'busy' ? DOT_BUSY : DOT_OFFLINE;
  const deptStyle = DEPT_STYLES[emp.department] || CELL_DEPT;
  const perfStyle = emp.performance >= 90 ? PERF_HIGH : emp.performance >= 75 ? PERF_MED : PERF_LOW;
  
  return (
    <div style={ROW_STYLE}>
      <div style={CELL_ID}>{emp.id}</div>
      <div style={CELL_NAME}>{emp.name}</div>
      <div style={CELL_EMAIL}>{emp.email}</div>
      <div style={deptStyle}>{emp.department}</div>
      <div style={CELL_STATUS}>
        <span style={STATUS_BADGE}>
          <span style={dotStyle} />
          {emp.status}
        </span>
      </div>
      <div style={CELL_SALARY}>${emp.salary.toLocaleString()}</div>
      <div style={perfStyle}>{emp.performance}%</div>
    </div>
  );
});

function DataTable() {
  const [rowCount, setRowCount] = useState(100000);
  const [rowCountInput, setRowCountInput] = useState('100000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [scrollSpeedInput, setScrollSpeedInput] = useState('50');
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random' | 'bounce'>('smooth');
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();

  // Performant auto-scroll
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
          if (Math.random() < 0.005) {
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

  const applyRowCount = () => {
    const count = parseInt(rowCountInput, 10);
    if (!isNaN(count) && count > 0) {
      setRowCount(count);
    }
  };

  const applyScrollSpeed = () => {
    const speed = parseFloat(scrollSpeedInput);
    if (!isNaN(speed) && speed > 0) {
      setScrollSpeed(Math.min(100, speed));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ color: '#00d4aa' }}>[</span>
          data_table
          <span style={{ color: '#00d4aa' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {rowCount.toLocaleString()} records
          </span>
        </div>
        
        <div style={styles.controls}>
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
              style={{ ...styles.input, width: '50px' }}
            />
          </div>
          
          <div style={styles.controlGroup}>
            <span style={styles.label}>pattern</span>
            <select
              value={scrollPattern}
              onChange={(e) => setScrollPattern(e.target.value as any)}
              style={{ ...styles.input, width: '90px', cursor: 'pointer' }}
            >
              <option value="smooth">smooth</option>
              <option value="jump">jump</option>
              <option value="random">random</option>
              <option value="bounce">bounce</option>
            </select>
          </div>
          
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            style={{
              ...styles.button,
              ...(isAutoScrolling ? styles.buttonActive : {}),
            }}
          >
            {isAutoScrolling ? '■ stop' : '▶ scroll'}
          </button>
        </div>
        
        <PerformanceMonitor metrics={metrics} />
      </div>
      
      {/* Header Row */}
      <div style={{ ...styles.list, flex: 'none', margin: '16px 24px 0', borderBottom: 'none', borderRadius: '8px 8px 0 0' }}>
        <div style={{ ...styles.row, ...styles.rowHeader, height: '40px' }}>
          <div style={{ ...styles.cell, width: '100px' }}>id</div>
          <div style={{ ...styles.cell, width: '140px' }}>name</div>
          <div style={{ ...styles.cell, width: '200px' }}>email</div>
          <div style={{ ...styles.cell, width: '100px' }}>dept</div>
          <div style={{ ...styles.cell, width: '80px' }}>status</div>
          <div style={{ ...styles.cell, width: '100px' }}>salary</div>
          <div style={{ ...styles.cell, width: '80px' }}>perf</div>
        </div>
      </div>
      
      {/* Virtualized List */}
      <div style={{ ...styles.list, marginTop: 0, borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
        <WarperComponent
          ref={warperRef}
          itemCount={rowCount}
          estimateSize={() => 44}
          overscan={3}
          style={{ height: '100%' }}
          onRendered={recordRender}
        >
          {(index) => <FastEmployeeRow index={index} />}
        </WarperComponent>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataTable />
  </StrictMode>
);

