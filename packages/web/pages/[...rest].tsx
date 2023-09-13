import type { GetServerSideProps, NextPage } from 'next';

export const Custom404: NextPage = () => null;

// ! [NOTE] not work for output export
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: process.env.NEXT_PUBLIC_EXTERNAL_WEB_URL!,
      permanent: true,
    },
  };
};

export default Custom404;
