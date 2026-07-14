/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    reactStrictMode: true,
    productionBrowserSourceMaps: false,
    images: { unoptimized: true },
};

export default nextConfig;
