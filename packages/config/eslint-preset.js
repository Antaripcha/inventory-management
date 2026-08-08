module.exports = {
  extends: ["eslint:recommended"],
  env: { es2022: true, node: true, browser: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "no-unused-vars": "warn",
  },
};
