import React from 'react';
import { useAppStore } from 'stores';

const BotInfo = () => {
  const { bot } = useAppStore();
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="text-[16px] font-[600] text-[#202124]">
          Bot Information
        </div>
        <div>{bot.name}</div>
        <div>Base url: chatdaddy.tech</div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-[16px] font-[600] text-[#202124]">Prompt</div>
        <div className="px-4 py-3 rounded-[12px] border-[#C0C7DA] border">
          {bot.prompt}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-[16px] font-[600] text-[#202124]">
          Fallback Message
        </div>
        <div className="px-4 py-3 rounded-[12px] border-[#C0C7DA] border">
          {bot.fallbackMessage}
        </div>
      </div>
    </>
  );
};

export default BotInfo;
