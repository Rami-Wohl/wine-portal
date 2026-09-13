import type { NextConfig } from "next";

const projectRoot = process.cwd();
const mediaBaseUrl = process.env.MEDIA_BASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: mediaBaseUrl
    ? { remotePatterns: [new URL(`${mediaBaseUrl}/**`)] }
    : { localPatterns: [{ pathname: "/media/**" }] },
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
