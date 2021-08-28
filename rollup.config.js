import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
    input: "./src/index.js",
    output: {
        file: "./www/bundle.js",
        format: "iife"
    },
    plugins: [
        nodeResolve()
    ]
};