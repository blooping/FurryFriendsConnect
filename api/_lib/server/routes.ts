import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService } from "./services/gemini";
import { insertPetSchema, insertAdoptionApplicationSchema, insertUserSchema } from "../../shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcryptjs";

// Helper function to format AI matches for display
function formatMatches(matches: Array<{
  petId: number;
  name: string;
  matchScore: number;
  reasoning: string;
  careAdvice: string[];
}>) {
  if (!matches || matches.length === 0) {
    return "Sorry, I couldn't find any good matches right now.";
  }
  return (
    "Here are your top pet matches:\n\n" +
    matches.slice(0, 3).map((m, i) =>
      `${i + 1}. ${m.name} (ID: ${m.petId})\nMatch Score: ${m.matchScore}%\nWhy this pet: ${m.reasoning}\n\nCare Tips:\n${(m.careAdvice || []).map(tip => `• ${tip}`).join("\n")}`
    ).join("\n\n")
  );
}

// Add proper types for multer files
interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Use diskStorage to preserve file extension
const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Get the original extension
    const ext = path.extname(file.originalname);
    // Use a unique name + extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storageConfig });

passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) return done(null, false, { message: "Incorrect email." });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return done(null, false, { message: "Incorrect password." });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "You must be logged in to perform this action." });
}

// In-memory notifications array (replace with DB in production)
const notifications: Array<any> = [];
let notificationId = 1;

