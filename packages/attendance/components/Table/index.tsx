import { useMemo } from 'react';
import dayjs from 'dayjs';
import { filter, range, sumBy, countBy } from 'lodash';
import { Table, Option } from '../../utils';
import styles from './index.module.css';

export default function RTable({
  data,
  showTitle = false,
}: {
  data: Table;
  showTitle?: boolean;
}) {
  const { columns, rows, groups, minWidth } = useMemo(() => {
    const { date, records } = data;
    const days = dayjs(date).daysInMonth();

    const optionMap = {
      [Option.WORK]: '√',
      [Option.VACATION]: '休',
      [Option.LEAVE]: '休',
      [Option.ABSENT]: '离',
    };

    const columns = [
      { title: '姓名', width: '6em' },
      { title: '上班天数', width: '3em' },
      { title: '休假天数', width: '3em' },
      { title: '请假天数', width: '3em' },
      ...range(days).map((n) => ({ title: n + 1, width: '2rem' })),
      { title: '奖', width: '3em' },
      { title: '罚', width: '3em' },
      { title: '备注', width: '6em' },
    ];

    const groups = filter(columns, 'width');

    const minWidth = sumBy(groups, (o) => Number.parseInt(o.width, 10));

    const rows = records.map(({ name, options }) => {
      const stat = countBy(options);

      return [
        name,
        stat[Option.WORK],
        stat[Option.VACATION],
        stat[Option.LEAVE],
        ...range(days).map((i) => optionMap[options[i]]),
      ];
    });

    return { columns, rows, groups, minWidth };
  }, [data]);

  return (
    <div className={styles.container}>
      <table
        border={1}
        className={styles.table}
        style={{ width: `${minWidth}em` }}
      >
        <colgroup>
          {groups.map(({ width }, i) => (
            <col key={i} style={{ width }}></col>
          ))}
        </colgroup>
        <thead>
          {showTitle && (
            <tr>
              <th className={styles.title} colSpan={columns.length}>
                {dayjs(data.date).format('YYYY年M月考勤表')}
              </th>
            </tr>
          )}
          <tr>
            {columns.map(({ title }) => (
              <td key={title}>{title}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cols, i) => (
            <tr key={i}>
              {columns.map(({ title }, j) => (
                <td key={title}>{cols[j]}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot></tfoot>
      </table>
    </div>
  );
}
