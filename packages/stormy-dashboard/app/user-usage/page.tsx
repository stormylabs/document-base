'use client';

import React, { useEffect } from 'react';
import _map from 'lodash/map';
import NextLink from 'next/link';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Stack,
  Table,
  Sheet,
  Avatar,
} from '@mui/joy';
import useUser from '../libs/stores/user';

function UserPage() {
  const { fetch, loading, listUsers } = useUser();

  useEffect(() => {
    fetch();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100dvh',
          gap: 1,
          overflow: 'auto',
        }}
      >
        <Typography level="title-lg">Loading....</Typography>
      </Box>
    );
  }

  const getInitialName = (email: string) =>
    email.split('@')[0].substring(0, 1).toUpperCase();

  const renderListUSer = () => {
    if (listUsers.length > 0)
      return (
        <Sheet
          className="OrderTableContainer"
          variant="outlined"
          sx={{
            display: { xs: 'none', sm: 'initial' },
            width: '100%',
            borderRadius: 'sm',
            flexShrink: 1,
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          <Table
            aria-labelledby="tableTitle"
            stickyHeader
            hoverRow
            sx={{
              '--TableCell-headBackground':
                'var(--joy-palette-background-level1)',
              '--Table-headerUnderlineThickness': '1px',
              '--TableRow-hoverBackground':
                'var(--joy-palette-background-level1)',
              '--TableCell-paddingY': '4px',
              '--TableCell-paddingX': '8px',
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 140, padding: '12px 6px' }}>UserId</th>
                <th style={{ width: 140, padding: '12px 6px' }}>Email</th>
                <th style={{ width: 140, padding: '12px 6px' }}> </th>
              </tr>
            </thead>
            <tbody>
              {_map(listUsers, (row) => (
                <tr key={row._id}>
                  <td>
                    <Typography level="body-xs">{row._id}</Typography>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar size="sm">{getInitialName(row.email)}</Avatar>
                      <div>
                        <Typography level="body-xs">
                          {row?.email.split('@')[0]}
                        </Typography>
                        <Typography level="body-xs">{row.email}</Typography>
                      </div>
                    </Box>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <NextLink href={`/user-usage/${row?._id}`}>
                        <Link level="body-xs" component="button">
                          Detail
                        </Link>
                      </NextLink>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      );

    return 'No data to show, please apply filter!';
  };

  return (
    <Box
      sx={{
        pt: { xs: 'calc(12px + var(--Header-height))', md: 3 },
        pb: { xs: 2, sm: 2, md: 3 },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100dvh',
        gap: 1,
        overflow: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumbs
          size="sm"
          aria-label="breadcrumbs"
          separator={<ChevronRightRoundedIcon fontSize="small" />}
          sx={{ pl: 0 }}
        >
          <Link underline="none" color="neutral" href="/" aria-label="Home">
            <HomeRoundedIcon />
          </Link>
          <Typography color="primary" fontWeight={500} fontSize={12}>
            User Usage
          </Typography>
        </Breadcrumbs>
      </Box>

      <Stack>{renderListUSer()}</Stack>
    </Box>
  );
}

export default UserPage;
