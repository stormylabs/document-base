import axios from 'axios';

const fetcher = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STORMY_CORE_API_BASE_URL,
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY,
  },
});

export default fetcher;
