import { getBotInfo, sendMessage } from 'services/bot';
import { StateCreator } from 'zustand';

export interface Bot {
  _id?: string;
  name?: string;
  fallbackMessage?: string;
  prompt?: string;
}

export interface SendMessage {
  message: string;
  conversationHistory: string[];
}

export interface CreateBotSlice {
  bot: Bot;
  getBotInfo: (botId: string) => void;
  setBotInfo: (bot: Bot) => void;
  sending: boolean;
  message: string;
  source: string[];
  conversationHistory: string[];
  sendMessage: (botId: string, data: SendMessage) => void;
  resetConversationHistory: () => void;
  error: '';
}

export const createBotSlice: StateCreator<CreateBotSlice> = (set) => ({
  bot: {},
  getBotInfo: async (botId: string) => {
    try {
      const response = await getBotInfo(botId);

      set({ bot: response?.data?.bot });
    } catch (error: any) {
      set({ error: error?.response?.data.message });
    }
  },
  setBotInfo: (bot: Bot) => {
    set({ bot });
  },

  sending: false,
  message: '',
  source: [],
  conversationHistory: [],
  sendMessage: async (botId: string, data: SendMessage) => {
    set((state) => ({
      ...state,
      sending: true,
      conversationHistory: [
        ...state.conversationHistory,
        `user: ${data.message}`,
      ],
    }));

    const response = await sendMessage(botId, data);

    set((state) => ({
      ...state,
      sending: false,
      conversationHistory: [
        ...state.conversationHistory,
        `assistant: ${response.data.message}`,
      ],
      source: [...state.source, ...response.data.sources],
    }));
  },
  resetConversationHistory: () => {
    set({ conversationHistory: [] });
  },
  error: '',
});
