import { useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { isNil, range } from 'lodash';
import { Calendar, CalendarDayItem } from 'react-vant';
import { queryTable } from '../database';
import { Table } from '../utils';
import RTable from '../components/Table';

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

export default function Record({ data }: { data: Table }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const { editable, title, minDate, maxDate, formatter } = useMemo(() => {
    const { date, records } = data;

    const editable = true;
    dayjs().isSame(date, 'M');

    const title = dayjs(date).format('YYYY年M月考勤表');

    const minDate = dayjs(date).startOf('M').toDate();
    const maxDate = dayjs(date).endOf('D').toDate();

    const days = dayjs(date).daysInMonth();
    const checkedDays = range(days).map((i) =>
      records.some(({ options }) => !isNil(options[i]))
    );

    const formatter = ({ date, type, ...rest }: CalendarDayItem) => {
      return {
        date,
        type: checkedDays[dayjs(date).date() - 1] ? 'disabled' : type,
        ...rest,
      };
    };

    return {
      editable,
      title,
      minDate,
      maxDate,
      formatter,
    };
  }, [data]);

  return (
    <div className="page">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="blank" />
      <h1 className="title">{title}</h1>
      <div className="content">
        <RTable data={data} />
      </div>
      {editable && (
        <div className="footer-button" onClick={() => setVisible(true)}>
          立即打卡
        </div>
      )}
      <Calendar
        title="选择打卡日期"
        showConfirm={false}
        visible={visible}
        color="#44bb97"
        minDate={minDate}
        maxDate={maxDate}
        formatter={formatter}
        onClose={() => setVisible(false)}
        onConfirm={(date: Date) => {
          setVisible(false);
          router.push(
            `/check?id=${dayjs(date).startOf('D').toDate().getTime()}`
          );
        }}
      />
    </div>
  );
}
