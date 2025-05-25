/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /**
     * Specifies patterns for remote images that are allowed to be optimized by Next.js.
     * This is useful for loading images from external sources securely.
     */
    remotePatterns: [
      {
        protocol: "https", // Only allow images served over HTTPS for security.
        hostname: "avatars.githubusercontent.com", // Allow images from GitHub's avatar service.
        port: "", // No specific port is required; standard HTTPS port (443) is assumed.
        pathname: "/u/**", // Match any path starting with "/u/", allowing dynamic user avatars.
      },
    ],
  },
};

export default nextConfig;
