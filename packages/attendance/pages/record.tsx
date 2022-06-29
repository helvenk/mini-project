import { GetServerSideProps } from 'next';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = ({ query }) => {
  const { month } = query;
  return {
    props: {
      title: month,
    },
  };
};

export default function Record({ title }: { title: string }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
    </div>
  );
}
