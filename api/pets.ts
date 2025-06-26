import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage.js';
import { insertPetSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      let pets;
      if (userId) {
        pets = await storage.getPetsByUser(userId);
      } else {
        pets = await storage.getAllPets();
      }
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  } else if (req.method === 'POST') {
    // TODO: Add authentication and file upload handling
    try {
      const petData = req.body;
      const parsedPet = insertPetSchema.parse(petData);
      const pet = await storage.createPet(parsedPet);
      res.status(201).json(pet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  } else {
    res.status(405).end();
  }
} 
