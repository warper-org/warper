import React from 'react';
import ReactDOM from 'react-dom/client';
import { WarperComponent } from '../../react/components/WarperComponent';
import { FPSMonitor } from '../../react/components/FPSMonitor';

const App = () => {
  const warperRef = React.useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollIntervalRef = React.useRef<number | null>(null);

  // Using useMemo to prevent re-creating the large array on every render
  const items = React.useMemo(() => Array.from({ length: 1_000_000 }, (_, i) => `Item ${i}`), []);

  // useCallback to memoize the size estimation function
  const estimateSize = React.useCallback(() => 35, []);

  const toggleAutoScroll = () => {
    setIsScrolling(prev => !prev);
  };

  React.useEffect(() => {
    if (isScrolling) {
      scrollIntervalRef.current = window.setInterval(() => {
        if (warperRef.current) {
          if (warperRef.current.scrollTop + warperRef.current.clientHeight >= warperRef.current.scrollHeight) {
            warperRef.current.scrollTop = 0; // Reset to top
          } else {
            warperRef.current.scrollTop += 2000; // Scroll even faster to stress test FPS
          }
        }
      }, 0); // Run as fast as possible
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
      <h1>🚀 Warper One Million Rows Example</h1>
      <p>This example demonstrates a virtualized list with 1,000,000 items rendered using Warper.</p>
      <button onClick={toggleAutoScroll} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        {isScrolling ? 'Stop Auto Scroll' : 'Start Auto Scroll'}
      </button>
      <div style={{ 
        height: '500px', 
        width: '100%', 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        background: '#f9f9f9',
        // The WarperComponent will provide its own scrollbar
        overflow: 'hidden' 
      }}>
        <WarperComponent<string>
          ref={warperRef}
          itemCount={items.length}
          estimateSize={estimateSize}
          height={500}
          data={items}
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
                height: '35px',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
