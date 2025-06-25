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
  isAdmin: boolean("is_admin").notNull().default(false),
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
  documentsUrl: text("documents_url"), // URL to uploaded pet documents
  status: text("status").notNull().default("available"), // available, pending, adopted
  personality: jsonb("personality"), // JSON object with personality traits
  careNeeds: jsonb("care_needs"), // JSON object with care requirements
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
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

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  petType: text("pet_type"), // dog, cat, rabbit, bird
  agePreference: text("age_preference"), // young, adult, senior
  sizePreference: text("size_preference"), // small, medium, large
  activityLevel: text("activity_level"), // low, moderate, high
  livingSpace: text("living_space"), // apartment, house, etc.
  otherPets: boolean("other_pets"),
  experienceLevel: text("experience_level"), // none, some, experienced
  specialNeeds: boolean("special_needs_ok"),
  additionalPreferences: jsonb("additional_preferences"), // Any other preferences as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  adoptionApplications: many(adoptionApplications),
  aiMatches: many(aiMatches),
  chatSessions: many(chatSessions),
  preferences: many(userPreferences),
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

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
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

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
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

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
