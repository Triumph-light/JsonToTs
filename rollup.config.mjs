import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
export default {
    input: './src/extension.ts',
    // external: id => ['vscode'].includes(id),
    plugins: [
        nodeResolve(),
        // commonjs(),
        typescript({
            exclude: 'node_modules/**',
        }),
        terser(),
    ],

    output: [{
        format: 'cjs',
        dir: `./out`,
        sourcemap: false,
    }]
};