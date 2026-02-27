// db/schema.ts
import { pgTable, uuid, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums based on Harmony OP requirements
export const roleEnum = pgEnum("role", ["HR", "IT", "MANAGER", "EMPLOYEE"]);
export const taskTypeEnum = pgEnum("task_type", ["IT_ACCESS", "HARDWARE", "TRAINING", "HR_ADMIN"]);
export const statusEnum = pgEnum("status", ["PENDING", "IN_PROGRESS", "BLOCKED", "DONE"]);

// Organizations (Tenants / KMUs) 
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users (All actors in the system) 
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: roleEnum("role").default("EMPLOYEE").notNull(),
  department: text("department"),
  authId: text("auth_id"), 
});

// Role-Based Onboarding Profiles 
export const onboardingProfiles = pgTable("onboarding_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  roleTitle: text("role_title").notNull(),
  department: text("department").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Active Workflows (Event-driven trigger) - UNIFIED DEFINITION
export const onboardingWorkflows = pgTable("onboarding_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id),
  newHireId: uuid("new_hire_id").notNull().references(() => users.id),
  profileId: uuid("profile_id").references(() => onboardingProfiles.id),
  roleTitle: text("role_title").notNull().default("Employee"), 
  department: text("department").notNull().default("General"), 
  startDate: timestamp("start_date").notNull(),
  progressRatio: integer("progress_ratio").default(0).notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workflow Tasks (Instantiated tasks for IT, HR, etc.) 
export const workflowTasks = pgTable("workflow_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").notNull().references(() => onboardingWorkflows.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  taskType: taskTypeEnum("task_type").notNull(),
  assignedUserId: uuid("assigned_user_id").references(() => users.id),
  status: statusEnum("status").default("PENDING").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations 
export const workflowTasksRelations = relations(workflowTasks, ({ one }) => ({
  workflow: one(onboardingWorkflows, {
    fields: [workflowTasks.workflowId],
    references: [onboardingWorkflows.id],
  }),
}));