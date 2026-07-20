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
  // Pin the workspace root explicitly. Next's own root inference walks up
  // looking for lockfiles and finds an unrelated package-lock.json in the
  // home directory, which makes it serve/trace assets from the wrong place.
  // This must point at the monorepo root, not apps/web, so that dependencies
  // hoisted into the root node_modules are traced correctly.
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
