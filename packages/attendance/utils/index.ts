import axios from 'axios';

export enum Option {
  // 出勤
  WORK,
  // 休假
  VACATION,
  // 请假
  LEAVE,
  // 离职
  ABSENT,
}

export type Table = {
  id: number;
  data: Record<string, Option[]>;
};

export type TableData = Table['data'];

export const OptionMap = {
  [Option.WORK]: '√',
  [Option.VACATION]: '休',
  [Option.LEAVE]: '假',
  [Option.ABSENT]: '离',
};

export const OptionMapDesc = {
  [Option.WORK]: '出勤',
  [Option.VACATION]: '休假',
  // [Option.LEAVE]: '请假',
  [Option.ABSENT]: '离职',
};

export async function syncTable(table: Table) {
  const res = await axios.request({
    url: '/api/table',
    method: 'POST',
    data: { data: table },
  });

  return res.data as Table | null;
}
