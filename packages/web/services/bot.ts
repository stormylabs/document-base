import httpClient from 'utils/httpClient';

export const getBotInfo = async (botId: string) =>
  await httpClient.get(`/bot/${botId}`);

export const sendMessage = async (botId: string) => {
  //
};
