import type { NextApiRequest, NextApiResponse } from 'next';
import { Table } from '../../utils';
import { syncTable } from '../../database';

type Payload = {
  data: Table;
};

type Response = {
  data?: unknown;
  message?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    if (req.method === 'POST') {
      const { data } = req.body as Payload;
      const table = syncTable(data);
      return res.status(200).json({ data: table });
    }

    res.status(400).json({});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}
