import Link from 'next/link';
import { map } from 'lodash';
import dayjs from 'dayjs';
import { getTables } from '../database';

export const getServerSideProps = () => {
  const tables = getTables();
  return {
    props: {
      tables: map(tables, 'id'),
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
    <div className="page">
      <div className="blank" />
      <div className="blank" />
      <h1 className="heading">选择考勤表</h1>
      <div className="content">
        {tables.map((id) => (
          <Link key={id} href={`/record?id=${id}`}>
            <a className="link">
              <span>{dayjs(id).format('YYYY年M月考勤表')}</span>
              {ICON_ARROW}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
