import React, { useState, useEffect, useRef, memo } from 'react';

/**
 * FPSMonitor - High-performance FPS display
 * Uses minimal React updates for accurate measurement
 */

export const FPSMonitor: React.FC = memo(() => {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const frameRef = useRef(0);
  const lastRef = useRef(performance.now());
  const samplesRef = useRef<number[]>([]);

  useEffect(() => {
    let id: number;

    const loop = () => {
      frameRef.current++;
      const now = performance.now();
      const delta = now - lastRef.current;
      
      if (delta >= 1000) {
        const currentFps = Math.round((frameRef.current * 1000) / delta);
        setFps(currentFps);
        
        // Rolling average
        samplesRef.current.push(currentFps);
        if (samplesRef.current.length > 10) samplesRef.current.shift();
        const avg = Math.round(samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length);
        setAvgFps(avg);
        
        frameRef.current = 0;
        lastRef.current = now;
      }
      
      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const color = fps >= 120 ? '#10b981' : fps >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      padding: '10px 16px',
      background: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 16,
      zIndex: 10000,
      border: `2px solid ${color}`,
      minWidth: 100,
    }}>
      <div style={{ color, fontWeight: 'bold', fontSize: 24 }}>
        {fps} <span style={{ fontSize: 12, opacity: 0.7 }}>FPS</span>
      </div>
      <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
        avg: {avgFps}
      </div>
    </div>
  );
});
