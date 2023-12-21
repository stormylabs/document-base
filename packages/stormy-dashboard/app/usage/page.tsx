'use client';

import React, { useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import * as Yup from 'yup';
import useUserUsage, { iUsageParams } from '../libs/stores/usage';

import {
  Box,
  Breadcrumbs,
  FormControl,
  FormLabel,
  Link,
  Sheet,
  Typography,
  Input,
  Button,
  Stack,
  FormHelperText,
} from '@mui/joy';
import { useFormik } from 'formik';

const validationSchema = Yup.object({
  userId: Yup.string().required(),
  from: Yup.string().required(),
  to: Yup.string().required(),
});

function UsagePage() {
  const { fetch, botUsage, loading } = useUserUsage();

  const formik = useFormik<iUsageParams>({
    initialValues: {
      userId: '',
      from: '',
      to: '',
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

  console.log({ botUsage, loading });

  const renderBarCharts = () => {
    if (botUsage.length > 0)
      return (
        <BarChart
          width={750}
          height={350}
          data={botUsage}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis fontSize="12px" dataKey="cost" />
          <Tooltip />
          <Legend />
          <Bar dataKey="cost" label="Cost" fill="#36cd4f" />
          <Bar dataKey="tokens" label="Tokens" fill="#ee7213" />
        </BarChart>
      );

    return 'No data to show, please apply filter!';
  };

  return (
    <div>
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
              justifyContent: 'center',
              alignItems: 'center',
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
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: 'sm',
          padding: '1rem',
        }}
      >
        <Box>{renderBarCharts()}</Box>
      </Sheet>
    </div>
  );
}

export default UsagePage;
