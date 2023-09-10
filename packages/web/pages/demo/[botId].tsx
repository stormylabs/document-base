import Chat from 'components/useCases/chat';
import BotInfoDrawer from 'components/useCases/chat/BotInfoDrawer';
import BotInfoSidebar from 'components/useCases/chat/BotInfoSidebar';
import { NextPageContext } from 'next';
import { useEffect } from 'react';
import { useAppStore } from 'stores';

type BotProps = {
  botId: string;
};

export function Bot(props: BotProps) {
  const { getBotInfo } = useAppStore();
  useEffect(() => {
    if (props?.botId) {
      getBotInfo(props?.botId);
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
  const { botId } = ctx?.query || {};
  return {
    props: {
      botId,
    },
  };
}

export default Bot;
