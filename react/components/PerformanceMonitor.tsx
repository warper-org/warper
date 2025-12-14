import { useRef, useEffect, useCallback, useState } from 'react';

export interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  frameTime: number;
  jankCount: number;
  renderCount: number;
  targetFps: number;
}

export interface PerformanceMonitorOptions {
  sampleSize?: number;
  jankThreshold?: number;
}

export interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
}

// Detect screen refresh rate using frame timing analysis
function useDetectRefreshRate(): number {
  const [refreshRate, setRefreshRate] = useState(120); // Default to 120Hz optimistic target
  
  useEffect(() => {
    let times: number[] = [];
    let rafId: number;
    let detected = false;
    
    function detect(now: number) {
      if (detected) return;
      
      times.push(now);
      if (times.length > 60) {
        const diffs = times.slice(1).map((t, i) => t - times[i]);
        const avg = diffs.reduce((a, b) => a + b) / diffs.length;
        const hz = Math.round(1000 / avg);
        
        // Round to common refresh rates for cleaner display
        let finalHz = 60;
        if (hz >= 200) finalHz = 240;
        else if (hz >= 155) finalHz = 165;
        else if (hz >= 135) finalHz = 144;
        else if (hz >= 100) finalHz = 120;
        else if (hz >= 80) finalHz = 90;
        else if (hz >= 65) finalHz = 75;
        else finalHz = 60;
        
        setRefreshRate(finalHz);
        detected = true;
        times = [];
        return;
      }
      rafId = requestAnimationFrame(detect);
    }
    
    rafId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  return refreshRate;
}

export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
  const { sampleSize = 30, jankThreshold = 50 } = options; // Reduced sample size
  const targetFps = useDetectRefreshRate();
  
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const jankCountRef = useRef(0);
  const renderCountRef = useRef(0);
  const rafIdRef = useRef<number>();
  const updateCounterRef = useRef(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    avgFps: 0,
    minFps: 0,
    maxFps: 0,
    frameTime: 0,
    jankCount: 0,
    renderCount: 0,
    targetFps: 120,
  });

  const recordRender = useCallback(() => {
    renderCountRef.current++;
  }, []);

  useEffect(() => {
    const measure = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (delta > 0 && delta < 1000) {
        const times = frameTimesRef.current;
        times.push(delta);
        if (times.length > sampleSize) {
          times.shift();
        }

        if (delta > jankThreshold) {
          jankCountRef.current++;
        }

        // Only update React state every 3 frames to reduce overhead
        updateCounterRef.current++;
        if (updateCounterRef.current >= 3 && times.length > 0) {
          updateCounterRef.current = 0;
          
          // Fast min/max/sum calculation - no spread operators
          let sum = 0, minTime = times[0], maxTime = times[0];
          for (let i = 0; i < times.length; i++) {
            const t = times[i];
            sum += t;
            if (t < minTime) minTime = t;
            if (t > maxTime) maxTime = t;
          }
          const avgFrameTime = sum / times.length;
          
          setMetrics({
            fps: Math.round(1000 / delta),
            avgFps: Math.round(1000 / avgFrameTime),
            minFps: Math.round(1000 / maxTime),
            maxFps: Math.min(999, Math.round(1000 / minTime)),
            frameTime: (delta * 100 | 0) / 100,
            jankCount: jankCountRef.current,
            renderCount: renderCountRef.current,
            targetFps,
          });
        }
      }

      rafIdRef.current = requestAnimationFrame(measure);
    };

    rafIdRef.current = requestAnimationFrame(measure);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [sampleSize, jankThreshold, targetFps]);

  return { metrics, recordRender };
}

export function PerformanceMonitor({ metrics }: PerformanceMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsHistoryRef = useRef<number[]>([]);
  const maxHistorySize = 120;
  // Use detected target FPS from metrics, fallback to 120 (optimistic)
  const targetFps = metrics.targetFps || 120;
  // Graph max is 25% above target for headroom visualization  
  const graphMax = Math.round(targetFps * 1.25);

  useEffect(() => {
    fpsHistoryRef.current.push(metrics.fps);
    if (fpsHistoryRef.current.length > maxHistorySize) {
      fpsHistoryRef.current.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1a1a24';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // FPS history graph - scale dynamically based on target FPS
    const history = fpsHistoryRef.current;
    if (history.length > 1) {
      ctx.beginPath();
      const step = width / (maxHistorySize - 1);
      
      for (let i = 0; i < history.length; i++) {
        const x = i * step;
        const fps = Math.min(history[i], graphMax);
        const y = height - (fps / graphMax) * height;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fill under curve
      ctx.lineTo((history.length - 1) * step, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 212, 170, 0.1)';
      ctx.fill();
    }

    // Target FPS line (detected refresh rate)
    const targetY = height - (targetFps / graphMax) * height;
    ctx.strokeStyle = '#00d4aa40';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [metrics.fps, targetFps, graphMax]);

  // Dynamic color based on how close to target FPS
  const getFpsColor = (fps: number) => {
    const ratio = fps / targetFps;
    if (ratio >= 0.95) return '#00d4aa';  // ≥95% of target = smooth
    if (ratio >= 0.75) return '#eab308';  // ≥75% of target = acceptable
    return '#ef4444';  // <75% = janky
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 16px',
      background: '#0f0f14',
      borderRadius: '8px',
      border: '1px solid #1a1a24',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* FPS Graph */}
      <canvas
        ref={canvasRef}
        style={{
          width: '120px',
          height: '40px',
          borderRadius: '4px',
        }}
      />
      
      {/* Main FPS */}
      <div style={{ textAlign: 'center', minWidth: '60px' }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: getFpsColor(metrics.fps),
          lineHeight: 1,
        }}>
          {metrics.fps}
        </div>
        <div style={{
          fontSize: '9px',
          color: '#71717a',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginTop: '2px',
        }}>
          fps
        </div>
      </div>
      
      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '11px',
      }}>
        <div>
          <span style={{ color: '#71717a' }}>avg </span>
          <span style={{ color: '#e4e4e7' }}>{metrics.avgFps}</span>
        </div>
        <div>
          <span style={{ color: '#71717a' }}>min </span>
          <span style={{ color: '#ef4444' }}>{metrics.minFps}</span>
        </div>
        <div>
          <span style={{ color: '#71717a' }}>max </span>
          <span style={{ color: '#00d4aa' }}>{metrics.maxFps}</span>
        </div>
        <div>
          <span style={{ color: '#71717a' }}>ft </span>
          <span style={{ color: '#e4e4e7' }}>{metrics.frameTime.toFixed(1)}ms</span>
        </div>
        <div>
          <span style={{ color: '#71717a' }}>jank </span>
          <span style={{ color: metrics.jankCount > 0 ? '#ef4444' : '#71717a' }}>{metrics.jankCount}</span>
        </div>
        <div>
          <span style={{ color: '#71717a' }}>renders </span>
          <span style={{ color: '#a855f7' }}>{metrics.renderCount}</span>
        </div>
        <div>
          <span style={{ color: '#52525b' }}>@</span>
          <span style={{ color: '#3b82f6' }}>{targetFps}Hz</span>
        </div>
      </div>
    </div>
  );
}
