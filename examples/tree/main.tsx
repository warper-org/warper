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
    gap: '20px',
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
    width: '60px',
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
  tree: {
    flex: 1,
    overflow: 'hidden',
    margin: '16px 24px',
    borderRadius: '8px',
    border: '1px solid #1a1a24',
    background: '#0f0f14',
  },
};

// File type icons and colors
const fileTypes: Record<string, { icon: string; color: string }> = {
  rs: { icon: '🦀', color: '#f97316' },
  ts: { icon: '📘', color: '#3b82f6' },
  tsx: { icon: '⚛️', color: '#06b6d4' },
  js: { icon: '📒', color: '#eab308' },
  jsx: { icon: '⚛️', color: '#eab308' },
  json: { icon: '📋', color: '#22c55e' },
  md: { icon: '📝', color: '#a1a1aa' },
  css: { icon: '🎨', color: '#a855f7' },
  html: { icon: '🌐', color: '#f97316' },
  wasm: { icon: '⚡', color: '#00d4aa' },
  toml: { icon: '⚙️', color: '#71717a' },
  lock: { icon: '🔒', color: '#52525b' },
  folder: { icon: '📁', color: '#eab308' },
};

const folderStructure = [
  'src', 'components', 'hooks', 'utils', 'types', 'lib', 'core', 'wasm',
  'tests', '__tests__', 'benchmark', 'examples', 'docs', 'scripts',
];

const fileNames = [
  'index', 'main', 'App', 'utils', 'helpers', 'types', 'constants',
  'config', 'setup', 'store', 'reducer', 'actions', 'selectors',
  'api', 'client', 'server', 'middleware', 'hooks', 'context',
];

function generateFileNode(index: number): {
  name: string;
  path: string;
  isFolder: boolean;
  depth: number;
  size: number;
  modified: string;
  extension: string;
} {
  const seed = index * 2654435761;
  const isFolder = index % 7 === 0;
  const depth = (index % 4);
  
  let name: string;
  let extension = '';
  
  if (isFolder) {
    name = folderStructure[index % folderStructure.length];
  } else {
    const baseName = fileNames[index % fileNames.length];
    const extensions = ['ts', 'tsx', 'js', 'jsx', 'rs', 'json', 'md', 'css', 'html', 'wasm', 'toml'];
    extension = extensions[index % extensions.length];
    name = `${baseName}.${extension}`;
  }
  
  const pathParts = [];
  for (let i = 0; i < depth; i++) {
    pathParts.push(folderStructure[(index + i * 3) % folderStructure.length]);
  }
  
  return {
    name,
    path: pathParts.length > 0 ? pathParts.join('/') + '/' + name : name,
    isFolder,
    depth,
    size: isFolder ? 0 : (seed % 50000) + 100,
    modified: new Date(Date.now() - (seed % 30) * 86400000).toLocaleDateString(),
    extension: isFolder ? 'folder' : extension,
  };
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TreeExample() {
  const [nodeCount, setNodeCount] = useState(100000);
  const [nodeCountInput, setNodeCountInput] = useState('100000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [scrollSpeedInput, setScrollSpeedInput] = useState('50');
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random'>('smooth');
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();

  useEffect(() => {
    if (!isAutoScrolling) return;
    
    const element = warperRef.current?.element;
    if (!element) return;
    
    let rafId: number;
    let lastTime = performance.now();
    
    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      const pixelsPerMs = scrollSpeed * 0.4;
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
      }
      
      rafId = requestAnimationFrame(scroll);
    };
    
    rafId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafId);
  }, [isAutoScrolling, scrollSpeed, scrollPattern]);

  const applyNodeCount = () => {
    const count = parseInt(nodeCountInput, 10);
    if (!isNaN(count) && count > 0) {
      setNodeCount(count);
    }
  };

  const applyScrollSpeed = () => {
    const speed = parseFloat(scrollSpeedInput);
    if (!isNaN(speed) && speed > 0) {
      setScrollSpeed(Math.min(100, speed));
    }
  };

  const renderNode = (index: number) => {
    const node = generateFileNode(index);
    const fileType = fileTypes[node.extension] || { icon: '📄', color: '#71717a' };
    
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #1a1a24',
          fontSize: '11px',
          cursor: 'pointer',
          height: '100%',
        }}
      >
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: node.depth * 16,
          overflow: 'hidden',
        }}>
          {/* Indent lines */}
          {node.depth > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              {Array.from({ length: node.depth }).map((_, i) => (
                <span key={i} style={{ color: '#2a2a35', fontSize: '8px' }}>│</span>
              ))}
            </div>
          )}
          
          {/* Icon */}
          <span style={{ fontSize: '12px' }}>{fileType.icon}</span>
          
          {/* Name */}
          <span style={{
            color: node.isFolder ? '#eab308' : fileType.color,
            fontWeight: node.isFolder ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {node.name}
          </span>
          
          {/* Index badge */}
          <span style={{
            fontSize: '9px',
            color: '#3f3f46',
            marginLeft: 'auto',
          }}>
            #{index}
          </span>
        </div>
        
        <div style={{
          width: '100px',
          textAlign: 'right',
          color: '#71717a',
        }}>
          {formatSize(node.size)}
        </div>
        
        <div style={{
          width: '100px',
          textAlign: 'right',
          color: '#52525b',
        }}>
          {node.modified}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ color: '#eab308' }}>[</span>
          file_explorer
          <span style={{ color: '#eab308' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {nodeCount.toLocaleString()} nodes
          </span>
        </div>
        
        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <span style={styles.label}>nodes</span>
            <input
              type="text"
              value={nodeCountInput}
              onChange={(e) => setNodeCountInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyNodeCount()}
              onBlur={applyNodeCount}
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
      
      {/* Header */}
      <div style={{ ...styles.tree, flex: 'none', margin: '16px 24px 0', borderRadius: '8px 8px 0 0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          background: '#0a0a0f',
          borderBottom: '1px solid #1a1a24',
          fontSize: '9px',
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          <div style={{ flex: 1 }}>name</div>
          <div style={{ width: '100px', textAlign: 'right' }}>size</div>
          <div style={{ width: '100px', textAlign: 'right' }}>modified</div>
        </div>
      </div>
      
      <div style={{ ...styles.tree, marginTop: 0, borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
        <WarperComponent
          ref={warperRef}
          itemCount={nodeCount}
          estimateSize={() => 32}
          overscan={5}
          style={{ height: '100%' }}
          onRendered={recordRender}
        >
          {renderNode}
        </WarperComponent>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TreeExample />
  </StrictMode>
);
