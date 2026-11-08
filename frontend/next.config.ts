import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is fully session-driven (cookies on every page), so there is
  // nothing meaningful to prerender.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
