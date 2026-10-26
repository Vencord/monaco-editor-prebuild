import { defineConfig } from "vite";
import omt from "./scripts/vite-plugin-omt";
export default defineConfig({
    input: "src/index.ts",
    build: {
        rolldownOptions: {
            output: {
                chunkFileNames: "[hash:8].js",
                assetFileNames: "[hash:8].[ext]",
                entryFileNames: "[name].js"
            }
        },
    },
    base: "/vendor/monaco",
    plugins: [
        omt(),
    ],
})