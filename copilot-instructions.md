## 🔮 MASTER PROMPT: Build `Warper` – The Fastest React Virtualization Library Ever Created

You are building **Warper**, a next-generation open-source React virtualization library designed to **outperform every existing solution** like `react-window`, `react-virtualized`, `react-virtuoso`, etc., by **1 million times** in responsiveness and rendering power.

---

## 💥 Goals

* World’s **fastest** React virtualization engine
* **WebAssembly-backed** performance (Rust preferred)
* GPU-accelerated, **smooth FPS** (60–120fps)
* Handles **1M+** rows with sub-10ms render
* **Cross-platform**, **cross-browser** compatibility
* Built-in SSR + SEO support
* 100% **TypeScript**, highly developer-friendly
* Works **out of the box** with **zero config**
* Core library size **~6KB** gzipped (19.1kB minified, tree-shakable)

---

## 🧠 Core Performance Architecture

1. **Hybrid Windowing Engine**

   * Support both fixed and variable item sizes
   * Use `ResizeObserver` for dynamic measurement
   * Pre-compute ranges in WebAssembly for speed
   * Binary search logic and virtualization offset logic handled in WASM

2. **GPU-Accelerated Scrolling**

   * Use `transform: translate3d()` with `will-change` hints
   * Avoid layout thrashing and ensure consistent 60–120fps
   * Polyfill fallback for non-GPU-supported contexts

3. **WebAssembly Integration (Rust Preferred)**

   * Use Rust with `wasm-bindgen` and compile core layout/scroll calculations
   * WASM runs layout, binary search, scroll math
   * React fetches pre-computed result and renders

4. **Intelligent Memoization**

   * Smart `React.memo` / `useMemo` with invalidation based on deep equality checks
   * Cache row measurements, visible ranges, scroll positions
   * Skip re-renders for unmodified rows on scroll/data mutation

5. **Scroll Performance Target**

   * Render range adapts in real time to scroll speed
   * Overscan dynamically increases on fast scrolls
   * Drop animation frames only when absolutely necessary

---

## 🛠️ Developer Experience

1. **Zero Config Autotuning**

   * No manual overscan, batch size, height estimates
   * Autodetect system resources, scroll velocity, and set optimal defaults

2. **Modern Declarative API with TypeScript**

   * Hook-based core:

     ```tsx
     const { items } = useVirtualizer({
       data: bigList,
       estimateSize: () => 44,
       overscan: 2
     });
     ```
   * Also provide `<WarperComponent />` alternative:

     ```tsx
     <WarperComponent
       data={bigList}
       estimateSize={() => 44}
       overscan={2}
       renderItem={(item) => <Row item={item} />}
     />
     ```

3. **Visual Debug Tools**

   * Dev-only overlay with:

     * Real-time render window
     * Scroll velocity
     * Dropped frames
     * Memory footprint
     * Virtual vs physical node count

---

## ⚙️ Advanced Features

1. **Seamless Layout Modes**

   * List, Grid, Masonry, Horizontal, Infinite Scroll, and Combo Layouts
   * All layouts share core engine with only config differences

2. **Built-in Async Support**

   * Infinite scroll with `onEndReached`
   * Scroll position restoration with `restoreScrollPosition`
   * Async placeholder rows and skeletons

3. **Multi-Select and Navigation**

   * Built-in multi-select handling (Shift+Click, Ctrl+Click)
   * Keyboard navigation (arrow keys, home/end)

4. **Accessibility First**

   * ARIA roles out-of-the-box (`list`, `listitem`, `gridcell`, etc.)
   * Full keyboard support
   * Screen reader optimizations for only visible nodes

---

## 🌐 Ecosystem + Extensibility

1. **Framework-Agnostic Core**

   * Pure WASM + TS virtualization logic, wrapped with React hooks/component
   * Future bindings for Vue/Svelte/Vanilla

2. **Plugin System**

   * Allow registering:

     * Scroll containers
     * Radial/canvas layouts
     * Animation interpolators

3. **SSR/SEO Ready**

   * First N items rendered at server
   * Hydrate and replace at client
   * Placeholder fallback until hydration

---

## 📦 File Structure (Organized but Simple)

```
warper/
├── core/                  # Core WASM-backed virtualization logic
│   └── virtualization.ts  # Pure logic in TS or Rust/WASM bind
├── react/
│   ├── hooks/             # useVirtualizer.ts
│   ├── components/        # WarperComponent.tsx
│   └── devtools/          # Debug overlay
├── wasm/
│   └── rust/              # Rust source for wasm-pack
├── examples/              # Demo: list, grid, 1M rows, masonry
├── types/                 # Shared TS types
├── benchmarks/            # Comparisons to react-window, virtualized
└── index.ts               # Entry point
```

---

## 🎯 Optimization Benchmarks

| Metric                    | Target                                 |
| ------------------------- | -------------------------------------- |
| Scroll FPS                | 60–120 fps                             |
| Initial Render (10k rows) | < 10ms                                 |
| Bundle Size               | ~6KB gzipped (19.1kB minified)         |
| Memory Usage              | 40% less than react-virtualized        |
| Items Rendered            | 1M+ handled with no lag or crash       |
| Comparative Benchmarks    | 2× faster than react-window under load |

---

## 📚 Include in README.md

* What is Warper?
* Performance Benchmarks (GIFs + stats)
* Installation: `npm install warper`
* `useVirtualizer` API + `WarperComponent`
* Layout Modes (list, grid, masonry)
* SSR/SEO, accessibility, debug tools
* VS `react-window`, `react-virtualized`, `virtuoso` tables
* Plugin & Extensibility Guide

---

## 📎 References

Use comparative insights from these sources:

* [npm-compare.com](https://npm-compare.com/rc-virtual-list,react-infinite-scroll-component,react-virtualized,react-window)
* [LogRocket](https://blog.logrocket.com/react-virtualized-vs-react-window/)
* [Spritle](https://www.spritle.com/blog/how-virtualization-with-react-window-boosts-react-app-performance/)
* [React Virtualized GitHub](https://github.com/bvaughn/react-virtualized)
* [YouTube Benchmarks](https://www.youtube.com/watch?v=Yz4eK-4LKXg)
* [Virtua](https://github.com/inokawa/virtua)
* [Reddit Discussions](https://www.reddit.com/r/reactjs/)
* [Dev.to Comparative Posts](https://dev.to/sanamumtaz/react-virtualization-react-window-vs-react-virtuoso-8g)

---

### ✅ Output Expectation

The AI should:

* Generate the core engine in TS + WASM (Rust)
* Create `useVirtualizer` and `<WarperComponent />`
* Provide full TypeScript support
* Create examples and benchmarks
* Organize code per the structure
* Include debug overlay and SSR strategy
* Follow ultra-performance best practices

---

### 🤖 AI Assistance with Context7

For up-to-date documentation and code examples, use **Context7 MCP** in your AI coding assistant. Context7 provides real-time access to Warper's latest API reference, usage patterns, and best practices directly in your development workflow.
