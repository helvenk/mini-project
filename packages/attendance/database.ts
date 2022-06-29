import { join, dirname } from 'path';
import { LowSync, JSONFileSync } from 'lowdb';
import { fileURLToPath } from 'url';

export type Option = '休' | '离' | '√';

export type Record = {
  name: string;
  month: string;
  options: Option[];
  create: number;
  update: number;
};

export type Table = {
  title: string;
  month: string;
  records: Record[];
  create: number;
  update: number;
};

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
  const month = `${now.getFullYear()}${now.getMonth() + 1}`;
  const table = db.data.tables.find((o) => o.month === month);

  if (!table) {
    const currentTable: Table = {
      title: `${now.getFullYear()}年${now.getMonth() + 1}月考勤表`,
      month,
      create: now.getTime(),
      update: now.getTime(),
      records: [],
    };

    db.data.tables.push(currentTable);
    db.write();

    return currentTable;
  }

  return table;
}
