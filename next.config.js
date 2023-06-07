// next.config.js
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude Node.js-specific modules from client-side compilation
    if (!isServer) {
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^fs$/ }));
    }

    return config;
  },
};

module.exports = nextConfig;