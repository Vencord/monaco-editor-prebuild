import { defineConfig } from "vite";
import omt from "./scripts/vite-plugin-omt";
export default defineConfig({
    input: "src/index.ts",
    build: {
        rolldownOptions: {
            output: {
                chunkFileNames: "[hash:8].js",
                assetFileNames: "[name].[ext]",
                entryFileNames: "[name].js"
            }
        },
        cssCodeSplit: false,
    },
    plugins: [
        omt(),
    ],
    base: "./",
})
