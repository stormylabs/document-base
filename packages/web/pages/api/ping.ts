import { NextApiResponse, NextApiRequest } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok', message: 'Pong!' });
}
