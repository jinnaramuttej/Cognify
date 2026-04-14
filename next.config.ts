import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      // Legacy quick-link HTML targets from older UI builds
      { source: '/external/notes.html', destination: '/notes', permanent: false },
      { source: '/external/videos.html', destination: '/library', permanent: false },
      { source: '/external/quizzes.html', destination: '/tests', permanent: false },
      { source: '/external/formulas.html', destination: '/library', permanent: false },
      { source: '/external/profile.html', destination: '/settings', permanent: false },
      // Legacy path aliases still linked by old quick links
      { source: '/videos', destination: '/library', permanent: false },
      { source: '/quizzes', destination: '/tests', permanent: false },
      { source: '/formulas', destination: '/library', permanent: false },
      { source: '/profile', destination: '/settings', permanent: false },
    ];
  },
};

export default nextConfig;
