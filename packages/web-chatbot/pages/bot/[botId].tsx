import Chat from 'components/useCases/chat';
import BotInfoDrawer from 'components/useCases/chat/BotInfoDrawer';
import BotInfoSidebar from 'components/useCases/chat/BotInfoSidebar';
import { NextPageContext } from 'next';
import { useEffect } from 'react';
import { getBotInfo } from 'services/bot';
import { useAppStore } from 'stores';
import { Bot } from 'stores/slices/createBotSlice';
import getEnv from 'config/getEnv';

type BotProps = {
  botId: string;
  bot: Bot;
};

export function Bot(props: BotProps) {
  const { setBotInfo } = useAppStore();

  useEffect(() => {
    if (props?.bot?._id) {
      setBotInfo(props.bot || {});
    }
  }, []);

  return (
    <div className="flex flex-col md:!flex-row h-full md:!p-10 md:gap-10">
      <BotInfoSidebar />
      <BotInfoDrawer />
      <Chat />
    </div>
  );
}

export async function getServerSideProps(ctx: NextPageContext) {
  const { botId } = ctx?.query || { botId: '' };

  const env = getEnv();

  try {
    const response = await getBotInfo(botId as string);

    return {
      props: {
        botId,
        bot: response.data.bot,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: env.externalWebUrl,
        permanent: true,
      },
    };
  }
}

export default Bot;
