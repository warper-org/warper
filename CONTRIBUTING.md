# Contributing to Warper

Thanks for your interest in contributing to Warper!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/warper-org/warper.git
cd warper

# Install dependencies
bun install

# Install Rust and wasm-pack (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install wasm-pack

# Build WASM
bun run build:wasm

# Run an example
bun run example:list
```

## Project Structure

```
warper/
├── core/           # Core WASM bridge
├── react/          # React components and hooks
├── types/          # TypeScript type definitions
├── wasm/rust/      # Rust WASM source code
└── examples/       # Demo applications
```

## Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run the build to verify (`bun run build`)
5. Test with an example (`bun run example:one-million-rows`)
6. Commit your changes (`git commit -m 'Add my feature'`)
7. Push to your fork (`git push origin feature/my-feature`)
8. Open a Pull Request

## Building

```bash
# Build WASM only
bun run build:wasm

# Build TypeScript only
tsc

# Build everything
bun run build
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Keep bundle size in mind

## Reporting Issues

When reporting issues, please include:

- Warper version
- Browser and version
- Minimal reproduction steps
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
