/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // ✅ ensures API routes run as serverless functions
  images: { unoptimized: true }, // optional for static exports
};

export default nextConfig;
