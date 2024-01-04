import type { GetServerSideProps, NextPage } from 'next';
import getEnv from 'config/getEnv';

export const Home: NextPage = () => null;

// ! [NOTE] not work for output export
export const getServerSideProps: GetServerSideProps = async () => {
  const env = getEnv();
  return {
    redirect: {
      destination: env.externalWebUrl,
      permanent: true,
    },
  };
};

export default Home;
