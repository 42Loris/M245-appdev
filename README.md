# Harmony OP ⚙️

Harmony OP is a modern, automated Employee Onboarding platform. It bridges the gap between IT and HR by directly integrating with Microsoft Entra ID (Active Directory) to automate role-based access, hardware provisioning, and HR tasks the moment a new employee is added to the system.

## ✨ Key Features
* **Automated Directory Sync:** Connects to Microsoft Graph API to automatically detect new hires.
* **Role-Based Profiles:** Map Microsoft Entra Groups to specific onboarding templates (e.g., "Software Engineer" gets GitHub access and a MacBook).
* **Cross-Department Workflows:** Generates unified task lists for IT and HR on dedicated Kanban boards.
* **Real-Time Dashboards:** Track onboarding completion progress at a glance.
* **Multi-Tenant Architecture:** Securely supports multiple organizations/companies.

## 🛠️ Tech Stack
* **Framework:** Next.js 15 (App Router, React 19)
* **Database:** PostgreSQL hosted on Supabase
* **ORM:** Drizzle ORM
* **Authentication:** Supabase Auth
* **Styling:** Tailwind CSS & shadcn/ui
* **Deployment:** Vercel (with Vercel Cron for background syncs)

## 🚀 Getting Started
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env.local` and add your Supabase and Database credentials.
4. Run `npx drizzle-kit push` to apply the database schema.
5. Run `npm run dev` to start the local development server at `localhost:3000`..