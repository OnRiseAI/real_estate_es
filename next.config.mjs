/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/costa-del-sol",
        destination: "/",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "https://app.voiceaireceptionists.com/dashboard",
        permanent: false,
      },
      {
        source: "/dashboard/:path*",
        destination: "https://app.voiceaireceptionists.com/dashboard/:path*",
        permanent: false,
      },
      {
        source: "/calls",
        destination: "https://app.voiceaireceptionists.com/dashboard",
        permanent: false,
      },
      {
        source: "/calls/:path*",
        destination: "https://app.voiceaireceptionists.com/calls/:path*",
        permanent: false,
      },
      {
        source: "/sign-in",
        destination: "https://app.voiceaireceptionists.com/sign-in",
        permanent: false,
      },
      {
        source: "/sign-in/:path*",
        destination: "https://app.voiceaireceptionists.com/sign-in/:path*",
        permanent: false,
      },
      {
        source: "/sign-up",
        destination: "https://app.voiceaireceptionists.com/sign-up",
        permanent: false,
      },
      {
        source: "/sign-up/:path*",
        destination: "https://app.voiceaireceptionists.com/sign-up/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
