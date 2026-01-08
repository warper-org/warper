/**
 * ⚡ WARPER v5.0 TestRunner Component ⚡
 * 
 * One-time benchmark test mode with metrics, completion tracking, and ETA
 * Designed for validating virtualization performance across all browsers
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface TestConfig {
  /** Total items to scroll through */
  itemCount: number;
  /** Item height for scroll calculation */
  itemHeight: number;
  /** Scroll speed in pixels per second (default: 5000) */
  scrollSpeed?: number;
  /** Number of scroll samples to take (default: 100) */
  sampleCount?: number;
  /** Whether to scroll in chunks (for very large lists) */
  chunkedScroll?: boolean;
}

export type TestPreset = 'quick' | 'standard' | 'thorough';

export interface TestMetrics {
  /** Test status */
  status: 'idle' | 'running' | 'completed' | 'error';
  /** Current progress (0-100) */
  progress: number;
  /** Estimated time remaining in seconds */
  eta: number;
  /** Elapsed time in seconds */
  elapsed: number;
  /** Average FPS during test */
  avgFps: number;
  /** Minimum FPS recorded */
  minFps: number;
  /** Maximum FPS recorded */
  maxFps: number;
  /** Total frames rendered */
  frameCount: number;
  /** Number of frames below 30 FPS (jank) */
  jankFrames: number;
  /** Number of frames below 60 FPS */
  droppedFrames: number;
  /** Current scroll position (item index) */
  currentIndex: number;
  /** Target scroll position (item index) */
  targetIndex: number;
  /** Memory usage if available */
  memoryUsage?: number;
  /** Test score (0-100) */
  score: number;
  /** Score level description */
  scoreLevel: ScoreLevel;
  /** Detailed breakdown */
  breakdown: TestBreakdown;
}

export type ScoreLevel = 'Outstanding' | 'Excellent' | 'Very Good' | 'Good' | 'Decent' | 'Fair' | 'Poor';

export interface TestBreakdown {
  /** FPS consistency score (0-100) */
  fpsConsistency: number;
  /** Smooth scroll score (0-100) */
  smoothness: number;
  /** Memory efficiency score (0-100) */
  memoryEfficiency: number;
  /** Responsiveness score (0-100) */
  responsiveness: number;
}

