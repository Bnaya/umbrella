// The entry file of your WebAssembly module.

import { MemPool } from "../src/pool";

export { MemPool }

export function add(a: i32, b: i32): i32 {
  return a + b;
}
