import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage';
import { geminiService } from './_lib/server/services/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    // TODO: Use geminiService for AI matching
    res.status(200).json({ matches: [] });
  } else {
    res.status(405).end();
  }
} 