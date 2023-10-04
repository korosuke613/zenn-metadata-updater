module.exports = {
  extends: [
    "@cybozu/eslint-config/presets/node",
    "@cybozu/eslint-config/presets/typescript",
    "prettier"
  ],
  plugins: ["jest"],
  env: {
    node: true,
    "jest/globals": true,
  },
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    project: "./tsconfig.eslint.json",
  },
  rules: {
    "node/no-unsupported-features/es-syntax": "off",
  },
};
