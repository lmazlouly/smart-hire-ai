import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: process.env.ORVAL_INPUT ?? "http://localhost:8080/v3/api-docs",
    },
    output: {
      mode: "single",
      target: "./lib/api/generated.ts",
      schemas: "./lib/api/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        query: {
          useInfinite: false,
        },
      },
    },
  },
});
