import Chat from 'components/useCases/chat';
import BotInfoDrawer from 'components/useCases/chat/BotInfoDrawer';
import BotInfoSidebar from 'components/useCases/chat/BotInfoSidebar';
import { useEffect } from 'react';
import { useAppStore } from 'stores';

export function Bot() {
  const { getBotInfo } = useAppStore();

  useEffect(() => {
    getBotInfo();
  }, []);

  return (
    <div className="flex flex-col md:!flex-row h-full md:!p-10 md:gap-10">
      <BotInfoSidebar />
      <BotInfoDrawer />
      <Chat />
    </div>
  );
}

export default Bot;
