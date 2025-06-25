import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/server/storage';
import { insertAdoptionApplicationSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  } else if (req.method === 'POST') {
    try {
      const appData = req.body;
      const parsedApp = insertAdoptionApplicationSchema.parse(appData);
      const application = await storage.createApplication(parsedApp);
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  } else {
    res.status(405).end();
  }
} 