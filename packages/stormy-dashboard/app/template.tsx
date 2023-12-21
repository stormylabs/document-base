'use client';

import { CssBaseline, CssVarsProvider, StyledEngineProvider } from '@mui/joy';
import { Box } from '@mui/system';
import React from 'react';
import Header from './components/header';
import Sidebar from './components/sidebar';

const RootTemplate = ({ children }: React.PropsWithChildren) => {
  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
          <Header />
          <Sidebar />
          <Box
            component="main"
            className="MainContent"
            sx={{
              px: { xs: 2, md: 6 },
              pt: {
                xs: 'calc(12px + var(--Header-height))',
                sm: 'calc(12px + var(--Header-height))',
                md: 3,
              },
              pb: { xs: 2, sm: 2, md: 3 },
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100dvh',
              gap: 1,
            }}
          >
            {children}
          </Box>
        </Box>
      </CssVarsProvider>
    </StyledEngineProvider>
  );
};

export default RootTemplate;
