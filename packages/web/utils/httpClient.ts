import axios from 'axios';

import getEnv from 'config/getEnv';

const env = getEnv();

const instance = axios.create({
  baseURL: env.apiBaseUrl,
});

instance.defaults.headers['x-api-key'] = env.xApiKey;

export default instance;
