import { join, dirname } from 'path';
import { LowSync, JSONFileSync } from 'lowdb';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import { uniqBy, sortBy, first } from 'lodash';
import { Table } from './utils';

const MAX_TABLE_SIZE = 6;

type Data = {
  // desc order
  tables: Table[];
};

export function getDatabase() {
  if (!global.database) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const file = join(__dirname, 'db.json');
    const adapter = new JSONFileSync<Data>(file);
    const db = new LowSync(adapter);
    global.database = db;
    db.read();

    if (!db.data) {
      db.data = { tables: [] };
    }
  }

  return global.database as LowSync<Data>;
}

export function syncTables() {
  const db = getDatabase();
  db.data.tables = sortBy(uniqBy(db.data.tables, 'date'), 'date')
    .reverse()
    .slice(0, MAX_TABLE_SIZE);
  db.write();
}

export function getCurrentTable() {
  const now = new Date();
  const dateOfMonth = dayjs(now).startOf('M');

  const db = getDatabase();
  const currentTable = first(db.data.tables);

  if (currentTable && dateOfMonth.isSame(currentTable.date)) {
    return currentTable;
  }

  const nextDate = dateOfMonth.toDate().getTime();
  const nextTable: Table = {
    date: nextDate,
    records:
      currentTable?.records.map(({ name }) => ({
        name,
        date: nextDate,
        options: [],
      })) ?? [],
  };

  db.data.tables.push(nextTable);
  syncTables();

  return nextTable;
}

export function queryTable(id?: string | number) {
  const db = getDatabase();
  return !id
    ? getCurrentTable()
    : db.data.tables.find((o) => String(o.date) === String(id));
}

export function getTables() {
  // refresh tables
  getCurrentTable();
  return getDatabase().data.tables;
}
