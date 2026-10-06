import type { NextConfig } from "next";

const projectRoot = process.cwd();
const mediaBaseUrl = process.env.MEDIA_BASE_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Preserve the incoming origin and RSC query when rewriting unprefixed Dutch routes.
  skipProxyUrlNormalize: true,
  images: mediaBaseUrl
    ? { remotePatterns: [new URL(`${mediaBaseUrl}/**`)] }
    : { localPatterns: [{ pathname: "/media/**" }] },
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
