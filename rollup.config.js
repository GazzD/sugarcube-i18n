import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

/**
 * Rollup config
 */
export default {
  input: "src/index.js",

  output: [
    // IIFE build (Twine)
    {
      file: "dist/sugarcube-i18n.js",
      format: "iife",
      name: "SugarCubeI18n", // window.SugarCubeI18n
      sourcemap: false,
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
