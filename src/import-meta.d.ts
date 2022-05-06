// Ref:
// - https://github.com/vitejs/vite/blob/b5c370941bb36bdb420433ca16cea9c2402b9810/packages/vite/types/importMeta.d.ts
// - https://ja.vitejs.dev/guide/env-and-mode.html#typescript-%E7%94%A8%E3%81%AE%E8%87%AA%E5%8B%95%E8%A3%9C%E5%AE%8C
interface GlobOptions {
  as?: string;
}

interface ImportMeta {
  glob<Module = { [key: string]: any }>(
    pattern: string,
    options?: GlobOptions
  ): Record<string, () => Promise<Module>>;

  env: {
    SSR: boolean;
  };
}
