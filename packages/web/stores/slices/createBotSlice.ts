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
  getBotInfo: (botId: string) => void;
}

export const createBotSlice: StateCreator<CreateBotSlice> = (set) => ({
  bot: {},
  getBotInfo: async (botId: string) => {
    const response = await getBotInfo(botId);

    set({ bot: response?.data?.bot });
  },
});
