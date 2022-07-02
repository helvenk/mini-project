import { useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { isNil, range } from 'lodash';
import { Calendar, CalendarDayItem } from 'react-vant';
import { getTableById } from '../database';
import { Table } from '../utils';
import RTable from '../components/Table';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query;
  const table = getTableById(
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
    const { id, data: records } = data;

    const title = dayjs(id).format('YYYY年M月考勤表');

    // 是当前月可以编辑
    const editable = dayjs().isSame(id, 'M');

    // 当天索引
    const todayIndex = dayjs().date() - 1;
    // 当月开头
    const minDate = dayjs().startOf('M').toDate();
    // 当天结束
    const maxDate = dayjs().endOf('D').toDate();
    // 当月天数
    const days = dayjs().daysInMonth();
    // 已打卡的日期
    const checkedDays = range(days).map((i) =>
      Object.values(records).some((o) => !isNil(o[i]))
    );

    const formatter = (value: CalendarDayItem) => {
      const { date, type } = value;

      if (!date) {
        return value;
      }

      const index = date.getDate() - 1;
      return {
        ...value,
        // 排除当天
        type: todayIndex !== index && checkedDays[index] ? 'disabled' : type,
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
          router.push(`/check?id=${date.getTime()}`);
        }}
      />
    </div>
  );
}