// Helper to parse boolean-like values
function parseBoolean(val: string) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const v = val.trim().toLowerCase();
    return v === 'yes' || v === 'y' || v === 'true';
  }
  return false;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Pet routes
  app.get("/api/pets", async (req, res) => {
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

  app.post("/api/pets", ensureAuthenticated, upload.fields([
    { name: "image", maxCount: 1 },
    { name: "documents", maxCount: 1 },
  ]), async (req, res) => {
    try {
      const petData = req.body;
      const files = req.files as MulterFiles | undefined;
      
      if (files?.["image"]?.[0]) {
        petData.imageUrl = `/uploads/${files["image"][0].filename}`;
      }
      if (files?.["documents"]?.[0]) {
        petData.documentsUrl = `/uploads/${files["documents"][0].filename}`;
      } else {
        return res.status(400).json({ message: "Pet documents are required." });
      }
      if ((req.user as any) && (req.user as any).id) {
        petData.userId = (req.user as any).id;
      }
      const parsedPet = insertPetSchema.parse(petData);
      const pet = await storage.createPet(parsedPet);
      res.status(201).json(pet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pet" });
    }
  });

  app.put("/api/pets/:id", ensureAuthenticated, upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let petData = req.body;
      if (req.file) {
        petData.imageUrl = `/uploads/${req.file.filename}`;
      }
      // Debug: log incoming data
      console.log("PUT /api/pets/:id incoming data:", petData);
      // Parse the data (allow partial updates)
      const parsedPet = insertPetSchema.partial().parse(petData);
      const pet = await storage.updatePet(id, parsedPet);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      res.json(pet);
    } catch (error) {
      console.error("PUT /api/pets/:id error:", error);
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
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({ ...userData, password: hashedPassword });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Adoption application routes
  app.post("/api/applications", ensureAuthenticated, async (req, res) => {
    try {
      // Set userId on req.body before validation
      if ((req.user as any) && (req.user as any).id) {
        req.body.userId = (req.user as any).id;
      }
      const applicationData = insertAdoptionApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      // Notify pet owner
      const pet = await storage.getPet(application.petId);
      if (pet && pet.userId) {
        notifications.push({
          id: notificationId++,
          userId: pet.userId,
          type: "adoption_application",
          message: `New adoption application for your pet (ID: ${pet.id})`,
          isRead: false,
          createdAt: new Date(),
          data: { applicationId: application.id, petId: pet.id }
        });
      }
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.errors);
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
  app.post("/api/ai/match", ensureAuthenticated, async (req, res) => {
    try {
      const userPreferences = req.body.userPreferences;
      // Fetch all available pets
      const allPets = await storage.getAllPets();
      const availablePets = allPets.filter(pet => pet.status === "available");
      // Prepare pets for AI (only needed fields)
      const petsForAI = availablePets.map(pet => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        personality: pet.personality,
        careNeeds: pet.careNeeds,
        description: pet.description,
      }));
      // Call Gemini AI
      const matches = await geminiService.findPetMatches({
        userPreferences,
        availablePets: petsForAI,
      });
      res.json({ matches });
    } catch (error) {
      console.error("/api/ai/match error:", error);
      res.status(500).json({ message: "Failed to match pets" });
    }
  });

  app.post("/api/ai/chat", ensureAuthenticated, async (req, res) => {
    try {
      const { message, chatHistory } = req.body;
      const userId = (req.user as any).id;
      
      // Check if this is a matching-related message
      const matchingTriggers = ["match", "recommend", "best pet", "find me a pet", "suggest a pet", "pet for me"];
      const isMatchingIntent = matchingTriggers.some(trigger => message.toLowerCase().includes(trigger));

      // If this is a matching response with preferences, store them
      if (message.startsWith("MATCH_PREFERENCES:")) {
        try {
          const preferences = JSON.parse(message.replace("MATCH_PREFERENCES:", ""));
          // Sanitize boolean fields
          if (preferences.otherPets !== undefined) {
            preferences.otherPets = parseBoolean(preferences.otherPets);
          }
          if (preferences.specialNeeds !== undefined) {
            preferences.specialNeeds = parseBoolean(preferences.specialNeeds);
          }
          // Create or update user preferences
          const existingPrefs = await storage.getUserPreferences(userId);
          if (existingPrefs) {
            await storage.updateUserPreferences(userId, preferences);
          } else {
            await storage.createUserPreferences({ ...preferences, userId });
          }
          // Get matches using the preferences
          const allPets = await storage.getAllPets();
          const availablePets = allPets.filter(pet => pet.status === "available");
          const petsForAI = availablePets.map(pet => ({
            id: pet.id,
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            age: pet.age,
            personality: pet.personality,
            careNeeds: pet.careNeeds,
            description: pet.description,
          }));
          const matches = await geminiService.findPetMatches({
            userPreferences: preferences,
            availablePets: petsForAI,
          });
          // Store matches in the database
          for (const match of matches) {
            await storage.createAiMatch({
              userId,
              petId: match.petId,
              matchScore: match.matchScore,
              reasoning: match.reasoning,
              geminiResponse: { careAdvice: match.careAdvice },
            });
          }
          // Find the full pet objects for the matches
          const matchedPets = matches.map(match => {
            const pet = availablePets.find(p => p.id === match.petId);
            if (!pet) return null;
            return {
              ...pet,
              matchScore: match.matchScore,
              reasoning: match.reasoning,
              careAdvice: match.careAdvice,
            };
          }).filter(Boolean);
          // Format matches for display
          const response = formatMatches(matches.map(match => ({
            ...match,
            name: match.petId.toString() // Add missing name property
          })));
          // Save chat session
          const newChatHistory = [...(chatHistory || []),
            { type: "user", message },
            { type: "ai", message: response }
          ];
          await storage.createChatSession({
            userId,
            sessionData: { messages: newChatHistory },
          });
          // Return both the text response and the matches array
          return res.json({ response, matches: matchedPets });
        } catch (error) {
          console.error("Error processing preferences:", error);
          return res.status(400).json({ message: "Invalid preferences format" });
        }
      }

      // Get AI response
      const response = await geminiService.getChatResponse(message, chatHistory || []);
      
      // Save chat session
      const newChatHistory = [...(chatHistory || []), 
        { type: "user", message }, 
        { type: "ai", message: response }
      ];
      
      await storage.createChatSession({
        userId,
        sessionData: { messages: newChatHistory },
      });

      res.json({ response, isMatchingIntent });
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

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/me", (req: any, res: any) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.json({ user: { ...req.user, isAdmin: req.user.isAdmin } });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Get all adoption applications for pets owned by the current user (with adopter details)
  app.get("/api/owner/applications", ensureAuthenticated, async (req, res) => {
    try {
      const ownerId = (req.user as any).id;
      // Get all pets owned by this user
      const pets = await storage.getPetsByUser(ownerId);
      const petIds = pets.map(p => p.id);
      if (petIds.length === 0) return res.json([]);
      // Get all applications for these pets
      const allApplications = await Promise.all(
        petIds.map(async petId => {
          const applications = await storage.getApplicationsByPet(petId);
          // For each application, get adopter details
          return Promise.all(applications.map(async app => {
            const adopter = await storage.getUser(app.userId);
            return {
              ...app,
              adopter: adopter ? {
                id: adopter.id,
                fullName: adopter.fullName,
                email: adopter.email,
                phone: adopter.phone,
                city: adopter.city,
                housingType: adopter.housingType,
                petExperience: adopter.petExperience,
                username: adopter.username,
              } : null,
              pet: pets.find(p => p.id === petId) || null,
            };
          }));
        })
      );
      // Flatten the array
      const result = allApplications.flat();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch owner applications" });
    }
  });

  // Get notifications for current user
  app.get("/api/notifications", ensureAuthenticated, (req, res) => {
    const userId = (req.user as any).id;
    const userNotifications = notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    res.json(userNotifications);
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", ensureAuthenticated, (req, res) => {
    const userId = (req.user as any).id;
    const notif = notifications.find(n => n.id === parseInt(req.params.id));
    if (!notif || notif.userId !== userId) return res.status(404).json({ message: "Notification not found" });
    notif.isRead = true;
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
