import React, { StrictMode, useState, useRef, useEffect, useMemo } from 'react';
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
  chat: {
    flex: 1,
    overflow: 'hidden',
    margin: '16px 24px',
    borderRadius: '8px',
    border: '1px solid #1a1a24',
    background: '#0f0f14',
  },
};

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

function ChatExample() {
  const [messageCount, setMessageCount] = useState(50000);
  const [messageCountInput, setMessageCountInput] = useState('50000');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [scrollSpeedInput, setScrollSpeedInput] = useState('50');
  const [scrollPattern, setScrollPattern] = useState<'smooth' | 'jump' | 'random'>('smooth');
  const scrollDirectionRef = useRef(1);
  const warperRef = useRef<WarperComponentRef>(null);
  const { metrics, recordRender } = usePerformanceMonitor();
  
  // Pre-generate heights for variable sizing
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

  const applyMessageCount = () => {
    const count = parseInt(messageCountInput, 10);
    if (!isNaN(count) && count > 0) {
      setMessageCount(count);
    }
  };

  const applyScrollSpeed = () => {
    const speed = parseFloat(scrollSpeedInput);
    if (!isNaN(speed) && speed > 0) {
      setScrollSpeed(Math.min(100, speed));
    }
  };

  const renderMessage = (index: number) => {
    const message = generateMessage(index);
    return (
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1a1a24',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '6px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: message.user.color + '20',
            border: `1px solid ${message.user.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            color: message.user.color,
            fontWeight: 600,
          }}>
            {message.user.name[0].toUpperCase()}
          </div>
          
          <span style={{ fontSize: '12px', color: message.user.color, fontWeight: 600 }}>
            {message.user.name}
          </span>
          <span style={{ fontSize: '10px', color: '#52525b' }}>
            {message.timestamp}
          </span>
          <span style={{ fontSize: '9px', color: '#3f3f46' }}>
            #{index}
          </span>
        </div>
        
        {message.hasCode ? (
          <pre style={{
            margin: 0,
            padding: '10px 12px',
            background: '#0a0a0f',
            borderRadius: '6px',
            border: '1px solid #1a1a24',
            fontSize: '11px',
            color: '#a1a1aa',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
          }}>
            {message.text.replace(/```\w*\n?/g, '').trim()}
          </pre>
        ) : message.hasQuote ? (
          <div style={{
            borderLeft: '2px solid #3b82f6',
            paddingLeft: '12px',
            color: '#a1a1aa',
            fontSize: '12px',
            lineHeight: 1.5,
          }}>
            {message.text}
          </div>
        ) : (
          <div style={{
            fontSize: '12px',
            color: '#e4e4e7',
            lineHeight: 1.5,
          }}>
            {message.text}
          </div>
        )}
        
        {message.reactions.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            marginTop: '8px',
          }}>
            {message.reactions.map((reaction, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 8px',
                  background: '#1a1a24',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              >
                {reaction}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={{ color: '#3b82f6' }}>[</span>
          message_thread
          <span style={{ color: '#3b82f6' }}>]</span>
          <span style={{ color: '#52525b', marginLeft: '8px' }}>
            {messageCount.toLocaleString()} messages
          </span>
        </div>
        
        <div style={styles.controls}>
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
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatExample />
  </StrictMode>
);
