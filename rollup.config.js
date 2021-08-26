import { nodeResolve } from "@rollup/plugin-node-resolve";
import command from "rollup-plugin-command";

export default {
    input: "./src/index.js",
    output: {
        file: "./www/bundle.js",
        format: "iife"
    },
    plugins: [
        command("lezer-generator src/rich.grammar -o src/rich", { wait: true }),
        nodeResolve()
    ]
};