'use client';

import React from 'react';
import {
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import * as Yup from 'yup';
import useUserUsage, { iUsageParams } from '../../../libs/stores/usage';

import {
  Box,
  Breadcrumbs,
  FormControl,
  FormLabel,
  Link,
  Typography,
  Input,
  Button,
  Stack,
  FormHelperText,
  Card,
  CardContent,
} from '@mui/joy';
import { useFormik } from 'formik';
import format from 'date-fns/format';
import { lastDayOfMonth } from 'date-fns';
import { useParams } from 'next/navigation';

const validationSchema = Yup.object({
  userId: Yup.string().required(),
  from: Yup.string().required(),
  to: Yup.string().required(),
});

const today = new Date();
const firstDateOfMonth = format(today, 'yyyy-MM-01');
const lastDateOfMonth = format(lastDayOfMonth(today), 'yyyy-MM-dd');

function UsagePage() {
  const { fetch, botUsage, botCost, resourceCost, loading } = useUserUsage();

  const params = useParams();

  const formik = useFormik<iUsageParams>({
    initialValues: {
      userId: params?.userId,
      from: firstDateOfMonth,
      to: lastDateOfMonth,
    },
    validationSchema,
    onSubmit: (values) => {
      fetch({
        ...values,
        from: new Date(values.from).toISOString(),
        to: new Date(values.to).toISOString(),
      });
    },
  });

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

  const renderUsageReport = () => {
    if (botUsage.length > 0)
      return (
        <Stack
          sx={{
            display: 'flex',
            gap: '2rem',
          }}
        >
          <Card
            color="neutral"
            orientation="vertical"
            size="sm"
            variant="outlined"
          >
            <CardContent orientation="horizontal">
              <div>
                <Typography level="body-xs">Total Resource Cost:</Typography>
                <Typography fontSize="lg" fontWeight="lg">
                  ${resourceCost}
                </Typography>
              </div>
              <div>
                <Typography level="body-xs">Total Bot Cost:</Typography>
                <Typography fontSize="lg" fontWeight="lg">
                  ${botCost}
                </Typography>
              </div>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Typography level="body-lg" fontWeight="bold">
              Bot Usage
            </Typography>
            <Card>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    width={500}
                    height={300}
                    data={botUsage}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="33" />
                    <XAxis dataKey="botId" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tokens"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="cost" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Typography level="body-lg" fontWeight="bold">
              Resource Usage
            </Typography>
            <Card>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    width={500}
                    height={300}
                    data={botUsage}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="33" />
                    <XAxis dataKey="botId" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tokens"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="cost" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Box>
        </Stack>
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
          <Link
            underline="none"
            color="neutral"
            href="#some-link"
            aria-label="Home"
          >
            <HomeRoundedIcon />
          </Link>
          <Typography color="primary" fontWeight={500} fontSize={12}>
            Usages
          </Typography>
        </Breadcrumbs>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            borderRadius: 'sm',
            py: 2,
            display: { xs: 'none', sm: 'flex' },
            flexWrap: 'wrap',
            gap: 1.5,
            '& > *': {
              minWidth: { xs: '120px', md: '160px' },
            },
          }}
        >
          <FormControl
            sx={{ flex: 1 }}
            size="sm"
            error={!!formik.errors.userId && !!formik.touched.from}
          >
            <FormLabel>User ID</FormLabel>
            <Input
              name="userId"
              size="sm"
              placeholder="User Id"
              onChange={formik.handleChange}
              value={formik.values.userId}
              disabled
            />
            {formik.errors.userId && formik.touched.userId && (
              <FormHelperText>{formik.errors.userId}</FormHelperText>
            )}
          </FormControl>
          <FormControl
            sx={{ flex: 1 }}
            size="sm"
            error={!!formik.errors.from && !!formik.touched.to}
          >
            <FormLabel>Start Date</FormLabel>
            <Input
              size="sm"
              name="from"
              type="date"
              placeholder="End Date"
              onChange={formik.handleChange}
              value={formik.values.from}
            />
            {formik.errors.from && formik.touched.from && (
              <FormHelperText>{formik.errors.from}</FormHelperText>
            )}
          </FormControl>
          <FormControl
            sx={{ flex: 1 }}
            size="sm"
            error={!!formik.errors.to && !!formik.touched.to}
          >
            <FormLabel>End Date</FormLabel>
            <Input
              size="sm"
              name="to"
              type="date"
              placeholder="End Date"
              onChange={formik.handleChange}
              value={formik.values.to}
            />
            {formik.errors.to && formik.touched.to && (
              <FormHelperText>{formik.errors.to}</FormHelperText>
            )}
          </FormControl>
          <Stack
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'start',
            }}
          >
            <Button
              color="primary"
              size="sm"
              type="submit"
              endDecorator={<FilterAltIcon />}
            >
              Filter
            </Button>
          </Stack>
        </Box>
      </form>

      <Stack>{renderUsageReport()}</Stack>
    </Box>
  );
}

export default UsagePage;
