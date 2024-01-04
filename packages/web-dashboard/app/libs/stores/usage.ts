import { create } from 'zustand';
import fetcher from '../fetcher';
import { shortenObjectId } from '../../../utils';

export interface iUsageParams {
  userId: string;
  from: string;
  to: string;
}

export interface CreateUsageSlice {
  resourceUsage: any[];
  resourceCost?: number | string;
  botUsage: any[];
  botCost?: string | number;
  fetch: (params: iUsageParams) => void;
  loading: boolean;
  error?: string;
}

const useUserUsage = create<CreateUsageSlice>((set, get) => ({
  botUsage: [],
  resourceUsage: [],
  fetch: async ({ userId, ...params }: iUsageParams) => {
    set({
      loading: true,
    });
    const response = await fetcher(
      `/api/v1/${process.env
        .NEXT_PUBLIC_SECRET_PREFIX_ENPOINT!}/usage/${userId}`,
      { params }
    );
    set({
      botUsage: response?.data?.bot?.usages.map((usage: any) => ({
        ...usage,
        bot: {
          ...usage?.bot,
          shortenId: shortenObjectId(usage?.bot?._id),
        },
      })),
      botCost: response?.data?.bot?.costs,
      resourceUsage: response?.data?.resource?.usages,
      resourceCost: response?.data?.resource?.costs,
      loading: false,
    });
  },
  loading: false,
  error: '',
}));

export default useUserUsage;
