import { join, dirname } from 'path';
import { LowSync, JSONFileSync } from 'lowdb';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import { uniqBy, sortBy } from 'lodash';
import { Table } from './utils';

type Data = {
  tables: Table[];
};

export function getDatabase() {
  if (!global.database) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const file = join(__dirname, 'db.json');
    const adapter = new JSONFileSync(file);
    const db = new LowSync(adapter);
    global.database = db;
    db.read();

    if (!db.data) {
      db.data = { tables: [] };
    }
  }

  return global.database as LowSync<Data>;
}

export function getCurrentTable() {
  const db = getDatabase();
  const now = new Date();
  const dateOfMonth = dayjs(now).startOf('M');
  const table = db.data.tables.find((o) => dateOfMonth.isSame(o.date));

  if (!table) {
    const currentTable: Table = {
      date: dateOfMonth.toDate().getTime(),
      records: [],
    };

    db.data.tables.push(currentTable);
    db.write();

    return currentTable;
  }

  return table;
}

export function queryTable(id: string) {
  const db = getDatabase();
  return db.data.tables.find((o) => o.date === Number(id));
}

export function getTables(size?: number) {
  const db = getDatabase();
  const currentTable = getCurrentTable();
  const tables = uniqBy([...db.data.tables, currentTable], 'date');
  return sortBy(tables, 'date').reverse().slice(0, size);
}
