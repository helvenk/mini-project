import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { queryTable } from '../database';
import { Table } from '../utils';
import RTable from '../components/Table';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query;
  const table = queryTable(id as string);

  return {
    props: { data: table },
  };
};

export default function Record({ data }: { data?: Table }) {
  const router = useRouter();

  const editable = dayjs().isSame(data.date, 'M');

  if (!data) {
    setTimeout(() => {
      router.back();
    }, 0);
    return null;
  }

  return (
    <div>
      <Head>
        <title>{dayjs(data.date).format('YYYY年M月考勤表')}</title>
      </Head>
      <RTable data={data} />
    </div>
  );
}
