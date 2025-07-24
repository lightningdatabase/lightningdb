import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: [
      "src/index.ts",
      "src/replication/index.ts",
      "src/types.ts",
      "src/auth.ts",
    ],
    format: ["esm"],
    dts: true,
    outDir: "dist",
    splitting: false,
    clean: true,
  },
])
