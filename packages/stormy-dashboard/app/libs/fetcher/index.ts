import axios from 'axios';

const fetcher = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STORMY_CORE_BASE_URL,
  headers: {
    'x-api-key': '123qwe',
  },
});

export default fetcher;
