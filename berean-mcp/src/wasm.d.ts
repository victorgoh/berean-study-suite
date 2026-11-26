/** Wrangler's CompiledWasm rule (wrangler.jsonc) bundles .wasm imports as compiled modules. */
declare module "*.wasm" {
  const module: WebAssembly.Module;
  export default module;
}
