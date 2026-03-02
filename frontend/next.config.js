/** @type {import('next').NextConfig} */
let withPWA = (config) => config; // fallback if next-pwa not available
try {
    withPWA = require("next-pwa")({
        dest: "public",
        register: true,
        skipWaiting: true,
        disable: process.env.NODE_ENV === "development",
    });
} catch (_) { }

const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "profile.line-scdn.net" },
            { protocol: "http", hostname: "localhost" },
        ],
    },
};

module.exports = withPWA(nextConfig);
