/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    appVersion: process.env.npm_package_version || "",
  },
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
  generateEtags: true,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[path][name].[hash][ext]",
      },
    });

    return config;
  },
  async rewrites() {
		return [
			{
				source: '/api/charts/:path*',
				destination: `https://saveload.tradingview.com/:path*`,
			},
		]
	},
};

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA(nextConfig);
