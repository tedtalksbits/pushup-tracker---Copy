/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'media.tenor.com',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
