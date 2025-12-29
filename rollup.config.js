import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

/**
 * Rollup config
 */
export default {
  input: "src/index.js",

  output: [
    // IIFE build (Twine / SugarCube)
    {
      file: "dist/sugarcube-i18n.js",
      format: "iife",
      name: "SCI18N", // window.SCI18N
      sourcemap: true,
    },

    // ESM build (npm)
    {
      file: "dist/sugarcube-i18n.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],

  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    terser(),
  ],
};
