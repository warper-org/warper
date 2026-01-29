# Warper

<div align="center">

[![npm version](https://img.shields.io/npm/v/@itsmeadarsh/warper?style=flat-square)](https://www.npmjs.com/package/@itsmeadarsh/warper)
[![npm downloads](https://img.shields.io/npm/dm/@itsmeadarsh/warper?style=flat-square)](https://www.npmjs.com/package/@itsmeadarsh/warper)
[![License](https://img.shields.io/github/license/warper-org/warper?style=flat-square)](./LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@itsmeadarsh/warper?style=flat-square)](https://bundlephobia.com/package/@itsmeadarsh/warper)

**Ultra-fast React virtualization library powered by Rust and WebAssembly**

10,000,000+ rows | 120+ FPS | O(1) lookups | Cross-browser

[Live Demo](https://warper.tech/) | [Documentation](#api-reference) | [Examples](https://warper.tech/#examples)

</div>

---

## Features

- **120+ FPS** - Smooth scrolling performance even with millions of items
- **10M+ Items** - Handle massive datasets without breaking a sweat
- **O(1) Uniform Operations** - Instant calculations for fixed-height items
- **O(log n) Variable Sizes** - Fenwick tree for dynamic heights
- **GPU Acceleration** - CSS `transform3d()` and `contain: strict`
- **Zero-Copy Transfers** - Direct WASM-to-JS typed arrays
- **Adaptive Overscan** - Smart prefetching based on scroll velocity
- **Skip-Render Optimization** - Only re-render when range changes
- **8x Loop Unrolling** - Maximum instruction throughput
- **Pre-allocated Pools** - Zero allocation in scroll hot path
- **Cross-Browser** - Chrome, Firefox, Safari, Edge support
- **~8.7KB Bundle** - Tree-shakable, minimal footprint (8.7kB gzipped)
- **TypeScript First** - Full type safety

---

## Installation

```bash
npm install @itsmeadarsh/warper
# or
yarn add @itsmeadarsh/warper
# or
pnpm add @itsmeadarsh/warper
# or
bun add @itsmeadarsh/warper
```

---

## Quick Start

### Using the Hook (Recommended)

```tsx
import { useVirtualizer } from '@itsmeadarsh/warper';

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
import { WarperComponent } from '@itsmeadarsh/warper';

function MyList() {
  return (
    <WarperComponent
      itemCount={1_000_000}
      estimateSize={() => 50}
      height={500}
      overscan={5}
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

## API Reference

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
  className?: string;
  style?: CSSProperties;
  onRendered?: () => void;
  loadingPlaceholder?: React.ReactNode;
  errorPlaceholder?: (error: Error) => React.ReactNode;
}
```

---

## Browser Support

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

## Comparison

| Feature | Warper | react-window | react-virtuoso | @tanstack/virtual |
|---------|--------|--------------|----------------|-------------------|
| WASM Core | Yes | No | No | No |
| 10M+ Items | Yes | Limited | Limited | Yes |
| 120+ FPS | Yes | Yes | Yes | Yes |
| O(1) Fixed | Yes | No | No | No |
| O(log n) Variable | Yes | No | No | No |
| Zero-Copy Arrays | Yes | No | No | No |
| GPU Acceleration | Yes | Limited | Limited | Limited |
| Adaptive Overscan | Yes | No | No | No |
| TypeScript | Yes | Yes | Yes | Yes |
| Bundle Size | ~6KB | ~6KB | ~25KB | ~12KB |

---

## Development

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

## Examples

Explore the repository to see Warper in action:

- [/examples/list](./examples/list) - Standard virtualized list implementation
- [/examples/one-million-rows](./examples/one-million-rows) - Stress test with 1 million rows
- [/examples/grid](./examples/grid) - Grid virtualization example
- [/examples/chat](./examples/chat) - Chat interface with variable heights
- [/examples/tree](./examples/tree) - Hierarchical tree view

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## AI Assistance

Need help with Warper? You can use **Context7 MCP** to get up-to-date documentation and code examples directly in your AI coding assistant. Context7 provides real-time access to Warper's API reference and usage patterns.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Warper** - Ultra-Fast React Virtualization

Rust/WASM | 120+ FPS | O(1) & O(log n)

[GitHub](https://github.com/warper-org/warper) | [npm](https://www.npmjs.com/package/@itsmeadarsh/warper) | [Documentation](#api-reference)

</div>
