declare module 'top-level-await';

// Vite asset imports
declare module '*.wasm?url' {
  const url: string;
  export default url;
}

declare module '*.wasm' {
  const url: string;
  export default url;
}
