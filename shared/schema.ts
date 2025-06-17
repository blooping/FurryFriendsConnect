import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  city: text("city"),
  housingType: text("housing_type"),
  petExperience: text("pet_experience"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // dog, cat, rabbit, bird
  breed: text("breed").notNull(),
  age: text("age").notNull(),
  gender: text("gender").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("available"), // available, pending, adopted
  personality: jsonb("personality"), // JSON object with personality traits
  careNeeds: jsonb("care_needs"), // JSON object with care requirements
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adoptionApplications = pgTable("adoption_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  petId: integer("pet_id").references(() => pets.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  applicationData: jsonb("application_data").notNull(), // Form data as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiMatches = pgTable("ai_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  petId: integer("pet_id").references(() => pets.id).notNull(),
  matchScore: integer("match_score").notNull(), // 1-100
  reasoning: text("reasoning").notNull(),
  geminiResponse: jsonb("gemini_response"), // Full AI response
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionData: jsonb("session_data").notNull(), // Chat history
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  adoptionApplications: many(adoptionApplications),
  aiMatches: many(aiMatches),
  chatSessions: many(chatSessions),
}));

export const petsRelations = relations(pets, ({ many }) => ({
  adoptionApplications: many(adoptionApplications),
  aiMatches: many(aiMatches),
}));

export const adoptionApplicationsRelations = relations(adoptionApplications, ({ one }) => ({
  user: one(users, {
    fields: [adoptionApplications.userId],
    references: [users.id],
  }),
  pet: one(pets, {
    fields: [adoptionApplications.petId],
    references: [pets.id],
  }),
}));

export const aiMatchesRelations = relations(aiMatches, ({ one }) => ({
  user: one(users, {
    fields: [aiMatches.userId],
    references: [users.id],
  }),
  pet: one(pets, {
    fields: [aiMatches.petId],
    references: [pets.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
  createdAt: true,
});

export const insertAdoptionApplicationSchema = createInsertSchema(adoptionApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiMatchSchema = createInsertSchema(aiMatches).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;

export type AdoptionApplication = typeof adoptionApplications.$inferSelect;
export type InsertAdoptionApplication = z.infer<typeof insertAdoptionApplicationSchema>;

export type AiMatch = typeof aiMatches.$inferSelect;
export type InsertAiMatch = z.infer<typeof insertAiMatchSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
