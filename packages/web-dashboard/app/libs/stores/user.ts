import { create } from 'zustand';
import fetcher from '../fetcher';

export interface CreateUserSlice {
  loading: boolean;
  listUsers: any[];
  fetch: () => void;
  error?: string;
}

const useUser = create<CreateUserSlice>((set, get) => ({
  listUsers: [],
  fetch: async () => {
    set({
      loading: true,
    });
    const response = await fetcher(
      `/api/v1/${process.env.NEXT_PUBLIC_SECRET_PREFIX_ENPOINT!}/usage/users`
    );

    set({
      listUsers: response.data.users,
      loading: false,
    });
  },
  loading: false,
  error: '',
}));

export default useUser;
