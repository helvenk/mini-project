import { List, Cell } from 'react-vant';
import Link from 'next/link';
import { getCurrentTable } from '../database';

export const getServerSideProps = () => {
  const table = getCurrentTable();
  return {
    props: {
      tables: [
        { title: table.title, month: table.month },
        { title: table.title, month: table.month + 1 },
        { title: table.title, month: table.month + 2 },
      ],
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

export default function Index({
  tables,
}: {
  tables: { title: string; month: string }[];
}) {
  return (
    <div className="container">
      <h1 className="title">选择考勤表</h1>
      <div className="content">
        {tables.map(({ title, month }) => (
          <Link key={month} href={`/record?month=${month}`}>
            <a className="link">
              <span>{title}</span>
              {ICON_ARROW}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
