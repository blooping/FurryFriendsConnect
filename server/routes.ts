import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService } from "./services/gemini";
import { insertPetSchema, insertAdoptionApplicationSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Pet routes
  app.get("/api/pets", async (req, res) => {
    try {
      const pets = await storage.getAllPets();
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pets" });
    }
  });

  app.get("/api/pets/search", async (req, res) => {
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
  });

  app.get("/api/pets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pet = await storage.getPet(id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pet" });
    }
  });

  app.post("/api/pets", async (req, res) => {
    try {
      const petData = insertPetSchema.parse(req.body);
      const pet = await storage.createPet(petData);
      res.status(201).json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pet" });
    }
  });

  app.put("/api/pets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const petData = insertPetSchema.partial().parse(req.body);
      const pet = await storage.updatePet(id, petData);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update pet" });
    }
  });

  app.delete("/api/pets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePet(id);
      if (!success) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pet" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Adoption application routes
  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertAdoptionApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put("/api/applications/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const application = await storage.updateApplicationStatus(id, status);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // AI matching routes
  app.post("/api/ai/match", async (req, res) => {
    try {
      const { userPreferences, userId } = req.body;
      
      // Get available pets
      const availablePets = await storage.searchPets({});
      
      // Transform pets for AI matching
      const petsForMatching = availablePets.map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        personality: pet.personality,
        careNeeds: pet.careNeeds,
        description: pet.description,
      }));

      // Get AI matches
      const matches = await geminiService.findPetMatches({
        userPreferences,
        availablePets: petsForMatching,
      });

      // Save matches to database if userId provided
      if (userId) {
        for (const match of matches) {
          await storage.createAiMatch({
            userId,
            petId: match.petId,
            matchScore: match.matchScore,
            reasoning: match.reasoning,
            geminiResponse: match,
          });
        }
      }

      res.json(matches);
    } catch (error) {
      console.error("AI matching error:", error);
      res.status(500).json({ message: "Failed to generate pet matches" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, chatHistory, userId } = req.body;
      
      const response = await geminiService.getChatResponse(message, chatHistory || []);
      
      // Save or update chat session if userId provided
      if (userId) {
        const newChatHistory = [...(chatHistory || []), { user: message, ai: response }];
        
        // For simplicity, create a new session each time
        // In production, you might want to maintain ongoing sessions
        await storage.createChatSession({
          userId,
          sessionData: { messages: newChatHistory },
        });
      }

      res.json({ response });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to generate chat response" });
    }
  });

  app.post("/api/ai/care-advice", async (req, res) => {
    try {
      const { petType, specificNeeds } = req.body;
      const advice = await geminiService.generatePetCareAdvice(petType, specificNeeds);
      res.json({ advice });
    } catch (error) {
      console.error("Care advice error:", error);
      res.status(500).json({ message: "Failed to generate care advice" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
