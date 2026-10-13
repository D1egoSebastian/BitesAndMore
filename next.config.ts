import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // The parent folder (docs repo) has its own package-lock.json; pin the root to this app.
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      // Product and service photos are uploaded through the API to Cloudinary.
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      // Placeholder hero photos (lib/hero-slides.ts, ADR-019) until the business's own photos exist.
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  experimental: {
    serverActions: {
      // Image uploads go through a Server Action. Large photos are downscaled in the browser
      // first; 4 MB also stays under the request limit of common serverless hosts.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
