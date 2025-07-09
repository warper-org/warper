import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { WarperComponent } from 'warper/react/components/WarperComponent';
import { FPSMonitor } from 'warper/react/components/FPSMonitor';

const App = () => {
  const items = Array.from({ length: 100_000 }, (_, i) => `Item ${i}`);
  const warperRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollIntervalRef = useRef<number | null>(null);

  const toggleAutoScroll = () => {
    setIsScrolling(prev => !prev);
  };

  useEffect(() => {
    if (isScrolling) {
      scrollIntervalRef.current = window.setInterval(() => {
        if (warperRef.current) {
          if (warperRef.current.scrollTop + warperRef.current.clientHeight >= warperRef.current.scrollHeight) {
            warperRef.current.scrollTop = 0; // Reset to top
          } else {
            warperRef.current.scrollTop += 50;
          }
        }
      }, 0); // Scroll as fast as possible
    } else {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        window.clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isScrolling]);
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <FPSMonitor />
      <h1>🚀 Warper List Example (100,000 items)</h1>
      <p>This example demonstrates a virtualized list with 100,000 items rendered using Warper.</p>
      <button onClick={toggleAutoScroll} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        {isScrolling ? 'Stop Auto Scroll' : 'Start Auto Scroll'}
      </button>
      <div style={{ height: '500px', width: '100%', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
        <WarperComponent<string>
          ref={warperRef}
          height={500}
          itemCount={items.length}
          data={items}
          estimateSize={() => 50}
        >
          {(index, style) => (
            <div
              style={{
                ...style,
                borderBottom: '1px solid #eee',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                background: index % 2 === 0 ? '#fff' : '#f9f9f9',
              }}
            >
              Row {index}: <strong>{items[index]}</strong>
            </div>
          )}
        </WarperComponent>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
