import { useEffect, useMemo, useRef, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dayjs from 'dayjs';
import {
  Cell,
  SwipeCell,
  ActionSheet,
  Button,
  Dialog,
  Field,
  FieldInstance,
  Flex,
  Notify,
} from 'react-vant';
import { countBy, omitBy } from 'lodash';
import { getTableById } from '../database';
import { Option, OptionMapDesc, syncTable, Table } from '../utils';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query;
  const table = getTableById(
    id && dayjs(Number(id)).startOf('M').toDate().getTime()
  );

  if (!table) {
    return {
      redirect: { destination: '/', permanent: false },
    };
  }

  return {
    props: {
      data: table,
      today: id
        ? dayjs(Number(id)).toDate().getTime()
        : dayjs().toDate().getTime(),
    },
  };
};

function AutoPrompt({ onChange }: { onChange?: (value: string) => void }) {
  const ref = useRef<FieldInstance>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <Field
      className="prompt"
      center
      placeholder="输入姓名"
      border
      ref={ref}
      onChange={onChange}
    />
  );
}

export default function Check({
  data: table,
  today,
}: {
  data: Table;
  today: number;
}) {
  const [data, setData] = useState(table);
  const [selected, setSelected] = useState('');
  const nameRef = useRef('');
  const inputRef = useRef('');

  const { title, users, todayIndex } = useMemo(() => {
    const { data: records } = data;

    const title = dayjs(today).format('YYYY年M月D日考勤');
    const todayIndex = dayjs(today).date() - 1;

    const users = Object.entries(
      // 过滤掉昨日离职人员
      omitBy(
        records,
        (o) => o.includes(Option.ABSENT) && o[todayIndex] !== Option.ABSENT
      )
    ).map(([name, options]) => {
      const stat = countBy(options);
      return {
        name,
        stat: [
          '出 ' + (stat[Option.WORK] ?? 0),
          '休 ' + (stat[Option.VACATION] ?? 0),
        ],
        value: OptionMapDesc[options[todayIndex] as number],
        option: options[todayIndex],
      };
    });

    return { title, users, todayIndex };
  }, [data, today]);

  const handleRemove = (name: string) => {
    delete data.data[name];
    setData({ ...data });
  };

  const actions = Object.entries(OptionMapDesc).map(([value, name]) => ({
    name,
    className: `check-${value}`,
    callback: () => {
      setSelected((name) => {
        data.data[name][todayIndex] = Number(value);
        setData({ ...data });
        return '';
      });
    },
  }));

  const handleAdd = () => {
    inputRef.current = '';
    Dialog.confirm({
      title: '添加人员',
      confirmButtonColor: '#44bb97',
      message: <AutoPrompt onChange={(v) => (inputRef.current = v)} />,
      onConfirm: () => {
        const name = inputRef.current.trim();
        if (name) {
          if (data.data[name]) {
            Notify.show('该人员已存在');
          } else {
            data.data[name] = [];
            setData({ ...data });
          }
        }
      },
    });
  };

  useEffect(() => {
    if (data !== table) {
      syncTable(data);
    }
  }, [data, table]);

  useEffect(() => {
    return () => {
      if (data !== table) {
        syncTable(data);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <Head>
        <title>{title}</title>
      </Head>
      {users.map(({ name, value, option, stat }) => (
        <SwipeCell
          key={name}
          rightAction={
            <Button
              style={{ height: '100%' }}
              square
              type="danger"
              text="删除"
              onClick={() => handleRemove(name)}
            />
          }
        >
          <Cell
            center
            title={name}
            value={<span className={`check-${option}`}>{value}</span>}
            label={
              <Flex align="center">
                {stat.map((t, i) => (
                  <Flex.Item key={i} span={8}>
                    {t}
                  </Flex.Item>
                ))}
              </Flex>
            }
            onClick={() => {
              nameRef.current = name;
              setSelected(name);
            }}
          />
        </SwipeCell>
      ))}
      <ActionSheet
        visible={!!selected}
        onCancel={() => setSelected('')}
        description={`${nameRef.current}`}
        actions={actions}
        cancelText="取消"
      />
      <div className="footer-button" onClick={handleAdd}>
        添加人员
      </div>
    </div>
  );
}
