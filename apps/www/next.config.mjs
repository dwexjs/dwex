import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: '/docs/getting-started/introduction',
      },
    ]
  },
};

export default withMDX(config);
