import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage';
// import your notifications logic

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // TODO: Fetch notifications
    res.json([]);
  } else if (req.method === 'POST') {
    // TODO: Add notification
    res.status(201).json({ message: "Notification created" });
  } else {
    res.status(405).end();
  }
} 