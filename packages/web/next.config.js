//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // ... rest of the configuration.
  output: 'standalone',
  // outputFileTracingRoot: path.join(__dirname, '../../'),
  serverRuntimeConfig: {
    // Will only be available on the server side
    // TODO: request from server to hide api key
    // xApiKey: process.env.X_API_KEY,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    xApiKey: process.env.X_API_KEY,
    apiBaseUrl: process.env.API_BASE_URL,
    externalWebUrl: process.env.EXTERNAL_WEB_URL,
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
