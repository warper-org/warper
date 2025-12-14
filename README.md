# ⚡ WARPER v5.0 QUANTUM ENGINE

<div align="center">

![Warper Banner](https://img.shields.io/badge/WARPER-QUANTUM-00ff88?style=for-the-badge&labelColor=0f0f1a)
![Version](https://img.shields.io/badge/version-5.0.0-00d9ff?style=for-the-badge&labelColor=0f0f1a)
![License](https://img.shields.io/badge/license-MIT-ffdd00?style=for-the-badge&labelColor=0f0f1a)
![FPS](https://img.shields.io/badge/FPS-120+-ff3366?style=for-the-badge&labelColor=0f0f1a)

### **Ultra-Fast React Virtualization Library**

**10,000,000+ Rows • 120+ FPS • Zero Lag • Cross-Browser**

*Powered by Rust + WebAssembly QUANTUM Engine*

</div>

---

## ⚡ What's New in v5.0 QUANTUM

- 🚀 **Complete Rust Rewrite** - New QUANTUM engine architecture
- 🎯 **8x Loop Unrolling** - Maximized instruction throughput
- 🔥 **Optimized Algorithms** - Minimal overhead in hot paths
- 💾 **Cache-Line Aligned** - 64-byte alignment for optimal memory access
- 🏎️ **Zero-Allocation Hot Path** - Pre-allocated memory pools
- ⚡ **O(1) Uniform Operations** - Instant calculations for fixed-height items
- 📊 **O(log n) Variable Sizes** - Fenwick tree for dynamic heights

---

## 🏎️ QUANTUM Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ⚡ WARPER v5.0 QUANTUM ENGINE ⚡                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CORE OPTIMIZATIONS:                                                    │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐        │
│  │  Optimized Ops   │ │  8x Unrolled     │ │  Cache-Line      │        │
│  │  Minimal overhead│ │  Loop throughput │ │  64B alignment   │        │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘        │
│                                                                         │
│  DATA STRUCTURES:                                                       │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐        │
│  │  QuantumFenwick  │ │  QuantumPool     │ │  QuantumProfiler │        │
│  │  O(log n) sums   │ │  Zero allocation │ │  O(1) statistics │        │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘        │
│                                                                         │
│  VIRTUALIZERS:                                                          │
│  ┌──────────────────────────────┐ ┌──────────────────────────────┐     │
│  │      QuantumUniform          │ │      QuantumVariable         │     │
│  │  O(1) ALL operations         │ │  O(log n) with Fenwick tree  │     │
│  └──────────────────────────────┘ └──────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- 🚀 **120+ FPS** - Smooth scrolling performance
- 💪 **10M+ Items** - Handle massive datasets effortlessly
- ⚡ **O(1) Uniform Operations** - Instant calculations for fixed-height items
- 📊 **O(log n) Variable Sizes** - Fenwick tree for dynamic heights
- 🎮 **GPU Acceleration** - CSS `transform3d()` and `contain: strict`
- 🔄 **Zero-Copy Transfers** - Direct WASM-to-JS typed arrays
- 🎯 **Adaptive Overscan** - Smart prefetching based on scroll velocity
- 🧠 **Skip-Render Optimization** - Only re-render when range changes
- 🔥 **8x Loop Unrolling** - Maximum instruction throughput
- 💾 **Pre-allocated Pools** - Zero allocation in scroll hot path
- 🌐 **Cross-Browser** - Chrome, Firefox, Safari, Edge support
- 📦 **< 50KB Bundle** - Tree-shakable, minimal footprint
- 🔒 **TypeScript First** - Full type safety

---

## 📦 Installation

```bash
npm install warper
# or
yarn add warper
# or
pnpm add warper
# or
bun add warper
```

---

## 🚀 Quick Start

### Using the Hook (Recommended)

```tsx
import { useVirtualizer } from 'warper';

function MyList() {
  const { scrollElementRef, range, totalHeight } = useVirtualizer({
    itemCount: 1_000_000,  // 1 million items!
    estimateSize: () => 50, // Fixed row height
    overscan: 5,
  });

  return (
    <div ref={scrollElementRef} style={{ height: 500, overflow: 'auto' }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {range.items.map((index, i) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${range.offsets[i]}px)`,
              height: range.sizes[i],
              width: '100%',
            }}
          >
            Row {index}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Using the Component

```tsx
import { WarperComponent } from 'warper';

function MyList() {
  return (
    <WarperComponent
      itemCount={1_000_000}
      estimateSize={() => 50}
      height={500}
      overscan={5}
      showFPS  // Show FPS overlay (dev mode)
    >
      {(index) => (
        <div style={{ padding: 16 }}>
          Row {index}
        </div>
      )}
    </WarperComponent>
  );
}
```

---

## 📖 API Reference

### `useVirtualizer<T>(options)`

The core hook for virtualization.

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `itemCount` | `number` | **required** | Total number of items |
| `estimateSize` | `(index: number) => number` | **required** | Function returning item height |
| `overscan` | `number` | `5` | Extra items to render above/below |
| `horizontal` | `boolean` | `false` | Horizontal scroll mode |
| `height` | `number \| string` | `'100%'` | Container height |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `scrollElementRef` | `RefObject` | Attach to scroll container |
| `range` | `VirtualRange` | Current visible range data |
| `totalHeight` | `number` | Total scrollable height |
| `isLoading` | `boolean` | WASM loading state |
| `error` | `Error \| null` | Error if initialization failed |
| `scrollToIndex` | `(index, behavior?) => void` | Scroll to specific index |
| `scrollToOffset` | `(offset, behavior?) => void` | Scroll to pixel offset |

### `VirtualRange`

```typescript
interface VirtualRange {
  startIndex: number;    // First visible index
  endIndex: number;      // Last visible index
  items: number[];       // Array of visible indices
  offsets: number[];     // Y-offset for each item
  sizes: number[];       // Height of each item
  totalHeight: number;   // Total content height
  velocity: number;      // Current scroll velocity
}
```

### `<WarperComponent>`

A ready-to-use virtualized list component.

```tsx
interface WarperComponentProps<T> {
  itemCount: number;
  estimateSize: (index: number) => number;
  children: (index: number) => React.ReactNode;
  overscan?: number;
  height?: number | string;
  horizontal?: boolean;
  showFPS?: boolean;
  className?: string;
  style?: CSSProperties;
  onRendered?: () => void;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: (error: Error) => React.ReactNode;
}
```

---

## ⚡ QUANTUM Performance Architecture

### Key Optimizations

1. **O(1) Uniform Sizes** - Pure arithmetic for fixed-height items
2. **Fenwick Tree** - O(log n) prefix sums for variable heights
3. **Binary Search** - Cache-friendly, predictable performance
4. **8x Loop Unrolling** - Maximized instruction pipeline utilization
5. **Zero-Copy Typed Arrays** - Direct WASM memory access, no serialization
6. **Pre-allocated Pools** - Zero allocation in scroll hot path
7. **Adaptive Overscan** - More items prefetched during fast scrolling
8. **GPU Compositing** - CSS `transform3d()` for hardware acceleration
9. **CSS Containment** - `contain: strict` isolates layout recalculations
10. **Skip-Render** - React only updates when visible range changes

---

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 89+ |
| Firefox | 89+ |
| Safari | 15+ |
| Edge | 89+ |
| Opera | 75+ |
| Chrome Android | Latest |
| Safari iOS | 15+ |

Warper uses:
- `WebAssembly.compileStreaming` (with fallback)
- `CSS contain` property
- `transform3d` for GPU layers
- Passive scroll listeners

---

## 📊 Feature Comparison

| Feature | Warper QUANTUM | react-window | react-virtuoso | @tanstack/virtual |
|---------|----------------|--------------|----------------|-------------------|
| WASM Core | ✅ | ❌ | ❌ | ❌ |
| 10M+ Items | ✅ | ⚠️ | ⚠️ | ✅ |
| 120+ FPS | ✅ | ✅ | ✅ | ✅ |
| O(1) Fixed | ✅ | ❌ | ❌ | ❌ |
| O(log n) Variable | ✅ | ❌ | ❌ | ❌ |
| Zero-Copy Arrays | ✅ | ❌ | ❌ | ❌ |
| 8x Loop Unrolling | ✅ | ❌ | ❌ | ❌ |
| GPU Acceleration | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Adaptive Overscan | ✅ | ❌ | ❌ | ❌ |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| Bundle Size | ~45KB | ~6KB | ~25KB | ~12KB |

---

## 🔧 Development

```bash
# Install dependencies
bun install

# Build WASM (requires Rust + wasm-pack)
cd wasm/rust && wasm-pack build --target web --release

# Run examples
bun run example:one-million-rows
bun run example:list
bun run example:grid
```

### Building from Source

```bash
# Prerequisites
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install wasm-pack

# Build WASM
cd wasm/rust && wasm-pack build --target web --release

# Build TypeScript
bun run build
```

---

## 📂 Examples

Explore the repository to see Warper in action:

* **`/examples/list`** - A standard implementation of a virtualized list.
* **`/examples/one-million-rows`** - The ultimate stress test with 1 million rows.
* **`/examples/grid`** - Grid virtualization example.

---

## 🤝 Contributing

Warper is open-source and we welcome contributions. Whether it's bug reports, feature requests, or code contributions, we'd love your help!

---

## 📜 License

MIT © [Adarsh](https://github.com/itsmeadarsh2008)

---

<div align="center">

**⚡ WARPER v5.0 QUANTUM ENGINE ⚡**

*Ultra-Fast React Virtualization*

*Rust/WASM • 120+ FPS • Zero Allocation • O(1) & O(log n)*

[GitHub](https://github.com/itsmeadarsh2008/warper) • [NPM](https://npmjs.com/package/warper)

</div>
