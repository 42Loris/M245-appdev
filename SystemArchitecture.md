# Harmony OP: System Architecture

This document outlines the core technical flows and database design of Harmony OP.

## 1. Database Schema (Drizzle + Postgres)
The database is heavily relational, designed around a multi-tenant architecture where every major table is linked to an `org_id`.

* `organizations`: The top-level tenant (a company).
* `users`: All actors in the system (HR admins, IT staff, and the New Hires themselves).
* `roleProfiles` & `profileTasks`: The templates. Defines what tasks should be created when a specific role is hired.
* `organizationIntegrations`: Securely stores the Microsoft Entra ID OAuth credentials for the tenant.
* `onboardingWorkflows` & `workflowTasks`: The live instances. When a sync happens, a profile is cloned into a live workflow for a specific user.

## 2. Microsoft Entra ID Integration Flow
Harmony OP uses the **Microsoft Graph API (Client Credentials Flow)**. We use Application Permissions (`User.Read.All`, `Group.Read.All`) rather than Delegated Permissions because the system operates autonomously in the background.

**The Sync Logic (`/api/sync`):**
1. The engine fetches the `tenantId`, `clientId`, and `clientSecret` from the database.
2. It requests a short-lived Access Token from `login.microsoftonline.com`.
3. It queries the database for all `roleProfiles` that have a non-null `entraGroupId`.
4. It calls the Graph API: `GET /groups/{entraGroupId}/members`.
5. It compares the Microsoft members against the `users` table via email/UPN.
6. For any missing user, it executes a database transaction: creating the User, creating the Workflow, and generating the Workflow Tasks.

## 3. Automation Engine (Dual-Trigger)
The sync engine can be triggered in two ways:
* **Manual Override:** An authenticated Admin clicks "Sync Now" on the dashboard. This hits the API route and only syncs their specific tenant.
* **Vercel Cron Job:** Runs automatically at minute 0 of every hour (`0 * * * *`). The cron job passes a secure `CRON_SECRET` Bearer token. The API route detects this token and loops through *all* active integrations in the database.

## 4. Strict Type Safety (Server Actions)
We utilize Next.js 15 Server Actions heavily. To satisfy strict TypeScript requirements when using `useActionState`, all form actions share a strict type definition (e.g., `ProfileFormState` returning `{ error, success, timestamp }`). Form inputs are strictly named to match the Drizzle database schema exactly.