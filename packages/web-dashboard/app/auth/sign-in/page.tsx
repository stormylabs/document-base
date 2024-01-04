'use client';

import * as React from 'react';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Stack from '@mui/joy/Stack';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signIn, confirmSignIn } from 'aws-amplify/auth';
import { Alert, IconButton } from '@mui/joy';
import WarningIcon from '@mui/icons-material/WarningOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';

interface iLogin {
  username: string;
  password: string;
}

const validationSchema = Yup.object({
  username: Yup.string().required(),
  password: Yup.string().required(),
});

function SignInPage() {
  const [error, setError] = React.useState('');
  const { push } = useRouter();

  async function handleSignIn({ username, password }: iLogin) {
    try {
      const resp = await signIn({
        username,
        password,
      });

      if (
        resp?.nextStep?.signInStep ===
        'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
      ) {
        await confirmSignIn({
          challengeResponse: '!2345Qwe',
        });
      }

      push('/dashboard');
      return resp;
    } catch (error: any) {
      console.log('>>> signIn Error :', error);
      setError(error?.message);
    }
  }

  const formik = useFormik<iLogin>({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) =>
      handleSignIn({
        username: values.username,
        password: values.password,
      }),
  });

  return (
    <Stack gap={4} sx={{ mt: 2 }}>
      {error && (
        <Alert
          startDecorator={<WarningIcon />}
          variant="outlined"
          color="danger"
          endDecorator={
            <React.Fragment>
              <IconButton
                variant="soft"
                size="sm"
                color="danger"
                onClick={() => setError('')}
              >
                <CloseIcon />
              </IconButton>
            </React.Fragment>
          }
        >
          {error}
        </Alert>
      )}
      <form onSubmit={formik.handleSubmit}>
        <FormControl required>
          <FormLabel>Email</FormLabel>
          <Input
            type="username"
            name="username"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
        </FormControl>
        <FormControl required>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            name="password"
            onChange={formik.handleChange}
            value={formik.values.password}
          />
        </FormControl>

        <Stack gap={4} sx={{ mt: 2 }}>
          <Button type="submit" fullWidth>
            Sign in
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}

export default SignInPage;
