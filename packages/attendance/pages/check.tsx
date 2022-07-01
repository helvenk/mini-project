import { useMemo } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dayjs from 'dayjs';
import { Cell, Image } from 'react-vant';
import { countBy } from 'lodash';
import { queryTable } from '../database';
import { Option, Table } from '../utils';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query;
  const table = queryTable(
    id && dayjs(Number(id)).startOf('M').toDate().getTime()
  );

  if (!table) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  return {
    props: { data: table },
  };
};

export default function Check({ data }: { data: Table }) {
  const { title, users } = useMemo(() => {
    const { date, records } = data;

    const title = dayjs(date).format('YYYY年M月D日打卡');
    const users = records.map(({ name, options }) => {
      const stat = countBy(options);
      return { name, stat };
    });

    return { title, users };
  }, [data]);

  return (
    <div className="page">
      <Head>
        <title>{title}</title>
      </Head>
      {users.map(({ name, stat }) => (
        <Cell
          center
          key={name}
          title={name}
          label="Deserunt dolor ea eaque eos"
          // icon={<Image width={44} height={44} src="/demo_1.jpg" round />}
          isLink
        />
      ))}

      <div className="footer-button">添加姓名</div>
    </div>
  );
}
