// src/core/wasm.ts
import init, { Virtualizer } from 'warper/wasm/rust/pkg/warper_wasm.js';

// This is the path to the wasm file, as handled by Vite.
// The `?url` suffix tells Vite to treat this as an asset URL.
import wasmUrl from 'warper/wasm/rust/pkg/warper_wasm_bg.wasm?url';

export type WasmStatus = 'idle' | 'initializing' | 'ready' | 'error';

let wasmStatus: WasmStatus = 'idle';
let wasmError: Error | null = null;
let initializationPromise: Promise<void> | null = null;

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

const setStatus = (status: WasmStatus, error: Error | null = null) => {
  wasmStatus = status;
  wasmError = error;
};

export const initializeWasm = (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  if (wasmStatus === 'ready') {
    return Promise.resolve();
  }

  setStatus('initializing');

  initializationPromise = (async () => {
    try {
      await init(wasmUrl);
      setStatus('ready');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to initialize WASM module:', error);
      setStatus('error', error);
      throw error; // Re-throw to allow callers to handle it
    } finally {
      initializationPromise = null; // Reset for potential re-initialization
    }
  })();

  return initializationPromise;
};

export const getWasmStatus = () => ({
  status: wasmStatus,
  error: wasmError,
});

export { Virtualizer };
