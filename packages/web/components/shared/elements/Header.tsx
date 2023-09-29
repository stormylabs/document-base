import Link from 'next/link';
import React from 'react';
import getEnv from 'config/getEnv';
import LogoDocumentBase from '../icons/LogoSvg';

const Header = () => {
  const env = getEnv();
  return (
    <Link href={env?.externalWebUrl || '/'}>
      <div className="inline-flex gap-[10px] items-center text-[16.317px] tex-[#202124]">
        <LogoDocumentBase />
        <h1>DocumentBase</h1>
      </div>
    </Link>
  );
};

export default Header;
