# 🚀 Warper: The Blazing-Fast React Virtualizer

**1 Million Rows. 60 FPS. Zero Compromises.**

---

Warper isn't just another virtualization library. It's a ground-up rethink of how to handle massive lists in React, powered by a **Rust-based WebAssembly (WASM) core**. By offloading the heavy lifting of layout calculation from JavaScript to WASM, Warper achieves performance levels that are simply out of reach for traditional libraries.

*The live benchmark shows Warper's calculation time remains near-zero, even with one million items, while other libraries struggle.*

## ✨ Key Features

* **Insane Performance:** A Rust & WASM engine for near-instant calculations on every scroll.
* **Massive Datasets:** Effortlessly handles millions of rows without breaking a sweat.
* **Headless by Design:** Provides a powerful `useVirtualizer` hook for maximum flexibility and control.
* **Developer Experience:** Simple API, first-class TypeScript support, and easy to debug.
* **Layouts:** Supports fixed and variable-sized lists out-of-the-box. (Grid and Masonry coming soon!).
* **Modern:** Built for React 18 with concurrency in mind.

## 🤔 When Should I Use Warper?

You should use Warper if:

* You are rendering lists with **more than 10,000 items**.
* **Scroll performance** is a critical, non-negotiable feature of your application.
* You are building data-intensive applications like analytics dashboards, log viewers, or financial trading platforms.
* You've tried other libraries and found they buckle under the pressure of your dataset.

## 💾 Installation

```bash
npm install warper
```

> **Note:** Warper is not yet published to npm. To use it, please clone the repository and build it locally.

## 🚀 Quick Start & Guide

Warper is designed to be incredibly easy to use. The primary API is the `useVirtualizer` hook.

Here's a complete, copy-pasteable example for a list of 1 million items:

```tsx
import React from 'react';
import { useVirtualizer } from 'warper';

// 1. Your data: an array of 1 million items
const bigList = Array.from({ length: 1000000 }).map((_, i) => `Item ${i}`);

const MyComponent = () => {
  // 2. State to track scroll position
  const [scrollTop, setScrollTop] = React.useState(0);

  // 3. Call the hook with your list's configuration
  const { containerRef, items, totalHeight } = useVirtualizer({
    itemCount: bigList.length,
    estimateSize: () => 35, // The height of each item in pixels
    height: 500,             // The height of the scrollable container
    scrollTop: scrollTop,    // The current scroll position
    overscan: 2,             // Render 2 extra items above and below the viewport
  });

  // 4. Handle the scroll event on your container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // 5. Render the container and the virtual items
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ overflowY: 'auto', height: '500px', border: '1px solid #ccc' }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {items.map((item) => (
          <div
            key={item.index}
            style={item.style} // Apply the calculated style directly
          >
            {bigList[item.index]}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### How It Works

1. **`useVirtualizer(options)`**: You provide the hook with information about your list (the number of items, their estimated size, the container height, and the current scroll position).
2. **WASM Core**: Warper's WebAssembly module instantly calculates which items should be visible in the viewport, including the overscan items.
3. **Returns**: The hook returns:
    * `containerRef`: A ref to attach to your scrollable container element.
    * `totalHeight`: The total calculated height of the entire list, which you apply to an inner div to create a correct scrollbar.
    * `items`: An array of objects, each containing the `index` of the item to render and a `style` object to position it perfectly.

## 📖 API Reference: `useVirtualizer`

### Options

| Name         | Type                      | Description                                                                                             |
| :----------- | :------------------------ | :------------------------------------------------------------------------------------------------------ |
| `itemCount`  | `number`                  | **Required.** The total number of items in your list.                                                   |
| `estimateSize`| `(index: number) => number` | **Required.** A function that returns the height of an item at a given index. For fixed-size lists, this can be `() => 35`. |
| `height`     | `number`                  | **Required.** The height of the scrollable container element in pixels.                                 |
| `scrollTop`  | `number`                  | **Required.** The current scroll top position of the container.                                         |
| `overscan`   | `number` (optional)       | The number of extra items to render on each side of the viewport. Defaults to `2`.                      |

### Return Values

| Name          | Type                               | Description                                                                                                                                                           |
| :------------ | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `containerRef`| `React.RefObject<HTMLDivElement>`  | A ref that should be attached to your main scrollable `div`.                                                                                                          |
| `totalHeight` | `number`                           | The total height of all items combined. This is used to set the height of an inner element to ensure the scrollbar is the correct size.                                  |
| `items`       | `Array<{index: number, style: React.CSSProperties}>` | An array of items that should be rendered. Each object contains the `index` from your original data array and a `style` object to apply to the rendered element. |

## 🔬 The Benchmark Explained

The performance of a virtualization library is determined by two key factors:

1. **Initialization Time**: The one-time cost to set up the virtualizer.
2. **Calculation Time**: The recurring cost on **every scroll event** to determine what to render.

While other libraries are fast, their calculation logic runs in JavaScript, which becomes a bottleneck under heavy load. **Warper's innovation is to move this calculation to a pre-compiled Rust module.**

| Library             | Calculation Time (1M items) | Architecture |
| :------------------ | :-------------------------- | :----------- |
| **Warper**          | **~0.01ms**                 | **WASM**     |
| React Window        | ~3-5ms                      | JS           |
| React Virtualized   | ~4-7ms                      | JS           |
| TanStack Virtual    | ~10-15ms                    | JS           |

As you can see, Warper is not just a little faster; it's **orders of magnitude faster** where it counts the most, guaranteeing a fluid, 60+ FPS experience no matter how fast you scroll.

## 📂 Examples

Explore the repository to see Warper in action:

* **`/examples/list`**: A standard implementation of a virtualized list.
* **`/examples/one-million-rows`**: The ultimate stress test.
* **`/examples/warper-benchmark`**: The live, interactive benchmark used to generate the data for this README. Run it yourself!

## 🤝 Contributing

Warper is open-source and we welcome contributions. Whether it's bug reports, feature requests, or code contributions, we'd love your help to make Warper the undisputed king of virtualization.

## 📜 License

This project is licensed under the MIT License.
