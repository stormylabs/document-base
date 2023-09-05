import React from 'react';

import Logo from 'components/shared/icons/Logo';

const SideBar = () => {
  return (
    <div className="flex flex-col flex-shrink h-full gap-10 max-w-[280px]">
      {/* Header Logo */}
      <div className="inline-flex gap-[10px] items-center text-[16.317px] tex-[#202124]">
        <Logo />
        <h1>DocumentBase</h1>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        <div className="text-[16px] font-[600] text-[#202124]">
          Bot Information
        </div>
        <div>Bot_namev1.2</div>
        <div>Base url: chatdaddy.tech</div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-[16px] font-[600] text-[#202124]">Prompt</div>
        <div className="px-4 py-3 rounded-[12px] border-[#C0C7DA] border">
          You are customer service bot, please answer as professional as you can
          be
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-[16px] font-[600] text-[#202124]">
          Fallback Message
        </div>
        <div className="px-4 py-3 rounded-[12px] border-[#C0C7DA] border">
          You are customer service bot, please answer as professional as you can
          be
        </div>
      </div>

      <div className="flex-1" />
    </div>
  );
};

export default SideBar;
