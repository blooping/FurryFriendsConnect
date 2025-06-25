import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // TODO: Clear JWT or client-side token
    res.status(200).json({ message: "Logged out" });
  } else {
    res.status(405).end();
  }
} 