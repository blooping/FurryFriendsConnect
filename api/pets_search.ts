import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { type, age, location } = req.query;
      const pets = await storage.searchPets({
        type: type as string,
        age: age as string,
        location: location as string,
      });
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to search pets" });
    }
  } else {
    res.status(405).end();
  }
} 
