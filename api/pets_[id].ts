import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage.js';
import { insertPetSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? parseInt(req.query.id as string) : undefined;
  if (!id) return res.status(400).json({ message: "Missing pet id" });

  if (req.method === 'GET') {
    try {
      const pet = await storage.getPet(id);
      if (!pet) return res.status(404).json({ message: "Pet not found" });
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  } else if (req.method === 'PUT') {
    // TODO: Add authentication and file upload handling
    try {
      const petData = req.body;
      const parsedPet = insertPetSchema.partial().parse(petData);
      const pet = await storage.updatePet(id, parsedPet);
      if (!pet) return res.status(404).json({ message: "Pet not found" });
      res.json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  } else {
    res.status(405).end();
  }
} 