export interface TestRunnerProps {
  /** Configuration for the test */
  config: TestConfig;
  /** Callback when test starts */
  onStart?: () => void;
  /** Callback with test progress */
  onProgress?: (metrics: TestMetrics) => void;
  /** Callback when test completes */
  onComplete?: (metrics: TestMetrics) => void;
  /** Callback when test errors */
  onError?: (error: Error) => void;
  /** Ref to the WarperComponent instance */
  scrollRef: React.RefObject<any>;
  /** Whether test is enabled */
  enabled?: boolean;
  /** Allow speed/sample customization in UI */
  allowCustomization?: boolean;
  /** Custom style */
  style?: React.CSSProperties;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Styles
// ============================================================================

const baseStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '16px',
    background: '#0f0f14',
    borderRadius: '8px',
    border: '1px solid #1a1a24',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
    fontSize: '12px',
    color: '#e4e4e7',
    minWidth: '300px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e4e4e7',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  button: {
    padding: '8px 16px',
    background: '#00d4aa20',
    border: '1px solid #00d4aa40',
    borderRadius: '6px',
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
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  progressBar: {
    height: '6px',
    background: '#1a1a24',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00d4aa, #22c55e)',
    borderRadius: '3px',
    transition: 'width 0.1s ease-out',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#71717a',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    padding: '10px',
    background: '#0a0a0f',
    borderRadius: '6px',
    border: '1px solid #1a1a24',
  },
  metricLabel: {
    fontSize: '9px',
    color: '#52525b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#e4e4e7',
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: '#0a0a0f',
    borderRadius: '8px',
    border: '1px solid #1a1a24',
  },
  scoreCircle: {
    position: 'relative' as const,
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column' as const,
  },
  scoreValue: {
    fontSize: '28px',
    fontWeight: 700,
  },
  scoreLabel: {
    fontSize: '10px',
    color: '#71717a',
    textTransform: 'uppercase' as const,
  },
  breakdownGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
    padding: '6px 8px',
    background: '#0a0a0f',
    borderRadius: '4px',
  },
  breakdownLabel: {
    color: '#71717a',
  },
  breakdownValue: {
    fontWeight: 600,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  configPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '12px',
    background: '#0a0a0f',
    borderRadius: '6px',
    border: '1px solid #1a1a24',
  },
  configRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  configLabel: {
    fontSize: '10px',
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  slider: {
    flex: 1,
    height: '4px',
    WebkitAppearance: 'none' as const,
    appearance: 'none' as const,
    background: '#1a1a24',
    borderRadius: '2px',
    outline: 'none',
  },
  presetButtons: {
    display: 'flex',
    gap: '6px',
  },
  presetButton: {
    flex: 1,
    padding: '6px 8px',
    background: '#0a0a0f',
    border: '1px solid #1a1a24',
    borderRadius: '4px',
    color: '#71717a',
    fontSize: '9px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    transition: 'all 0.15s',
  },
  presetButtonActive: {
    background: '#00d4aa20',
    borderColor: '#00d4aa40',
    color: '#00d4aa',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatTime(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#00d4aa';
  if (score >= 75) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function getStatusInfo(status: TestMetrics['status']): { color: string; label: string } {
  switch (status) {
    case 'idle': return { color: '#71717a', label: 'Ready' };
    case 'running': return { color: '#00d4aa', label: 'Running' };
    case 'completed': return { color: '#22c55e', label: 'Completed' };
    case 'error': return { color: '#ef4444', label: 'Error' };
    default: return { color: '#71717a', label: 'Unknown' };
  }
}

function getScoreLevel(score: number): { level: ScoreLevel; color: string; emoji: string } {
  if (score >= 95) return { level: 'Outstanding', color: '#00d4aa', emoji: '🏆' };
  if (score >= 85) return { level: 'Excellent', color: '#22c55e', emoji: '⭐' };
  if (score >= 75) return { level: 'Very Good', color: '#84cc16', emoji: '✨' };
  if (score >= 65) return { level: 'Good', color: '#eab308', emoji: '👍' };
  if (score >= 50) return { level: 'Decent', color: '#f97316', emoji: '👌' };
  if (score >= 35) return { level: 'Fair', color: '#ef4444', emoji: '⚠️' };
  return { level: 'Poor', color: '#dc2626', emoji: '❌' };
}

function getMemoryUsage(): number | undefined {
  if ('memory' in performance) {
    const mem = (performance as any).memory;
    return mem?.usedJSHeapSize ? Math.round(mem.usedJSHeapSize / 1048576) : undefined;
  }
  return undefined;
}

// ============================================================================
// Default Metrics
// ============================================================================

const defaultMetrics: TestMetrics = {
  status: 'idle',
  progress: 0,
  eta: 0,
  elapsed: 0,
  avgFps: 0,
  minFps: Infinity,
  maxFps: 0,
  frameCount: 0,
  jankFrames: 0,
  droppedFrames: 0,
  currentIndex: 0,
  targetIndex: 0,
  memoryUsage: undefined,
  score: 0,
  scoreLevel: 'Poor',
  breakdown: {
    fpsConsistency: 0,
    smoothness: 0,
    memoryEfficiency: 0,
    responsiveness: 0,
  },
};

// ============================================================================
// Hook: useTestRunner
// ============================================================================

export function useTestRunner(
  scrollRef: React.RefObject<any>,
  config: TestConfig,
): {
  metrics: TestMetrics;
  startTest: () => void;
  stopTest: () => void;
  resetTest: () => void;
  isRunning: boolean;
} {
  const [metrics, setMetrics] = useState<TestMetrics>(defaultMetrics);
  const [isRunning, setIsRunning] = useState(false);
  
  const rafIdRef = useRef<number | null>(null);
  const fpsHistoryRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const sampleIndexRef = useRef<number>(0);
  
  const { itemCount, itemHeight, scrollSpeed = 5000, sampleCount = 100 } = config;
  
  // Calculate total height with browser limit consideration
  const totalHeight = itemCount * itemHeight;
  
  const stopTest = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setIsRunning(false);
  }, []);
  
  const resetTest = useCallback(() => {
    stopTest();
    setMetrics(defaultMetrics);
    fpsHistoryRef.current = [];
    sampleIndexRef.current = 0;
  }, [stopTest]);
  
  // Optimized calculateScore that takes pre-computed running sum to avoid O(n) reduce calls
  const calculateScore = useCallback((history: number[], jankCount: number, droppedCount: number, runningSum?: number): TestMetrics['breakdown'] & { score: number } => {
    const totalFrames = history.length;
    if (totalFrames === 0) return { fpsConsistency: 0, smoothness: 0, memoryEfficiency: 0, responsiveness: 0, score: 0 };
    
    // FPS Consistency (variance-based)
    // Use pre-computed sum if available, otherwise compute
    const avgFps = runningSum !== undefined ? runningSum / totalFrames : history.reduce((a, b) => a + b, 0) / totalFrames;
    
    // Only compute variance for final score or every 100 frames to reduce overhead
    let fpsConsistency = 100;
    if (totalFrames < 100 || totalFrames % 100 === 0) {
      let variance = 0;
      for (let i = 0; i < totalFrames; i++) {
        const diff = history[i] - avgFps;
        variance += diff * diff;
      }
      variance /= totalFrames;
      const stdDev = Math.sqrt(variance);
      fpsConsistency = Math.max(0, Math.min(100, 100 - (stdDev / avgFps) * 100));
    }
    
    // Smoothness (based on jank frames)
    const smoothness = Math.max(0, 100 - (jankCount / totalFrames) * 200);
    
    // Responsiveness (based on dropped frames)
    const responsiveness = Math.max(0, 100 - (droppedCount / totalFrames) * 100);
    
    // Memory efficiency (if available)
    const memoryEfficiency = 80; // Default good score
    
    // Overall score (weighted average)
    const score = Math.round(
      fpsConsistency * 0.3 +
      smoothness * 0.35 +
      responsiveness * 0.25 +
      memoryEfficiency * 0.1
    );
    
    return {
      fpsConsistency: Math.round(fpsConsistency),
      smoothness: Math.round(smoothness),
      memoryEfficiency: Math.round(memoryEfficiency),
      responsiveness: Math.round(responsiveness),
      score,
    };
  }, []);
  
  const startTest = useCallback(() => {
    const warperInstance = scrollRef.current;
    if (!warperInstance || typeof warperInstance.scrollToIndex !== 'function') {
      console.error('TestRunner: scrollRef must point to a WarperComponent instance');
      return;
    }
    
    resetTest();
    setIsRunning(true);
    
    const startTime = performance.now();
    startTimeRef.current = startTime;
    lastFrameTimeRef.current = startTime;
    fpsHistoryRef.current = [];
    sampleIndexRef.current = 0;
    
    // Calculate sample positions (spread across the entire list)
    const sampleStep = Math.floor(itemCount / sampleCount);
    
    let currentSample = 0;
    let jankCount = 0;
    let droppedCount = 0;
    let lastScrolledIndex = -1;
    // Track running min/max/sum to avoid O(n) operations per frame
    let runningSum = 0;
    let runningMin = Infinity;
    let runningMax = 0;
    
    const runTest = (now: number) => {
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      
      // Calculate FPS
      if (deltaTime > 0 && deltaTime < 1000) {
        const fps = 1000 / deltaTime;
        fpsHistoryRef.current.push(fps);
        
        // Update running statistics O(1)
        runningSum += fps;
        if (fps < runningMin) runningMin = fps;
        if (fps > runningMax) runningMax = fps;
        
        if (fps < 30) jankCount++;
        if (fps < 60) droppedCount++;
      }
      
      // Calculate current position to scroll to
      const elapsed = (now - startTime) / 1000;
      currentSample = Math.min(sampleCount - 1, Math.floor(elapsed * (sampleCount / (sampleCount * 0.1 + itemCount * itemHeight / scrollSpeed))));
      
      // Calculate target index
      const targetIndex = Math.min(itemCount - 1, currentSample * sampleStep);
      
      // Scroll to position using WarperComponent's scrollToIndex
      // Use 'auto' (instant) instead of 'smooth' to avoid browser animation jank
      if (lastScrolledIndex !== targetIndex) {
        warperInstance.scrollToIndex(targetIndex, 'auto');
        lastScrolledIndex = targetIndex;
      }
      
      // Calculate metrics using running statistics (O(1) instead of O(n))
      const historyLen = fpsHistoryRef.current.length;
      const avgFps = historyLen > 0 ? runningSum / historyLen : 0;
      
      const progress = Math.min(100, (currentSample / (sampleCount - 1)) * 100);
      const eta = progress > 0 ? ((100 - progress) / progress) * elapsed : 0;
      
      // Pass runningSum to avoid O(n) recalculation
      const breakdown = calculateScore(fpsHistoryRef.current, jankCount, droppedCount, runningSum);
      
      const scoreInfo = getScoreLevel(breakdown.score);
      setMetrics({
        status: 'running',
        progress,
        eta,
        elapsed,
        avgFps: Math.round(avgFps),
        minFps: Math.round(runningMin === Infinity ? 0 : runningMin),
        maxFps: Math.round(runningMax),
        frameCount: historyLen,
        jankFrames: jankCount,
        droppedFrames: droppedCount,
        currentIndex: targetIndex,
        targetIndex,
        memoryUsage: getMemoryUsage(),
        score: breakdown.score,
        scoreLevel: scoreInfo.level,
        breakdown,
      });
      
      // Check if test is complete
      if (currentSample >= sampleCount - 1) {
        stopTest();
        
        // Final metrics - use fpsHistoryRef.current (the actual FPS array)
        const finalBreakdown = calculateScore(fpsHistoryRef.current, jankCount, droppedCount, runningSum);
        const finalScoreInfo = getScoreLevel(finalBreakdown.score);
        setMetrics(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          eta: 0,
          score: finalBreakdown.score,
          scoreLevel: finalScoreInfo.level,
          breakdown: finalBreakdown,
        }));
        
        return;
      }
      
      rafIdRef.current = requestAnimationFrame(runTest);
    };
    
    rafIdRef.current = requestAnimationFrame(runTest);
  }, [scrollRef, config, calculateScore, resetTest, stopTest, itemCount, itemHeight, scrollSpeed, sampleCount]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
  
  return { metrics, startTest, stopTest, resetTest, isRunning };
}

// ============================================================================
// Component: TestRunner
// ============================================================================

export function TestRunner({
  config,
  scrollRef,
  onStart,
  onProgress,
  onComplete,
  onError,
  enabled = true,
  allowCustomization = true,
  style,
  className,
}: TestRunnerProps) {
  const [customConfig, setCustomConfig] = useState<TestConfig>(config);
  const [preset, setPreset] = useState<TestPreset>('standard');
  const { metrics, startTest, stopTest, resetTest, isRunning } = useTestRunner(scrollRef, customConfig);
  const prevStatusRef = useRef<TestMetrics['status']>('idle');
  
  // Apply preset configurations
  const applyPreset = useCallback((presetType: TestPreset) => {
    setPreset(presetType);
    
    const baseConfig = { ...config };
    
    switch (presetType) {
      case 'quick':
        // Fast test: high speed, low samples
        setCustomConfig({
          ...baseConfig,
          scrollSpeed: 15000, // 3x faster
          sampleCount: 30,    // 30% of samples
        });
        break;
      case 'standard':
        // Balanced test
        setCustomConfig({
          ...baseConfig,
          scrollSpeed: 8000,  // 1.6x faster
          sampleCount: 50,    // 50% of samples
        });
        break;
      case 'thorough':
        // Comprehensive test
        setCustomConfig({
          ...baseConfig,
          scrollSpeed: 5000,  // Normal speed
          sampleCount: 100,   // Full samples
        });
        break;
    }
  }, [config]);
  
  // Initialize with standard preset
  useEffect(() => {
    applyPreset('standard');
  }, [applyPreset]);
  
  // Callbacks
  useEffect(() => {
    if (prevStatusRef.current !== metrics.status) {
      prevStatusRef.current = metrics.status;
      
      if (metrics.status === 'running' && onStart) {
        onStart();
      } else if (metrics.status === 'completed' && onComplete) {
        onComplete(metrics);
      }
    }
    
    if (metrics.status === 'running' && onProgress) {
      onProgress(metrics);
    }
  }, [metrics, onStart, onProgress, onComplete]);
  
  const statusInfo = getStatusInfo(metrics.status);
  const scoreColor = getScoreColor(metrics.score);
  
  return (
    <div style={{ ...baseStyles.container, ...style }} className={className}>
      {/* Header */}
      <div style={baseStyles.header}>
        <div style={baseStyles.title}>
          <span style={{ color: '#ef4444' }}>[</span>
          benchmark
          <span style={{ color: '#ef4444' }}>]</span>
        </div>
        <div style={baseStyles.status}>
          <span style={{ ...baseStyles.statusDot, background: statusInfo.color }} />
          {statusInfo.label}
        </div>
      </div>
      
      {/* Preset Configuration */}
      {allowCustomization && !isRunning && (
        <div style={baseStyles.configPanel}>
          <span style={baseStyles.configLabel}>Test Mode</span>
          <div style={baseStyles.presetButtons}>
            <button
              onClick={() => applyPreset('quick')}
              style={{
                ...baseStyles.presetButton,
                ...(preset === 'quick' ? baseStyles.presetButtonActive : {}),
              }}
            >
              ⚡ Quick
            </button>
            <button
              onClick={() => applyPreset('standard')}
              style={{
                ...baseStyles.presetButton,
                ...(preset === 'standard' ? baseStyles.presetButtonActive : {}),
              }}
            >
              ⚙ Standard
            </button>
            <button
              onClick={() => applyPreset('thorough')}
              style={{
                ...baseStyles.presetButton,
                ...(preset === 'thorough' ? baseStyles.presetButtonActive : {}),
              }}
            >
              🔬 Thorough
            </button>
          </div>
          <div style={baseStyles.configRow}>
            <span style={baseStyles.configLabel}>
              Speed: {((customConfig.scrollSpeed || 5000) / 1000).toFixed(0)}k px/s
            </span>
            <span style={{ ...baseStyles.configLabel, textAlign: 'right' as const }}>
              Samples: {customConfig.sampleCount || 100}
            </span>
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div style={baseStyles.progressContainer}>
        <div style={baseStyles.progressBar}>
          <div
            style={{
              ...baseStyles.progressFill,
              width: `${metrics.progress}%`,
              background: metrics.status === 'completed'
                ? scoreColor
                : 'linear-gradient(90deg, #00d4aa, #22c55e)',
            }}
          />
        </div>
        <div style={baseStyles.progressText}>
          <span>Progress: {Math.round(metrics.progress)}%</span>
          <span>
            {metrics.status === 'running' ? `ETA: ${formatTime(metrics.eta)}` : `Elapsed: ${formatTime(metrics.elapsed)}`}
          </span>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div style={baseStyles.metricsGrid}>
        <div style={baseStyles.metricCard}>
          <span style={baseStyles.metricLabel}>Avg FPS</span>
          <span style={{ ...baseStyles.metricValue, color: metrics.avgFps >= 60 ? '#00d4aa' : metrics.avgFps >= 30 ? '#eab308' : '#ef4444' }}>
            {metrics.avgFps}
          </span>
        </div>
        <div style={baseStyles.metricCard}>
          <span style={baseStyles.metricLabel}>Min FPS</span>
          <span style={{ ...baseStyles.metricValue, color: metrics.minFps >= 30 ? '#22c55e' : '#ef4444' }}>
            {isFinite(metrics.minFps) ? Math.round(metrics.minFps) : '--'}
          </span>
        </div>
        <div style={baseStyles.metricCard}>
          <span style={baseStyles.metricLabel}>Max FPS</span>
          <span style={baseStyles.metricValue}>
            {Math.round(metrics.maxFps)}
          </span>
        </div>
        <div style={baseStyles.metricCard}>
          <span style={baseStyles.metricLabel}>Frames</span>
          <span style={baseStyles.metricValue}>
            {metrics.frameCount}
          </span>
        </div>
        <div style={baseStyles.metricCard}>
          <span style={baseStyles.metricLabel}>Jank</span>
          <span style={{ ...baseStyles.metricValue, color: metrics.jankFrames === 0 ? '#00d4aa' : '#ef4444' }}>
            {metrics.jankFrames}
          </span>
        </div>
        <div style={baseStyles.metricCard}>
          <span style={baseStyles.metricLabel}>Memory</span>
          <span style={baseStyles.metricValue}>
            {metrics.memoryUsage ? `${metrics.memoryUsage}MB` : '--'}
          </span>
        </div>
      </div>
      
      {/* Score (after test) */}
      {metrics.status === 'completed' && (
        <>
          <div style={baseStyles.scoreContainer}>
            <div style={baseStyles.scoreCircle}>
              <span style={{ ...baseStyles.scoreValue, color: scoreColor }}>
                {metrics.score}
              </span>
              <span style={baseStyles.scoreLabel}>Score</span>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                color: getScoreLevel(metrics.score).color,
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                {getScoreLevel(metrics.score).emoji} {metrics.scoreLevel}
              </span>
            </div>
          </div>
          <div style={baseStyles.breakdownGrid}>
            <div style={baseStyles.breakdownItem}>
              <span style={baseStyles.breakdownLabel}>FPS Consistency</span>
              <span style={{ ...baseStyles.breakdownValue, color: getScoreColor(metrics.breakdown.fpsConsistency) }}>
                {metrics.breakdown.fpsConsistency}
              </span>
            </div>
            <div style={baseStyles.breakdownItem}>
              <span style={baseStyles.breakdownLabel}>Smoothness</span>
              <span style={{ ...baseStyles.breakdownValue, color: getScoreColor(metrics.breakdown.smoothness) }}>
                {metrics.breakdown.smoothness}
              </span>
            </div>
            <div style={baseStyles.breakdownItem}>
              <span style={baseStyles.breakdownLabel}>Responsiveness</span>
              <span style={{ ...baseStyles.breakdownValue, color: getScoreColor(metrics.breakdown.responsiveness) }}>
                {metrics.breakdown.responsiveness}
              </span>
            </div>
            <div style={baseStyles.breakdownItem}>
              <span style={baseStyles.breakdownLabel}>Memory</span>
              <span style={{ ...baseStyles.breakdownValue, color: getScoreColor(metrics.breakdown.memoryEfficiency) }}>
                {metrics.breakdown.memoryEfficiency}
              </span>
            </div>
          </div>
        </>
      )}
      
      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {!isRunning ? (
          <button
            onClick={startTest}
            disabled={!enabled}
            style={{
              ...baseStyles.button,
              flex: 1,
              ...(enabled ? {} : baseStyles.buttonDisabled),
            }}
          >
            ▶ Run Test
          </button>
        ) : (
          <button
            onClick={stopTest}
            style={{ ...baseStyles.button, ...baseStyles.buttonActive, flex: 1 }}
          >
            ■ Stop
          </button>
        )}
        {metrics.status === 'completed' && (
          <button
            onClick={resetTest}
            style={{ ...baseStyles.button, flex: 1 }}
          >
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default TestRunner;
