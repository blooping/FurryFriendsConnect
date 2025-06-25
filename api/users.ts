import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage';
import { insertUserSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  } else if (req.method === 'POST') {
    try {
      const userData = req.body;
      const parsedUser = insertUserSchema.parse(userData);
      const user = await storage.createUser(parsedUser);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  } else {
    res.status(405).end();
  }
} 