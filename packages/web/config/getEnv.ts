import getConfig from 'next/config';

type Env = {
  xApiKey: string;
  apiBaseUrl: string;
  externalWebUrl: string;
};

/**
 *
 * @returns
 */
const getEnv = (): Env => {
  const { publicRuntimeConfig } = getConfig();
  return publicRuntimeConfig;
};

export default getEnv;
