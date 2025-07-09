import React, { useState, useEffect, useRef } from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    padding: '5px 10px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '5px',
    fontFamily: 'monospace',
    fontSize: '14px',
    zIndex: 10000,
  },
  fps: {
    color: '#0f0',
    fontWeight: 'bold',
  },
  label: {
    color: '#aaa',
  }
};

export const FPSMonitor: React.FC = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const loop = (time: number) => {
      frameCount.current++;
      if (time - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = time;
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={styles.wrapper}>
      <span style={styles.fps}>{fps}</span> <span style={styles.label}>FPS</span>
    </div>
  );
};
