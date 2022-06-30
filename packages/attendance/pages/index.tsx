import Link from 'next/link';
import { map } from 'lodash';
import dayjs from 'dayjs';
import { getTables } from '../database';

const MAX_TABLE_SIZE = 6;

export const getServerSideProps = () => {
  const tables = getTables(MAX_TABLE_SIZE);
  return {
    props: {
      tables: map(tables, 'date'),
    },
  };
};

const ICON_ARROW = (
  <svg
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export default function Index({ tables }: { tables: number[] }) {
  return (
    <div className="container">
      <h1 className="title">选择考勤表</h1>
      <div className="content">
        {tables.map((date) => (
          <Link key={date} href={`/record?id=${date}`}>
            <a className="link">
              <span>{dayjs(date).format('YYYY年M月考勤表')}</span>
              {ICON_ARROW}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
