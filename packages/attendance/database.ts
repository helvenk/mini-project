import { join, dirname } from 'path';
import { LowSync, JSONFileSync } from 'lowdb';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import { mapValues, omitBy, pick } from 'lodash';
import { Option, Table, TableData } from './utils';

const MAX_TABLE_SIZE = 6;

type Data = {
  tables: Record<string, TableData>;
};

type Database = Omit<LowSync<Data>, 'data'> & { data: Data };

export function getDatabase() {
  if (!global.database) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const file = join(__dirname, 'db.json');
    const adapter = new JSONFileSync<Data>(file);
    const db = new LowSync(adapter);
    global.database = db;
    db.read();

    if (!db.data) {
      db.data = { tables: {} };
    }
  }

  return global.database as Database;
}

export function syncTables() {
  const db = getDatabase();
  const keys = Object.keys(db.data.tables)
    .sort((a, b) => Number(a) - Number(b))
    .slice(-MAX_TABLE_SIZE);
  db.data.tables = pick(db.data.tables, keys);
  db.write();
}

export function syncTable({ id, data }: Table) {
  const db = getDatabase();
  const table = getTableById(id);

  if (table) {
    db.data.tables[id] = data;
    syncTables();
  }

  return table;
}

export function getCurrentTable(): Table {
  const now = new Date();
  const id = dayjs(now).startOf('M').toDate().getTime();
  const db = getDatabase();

  let currentTableData = db.data.tables[id];

  if (!currentTableData) {
    const [lastKey] = Object.keys(db.data.tables).sort(
      (a, b) => Number(b) - Number(a)
    );
    const lastTable = db.data.tables[lastKey];

    currentTableData = mapValues(
      omitBy(lastTable ?? {}, (o) => o.includes(Option.ABSENT)),
      () => []
    );

    db.data.tables[id] = currentTableData;
    syncTables();
  }

  return { id, data: currentTableData };
}

export function getTableById(id?: string | number): Table | undefined {
  if (!id) {
    return getCurrentTable();
  }

  const db = getDatabase();
  const tableData = db.data.tables[id];

  if (tableData) {
    return { id: Number(id), data: tableData };
  }
}

// 倒序排列
export function getTables(size = MAX_TABLE_SIZE): Table[] {
  // 刷新记录
  getCurrentTable();
  const db = getDatabase();
  return Object.keys(db.data.tables)
    .sort((a, b) => Number(b) - Number(a))
    .slice(0, size)
    .map((id) => ({ id: Number(id), data: db.data.tables[id] }));
}
