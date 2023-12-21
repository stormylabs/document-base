import { create } from 'zustand';
import * as dateFns from 'date-fns';
import fetcher from '../fetcher';

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
      `${process.env.NEXT_PUBLIC_API_USAGE_URL!}/${userId}`,
      { params }
    );

    set({
      botUsage: response?.data?.bot?.usages?.map((it: any) => ({
        _id: it?._id,
        botName: it?.bot?.name,
        botId: it?.bot?._id,
        cost: it?.bot?.cost,
        tokens: it?.bot?.totalTokens,
        month: it?.createdAt
          ? dateFns.format(new Date(it?.createdAt), 'MMMM')
          : '',
        createdAt: it?.createdAt,
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
