import { 
  users, 
  pets, 
  adoptionApplications, 
  aiMatches, 
  chatSessions,
  type User, 
  type InsertUser,
  type Pet,
  type InsertPet,
  type AdoptionApplication,
  type InsertAdoptionApplication,
  type AiMatch,
  type InsertAiMatch,
  type ChatSession,
  type InsertChatSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Pets
  getAllPets(): Promise<Pet[]>;
  getPet(id: number): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: number, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  deletePet(id: number): Promise<boolean>;
  searchPets(filters: { type?: string; age?: string; location?: string }): Promise<Pet[]>;

  // Adoption Applications
  createApplication(application: InsertAdoptionApplication): Promise<AdoptionApplication>;
  getApplicationsByUser(userId: number): Promise<AdoptionApplication[]>;
  getApplicationsByPet(petId: number): Promise<AdoptionApplication[]>;
  getAllApplications(): Promise<AdoptionApplication[]>;
  updateApplicationStatus(id: number, status: string): Promise<AdoptionApplication | undefined>;

  // AI Matches
  createAiMatch(match: InsertAiMatch): Promise<AiMatch>;
  getMatchesForUser(userId: number): Promise<AiMatch[]>;
  getAllMatches(): Promise<AiMatch[]>;

  // Chat Sessions
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  updateChatSession(id: number, sessionData: any): Promise<ChatSession | undefined>;

  // Admin Stats
  getAdminStats(): Promise<{
    totalPets: number;
    adoptionsToday: number;
    pendingApplications: number;
    aiMatches: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Pets
  async getAllPets(): Promise<Pet[]> {
    return await db.select().from(pets).orderBy(desc(pets.createdAt));
  }

  async getPet(id: number): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const [pet] = await db
      .insert(pets)
      .values(insertPet)
      .returning();
    return pet;
  }

  async updatePet(id: number, petData: Partial<InsertPet>): Promise<Pet | undefined> {
    const [pet] = await db
      .update(pets)
      .set(petData)
      .where(eq(pets.id, id))
      .returning();
    return pet || undefined;
  }

  async deletePet(id: number): Promise<boolean> {
    const result = await db.delete(pets).where(eq(pets.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async searchPets(filters: { type?: string; age?: string; location?: string }): Promise<Pet[]> {
    let query = db.select().from(pets).where(eq(pets.status, "available"));

    const conditions = [];
    if (filters.type) {
      conditions.push(eq(pets.type, filters.type));
    }
    if (filters.age) {
      conditions.push(eq(pets.age, filters.age));
    }
    if (filters.location) {
      conditions.push(sql`${pets.location} ILIKE ${`%${filters.location}%`}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(pets.createdAt));
  }

  // Adoption Applications
  async createApplication(application: InsertAdoptionApplication): Promise<AdoptionApplication> {
    const [app] = await db
      .insert(adoptionApplications)
      .values(application)
      .returning();
    return app;
  }

  async getApplicationsByUser(userId: number): Promise<AdoptionApplication[]> {
    return await db
      .select()
      .from(adoptionApplications)
      .where(eq(adoptionApplications.userId, userId))
      .orderBy(desc(adoptionApplications.createdAt));
  }

  async getApplicationsByPet(petId: number): Promise<AdoptionApplication[]> {
    return await db
      .select()
      .from(adoptionApplications)
      .where(eq(adoptionApplications.petId, petId))
      .orderBy(desc(adoptionApplications.createdAt));
  }

  async getAllApplications(): Promise<AdoptionApplication[]> {
    return await db
      .select()
      .from(adoptionApplications)
      .orderBy(desc(adoptionApplications.createdAt));
  }

  async updateApplicationStatus(id: number, status: string): Promise<AdoptionApplication | undefined> {
    const [app] = await db
      .update(adoptionApplications)
      .set({ status, updatedAt: new Date() })
      .where(eq(adoptionApplications.id, id))
      .returning();
    return app || undefined;
  }

  // AI Matches
  async createAiMatch(match: InsertAiMatch): Promise<AiMatch> {
    const [aiMatch] = await db
      .insert(aiMatches)
      .values(match)
      .returning();
    return aiMatch;
  }

  async getMatchesForUser(userId: number): Promise<AiMatch[]> {
    return await db
      .select()
      .from(aiMatches)
      .where(eq(aiMatches.userId, userId))
      .orderBy(desc(aiMatches.matchScore));
  }

  async getAllMatches(): Promise<AiMatch[]> {
    return await db
      .select()
      .from(aiMatches)
      .orderBy(desc(aiMatches.createdAt));
  }

  // Chat Sessions
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [chatSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return chatSession;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || undefined;
  }

  async updateChatSession(id: number, sessionData: any): Promise<ChatSession | undefined> {
    const [session] = await db
      .update(chatSessions)
      .set({ sessionData, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return session || undefined;
  }

  // Admin Stats
  async getAdminStats(): Promise<{
    totalPets: number;
    adoptionsToday: number;
    pendingApplications: number;
    aiMatches: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPetsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pets);

    const [adoptionsTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adoptionApplications)
      .where(
        and(
          eq(adoptionApplications.status, "approved"),
          sql`${adoptionApplications.updatedAt} >= ${today}`
        )
      );

    const [pendingApplicationsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adoptionApplications)
      .where(eq(adoptionApplications.status, "pending"));

    const [aiMatchesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(aiMatches);

    return {
      totalPets: totalPetsResult.count,
      adoptionsToday: adoptionsTodayResult.count,
      pendingApplications: pendingApplicationsResult.count,
      aiMatches: aiMatchesResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
