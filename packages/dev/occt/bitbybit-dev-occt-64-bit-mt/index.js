// BitbybitOcct 64-bit Multi-threaded (Memory64 + pthreads) module
// Requires: 
//   - Chrome 133+ or Firefox 134+ (for Memory64)
//   - Cross-Origin Isolation headers for SharedArrayBuffer:
//       Cross-Origin-Opener-Policy: same-origin
//       Cross-Origin-Embedder-Policy: require-corp
//
// Provides:
//   - Access to >4GB memory for large CAD models
//   - Parallel operations for faster processing

export { default } from './bitbybit-dev-occt-64-bit-mt.js';
export * from './bitbybit-dev-occt-64-bit-mt.js';
