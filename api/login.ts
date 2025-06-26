import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage.js';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Incorrect email or password." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Incorrect email or password." });
    // TODO: Issue JWT or set cookie for stateless auth
    res.status(200).json({ message: "Login successful", user });
  } else {
    res.status(405).end();
  }
} 
