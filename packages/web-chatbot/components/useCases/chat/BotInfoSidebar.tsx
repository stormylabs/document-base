import React from 'react';

import BotInfo from './BotInfo';
import Header from 'components/shared/elements/Header';

const Sidebar = () => {
  return (
    <div className="hidden md:!flex flex-col flex-shrink h-full gap-10 max-w-[280px]">
      <Header />
      <BotInfo />
      <div className="flex-1" />
    </div>
  );
};

export default Sidebar;
