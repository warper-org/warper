import React, { StrictMode, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  WarperComponent,
  usePerformanceMonitor,
  PerformanceMonitor,
  WarperComponentRef,
  TestRunner,
  TestConfig,
} from '../../index';

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
  chat: {
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

const users = [
  { name: 'alice', color: '#00d4aa' },
  { name: 'bob', color: '#3b82f6' },
  { name: 'charlie', color: '#a855f7' },
  { name: 'diana', color: '#f97316' },
  { name: 'eve', color: '#ec4899' },
  { name: 'frank', color: '#22c55e' },
];

const messageTemplates = [
  'Hey, anyone here?',
  'Just pushed a fix for the memory leak issue.',
  'Can someone review my PR?',
  'The build is failing on CI.',
  'Found a bug in the virtualizer.',
  'Performance looks good now!',
  'Need help with the WASM bindings.',
  'The Fenwick tree implementation is solid.',
  'Who broke the tests?',
  'Merged and deployed to staging.',
  '```rust\nfn calculate_offset(&self, index: usize) -> u32 {\n    self.prefix_sum(index)\n}\n```',
  '```typescript\nconst virtualizer = useVirtualizer({\n  count: 1000000,\n  estimateSize: () => 44,\n});\n```',
  'The O(log n) complexity is a game changer.',
  'Just hit 120 FPS with 10M rows!',
  'Anyone else seeing rendering issues?',
  'Fixed! It was a race condition.',
  '> This is a quote from the docs\n\nLooks correct to me.',
  'Check the README for setup instructions.',
  'The benchmark results are impressive.',
  'Working on the grid component next.',
];

function generateMessage(index: number) {
  const user = users[index % users.length];
  const template = messageTemplates[index % messageTemplates.length];
  const hasCode = template.includes('```');
  const hasQuote = template.includes('>');
  const baseHeight = hasCode ? 120 : hasQuote ? 80 : 50;
  const extraLines = Math.floor((index * 17) % 3);
  
  return {
    id: `msg-${index}`,
    user,
    text: template + (extraLines > 0 ? '\n' + '.'.repeat(extraLines * 20) : ''),
    timestamp: new Date(Date.now() - index * 60000).toLocaleTimeString(),
    hasCode,
    hasQuote,
    height: baseHeight + extraLines * 16,
    reactions: index % 5 === 0 ? ['👍', '🚀'] : index % 7 === 0 ? ['❤️'] : [],
  };
}

const ChatMessage = React.memo(function ChatMessage({ index, isMobile }: { index: number; isMobile: boolean }) {
  const message = generateMessage(index);
  const avatarSize = isMobile ? 24 : 28;
  const fontSize = isMobile ? 11 : 12;
  
  return (
    <div style={{
      padding: isMobile ? '10px 12px' : '12px 16px',
      borderBottom: '1px solid #1a1a24',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '10px',
        marginBottom: '6px',
      }}>
        <div style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '6px',
          background: message.user.color + '20',
          border: `1px solid ${message.user.color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '10px' : '11px',
          color: message.user.color,
          fontWeight: 600,
        }}>
          {message.user.name[0].toUpperCase()}
        </div>
        <span style={{ fontSize: fontSize, color: message.user.color, fontWeight: 600 }}>
          {message.user.name}
        </span>
        <span style={{ fontSize: isMobile ? '9px' : '10px', color: '#52525b' }}>
          {message.timestamp}
        </span>
        {!isMobile && (
          <span style={{ fontSize: '9px', color: '#3f3f46' }}>#{index}</span>
        )}
      </div>
      
      {message.hasCode ? (
        <pre style={{
          margin: 0,
          padding: isMobile ? '8px 10px' : '10px 12px',
          background: '#0a0a0f',
          borderRadius: '6px',
          border: '1px solid #1a1a24',
          fontSize: isMobile ? '10px' : '11px',
          color: '#a1a1aa',
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
        }}>
          {message.text.replace(/```\w*\n?/g, '').trim()}
        </pre>
      ) : message.hasQuote ? (
        <div style={{
          borderLeft: '2px solid #3b82f6',
          paddingLeft: isMobile ? '10px' : '12px',
          color: '#a1a1aa',
          fontSize: fontSize,
          lineHeight: 1.5,
        }}>
          {message.text}
        </div>
      ) : (
        <div style={{
          fontSize: fontSize,
          color: '#e4e4e7',
          lineHeight: 1.5,
        }}>
          {message.text}
        </div>
      )}
      
      {message.reactions.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          {message.reactions.map((reaction, i) => (
            <span key={i} style={{
              padding: '2px 8px',
              background: '#1a1a24',
              borderRadius: '12px',
              fontSize: isMobile ? '10px' : '11px',
            }}>
              {reaction}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

function ChatExample() {
  const { isMobile, isDesktop } = useResponsive();
  
  const [messageCount, setMessageCount] = useState(50000);
  const [messageCountInput, setMessageCountInput] = useState('50000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [scrollSpeedInput, setScrollSpeedInput] = useState('50');
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random'>('smooth');
  const [showBenchmark, setShowBenchmark] = useState(false);
  
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();
  
  const testConfig: TestConfig = {
    itemCount: messageCount,
    itemHeight: 70, // Average message height
    scrollSpeed: 5000,
    sampleCount: 50,
  };
  
  const getMessageHeight = useMemo(() => {
    const cache: Record<number, number> = {};
    return (index: number) => {
      if (cache[index] !== undefined) return cache[index];
      cache[index] = generateMessage(index).height;
      return cache[index];
    };
  }, [messageCount]);

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

  const applyMessageCount = useCallback(() => {
    const count = parseInt(messageCountInput, 10);
    if (!isNaN(count) && count > 0 && count <= 10000000) {
      setMessageCount(count);
    }
  }, [messageCountInput]);

  const applyScrollSpeed = useCallback(() => {
    const speed = parseFloat(scrollSpeedInput);
    if (!isNaN(speed) && speed > 0) {
      setScrollSpeed(Math.min(100, speed));
    }
  }, [scrollSpeedInput]);

  const presets = isMobile 
    ? [{ label: '10K', value: 10000 }, { label: '50K', value: 50000 }]
    : [
        { label: '10K', value: 10000 },
        { label: '50K', value: 50000 },
        { label: '250K', value: 250000 },
        { label: '500K', value: 500000 },
      ];

  const renderMessage = useCallback((index: number) => (
    <ChatMessage index={index} isMobile={isMobile} />
  ), [isMobile]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ color: '#3b82f6' }}>[</span>
          message_thread
          <span style={{ color: '#3b82f6' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {messageCount.toLocaleString()} {isMobile ? '' : 'messages'}
          </span>
        </div>
        
        <div style={styles.controls}>
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setMessageCount(preset.value);
                setMessageCountInput(String(preset.value));
              }}
              style={{
                ...styles.button,
                ...(messageCount === preset.value ? styles.buttonActive : {}),
              }}
            >
              {preset.label}
            </button>
          ))}
          
          {isDesktop && (
            <>
              <div style={{ width: '1px', height: '20px', background: '#1a1a24' }} />
              
              <div style={styles.controlGroup}>
                <span style={styles.label}>msgs</span>
                <input
                  type="text"
                  value={messageCountInput}
                  onChange={(e) => setMessageCountInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyMessageCount()}
                  onBlur={applyMessageCount}
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
      
      <div style={styles.chat}>
        <WarperComponent
          ref={warperRef}
          itemCount={messageCount}
          estimateSize={getMessageHeight}
          overscan={5}
          style={{ height: '100%' }}
          onRendered={recordRender}
        >
          {renderMessage}
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
    <ChatExample />
  </StrictMode>
);
