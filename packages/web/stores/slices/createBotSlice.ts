import { getBotInfo } from 'services/bot';
import { StateCreator } from 'zustand';

export interface Bot {
  _id?: string;
  name?: string;
  fallbackMessage?: string;
  prompt?: string;
}

export interface CreateBotSlice {
  bot: Bot;
  getBotInfo: () => void;
}

export const createBotSlice: StateCreator<CreateBotSlice> = (set) => ({
  bot: {},
  getBotInfo: async () => {
    const response = await getBotInfo(process.env.NEXT_PUBLIC_BOT_ID || '');

    set({ bot: response?.data?.bot });
  },
});
