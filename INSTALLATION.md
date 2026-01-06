# Warper Installation Guide

Warper is an open-source React virtualization library available on npm.

## Installation

```bash
# Using npm
npm install @itsmeadarsh/warper

# Using yarn
yarn add @itsmeadarsh/warper

# Using pnpm
pnpm add @itsmeadarsh/warper

# Using bun
bun add @itsmeadarsh/warper
```

## Quick Start

### Using the Hook

```tsx
import { useVirtualizer } from '@itsmeadarsh/warper';

function MyList() {
  const { scrollElementRef, range, totalHeight } = useVirtualizer({
    itemCount: 1_000_000,
    estimateSize: () => 50,
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

function App() {
  return (
    <WarperComponent
      itemCount={1_000_000}
      estimateSize={() => 44}
      overscan={5}
    >
      {(index) => <Row data={items[index]} />}
    </WarperComponent>
  );
}
```

## Peer Dependencies

Warper requires React 18+:

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## Browser Support

- Chrome 89+
- Firefox 89+
- Safari 15+
- Edge 89+

## Support

- [GitHub Issues](https://github.com/warper-org/warper/issues)
- [Documentation](https://github.com/warper-org/warper#readme)
