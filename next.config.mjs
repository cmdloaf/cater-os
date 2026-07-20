import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
  // Pin the project root — an unrelated package-lock.json in the home
  // directory otherwise gets picked up by Next's workspace-root inference,
  // which serves/traces static assets from the wrong directory.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
