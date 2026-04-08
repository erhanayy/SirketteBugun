/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

export default nextConfig;
