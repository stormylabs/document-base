import { SendMessage } from 'stores/slices/createBotSlice';
import httpClient from 'utils/httpClient';

export const getBotInfo = async (botId: string) =>
  httpClient.get(`/bot/${botId}`);

export const sendMessage = async (botId: string, data: SendMessage) =>
  httpClient.post(`/bot/message/${botId}`, data);
