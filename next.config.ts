import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sapl.pousoalto.mg.leg.br",
        pathname: "/media/sapl/public/parlamentar/**",
      },
    ],
  },
};

export default nextConfig;
