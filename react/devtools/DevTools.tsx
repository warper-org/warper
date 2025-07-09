import React, { useEffect, useState } from 'react';

interface DevToolsProps {
  virtualizer: any; // Consider creating a proper type for the virtualizer
}

export function DevTools({ virtualizer }: DevToolsProps) {
  const [debugInfo, setDebugInfo] = useState({ fps: 0, memory: 0 });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateDebugInfo = () => {
      const now = performance.now();
      const delta = now - lastTime;
      frameCount++;

      if (delta >= 1000) {
        const fps = (frameCount * 1000) / delta;
        const memory = (performance as any).memory?.usedJSHeapSize / 1048576;
        setDebugInfo({ fps: Math.round(fps), memory: Math.round(memory) });
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(updateDebugInfo);
    };

    const animationFrameId = requestAnimationFrame(updateDebugInfo);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!virtualizer) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
      }}
    >
      <div>FPS: {debugInfo.fps}</div>
      <div>Memory: {debugInfo.memory} MB</div>
      <div>Visible Items: {virtualizer.items.length}</div>
      <div>Total Height: {virtualizer.totalHeight}px</div>
    </div>
  );
}
