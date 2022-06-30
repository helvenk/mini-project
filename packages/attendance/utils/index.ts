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

export type Record = {
  name: string;
  date: number;
  options: (Option | undefined)[];
};

export type Table = {
  date: number;
  records: Record[];
};
