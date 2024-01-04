'use client';

import * as React from 'react';
import { Amplify } from 'aws-amplify';
import '@fontsource/inter';

import awsConfig from '@/amplifyconfiguration.json';
import ThemeRegistry from './components/theme-registry';

Amplify.configure(awsConfig, { ssr: true });

// import './global.css';
export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeRegistry options={{ key: 'joy' }}>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
