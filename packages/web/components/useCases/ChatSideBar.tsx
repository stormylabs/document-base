import React from 'react';

import Navigation from '../shared/elements/Navigation';
import Header from 'components/shared/elements/Header';

const SideBar = () => {
  return (
    <div className="hidden md:!flex flex-col flex-shrink h-full gap-10 max-w-[280px]">
      <Header />
      <Navigation />
      <div className="flex-1" />
    </div>
  );
};

export default SideBar;
