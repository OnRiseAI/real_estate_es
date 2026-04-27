/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/costa-del-sol",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
