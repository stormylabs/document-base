import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async () => {
  return {
    redirect: {
      destination: process.env.NEXT_PUBLIC_EXTERNAL_WEB_URL!,
      permanent: true,
    },
  };
};

export default getStaticProps;
