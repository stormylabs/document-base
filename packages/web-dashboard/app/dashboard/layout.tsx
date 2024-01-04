'use client';

import { Box, Modal } from '@mui/joy';
import React from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import CircularProgress from '@mui/material/CircularProgress';

import Header from '../components/header';
import Sidebar from '../components/sidebar';

export default function DashboardLayout({ children }: React.PropsWithChildren) {
  const [user, setUser] = React.useState<any>();
  const { push } = useRouter();

  const loadCurrentUser = async () => {
    try {
      const resp = await getCurrentUser();

      console.log({ resp });
      setUser(resp);
    } catch (error) {
      push('/auth/sign-in');
    }
  };

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  if (!user) {
    return (
      <Modal
        open
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ outline: 'none' }} />
      </Modal>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Header />
      <Sidebar user={user} />
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
  );
}
