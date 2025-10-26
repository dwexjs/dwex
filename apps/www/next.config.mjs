import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  rewrites: [
    {
      source: "/docs",
      destination: "/getting-started/introduction",
    }
  ]
};

export default withMDX(config);
