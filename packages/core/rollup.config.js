import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const rollupBuilds = [
  {
    input: './src/index.js',
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external: id => !/^(\.|\/)/.test(id),
    plugins: [resolve(), babel({ babelHelpers: 'runtime' })],
  },
];

module.exports = rollupBuilds;
