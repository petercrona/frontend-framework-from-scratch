import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import strip from '@rollup/plugin-strip';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'scripts/',
    format: 'esm'
  },
  plugins: [
    typescript(),
    strip({
      include: '**/*.ts',
      functions: ['test', 'describe']
    }),
    terser({
      compress: {
        passes: 3
      }
    }),
  ],
};
