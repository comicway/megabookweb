# MegaBook Project Context

**Date:** April 15, 2026  
**Topic:** MegaBook Web Application MVP

---

## General Context

Current development is built primarily in **React JS** and is in the Minimum Viable Product (MVP) phase.
The fundamental goal for this phase is to validate the idea through what we define as the **"One Metric That Matters" (OMTM)**, which is:

> **Determine if 100 active users achieve Retention after 66 days** (the average time required to build a habit, according to sources).

For the application to be ready to measure this OMTM, the following is required:

1. **Public Deployment:** The application must be hosted publicly on the internet.
2. **Zero-Friction Authentication:** Users must be able to log in directly using **Gmail** (Google SSO).
3. **Book Catalog:** Book search and registration must be active using the **Google Books API**.
4. **Analytics and Internal Tracking:** We need to implement a native or third-party telemetry system to see where users click, what tags they use, and measure their interactions.
5. **Streak Monitoring:** From the admin side, individual user streaks must be visible to analyze if the 66-day (Retention) metric is being met.

---

## Current Application State

According to the repository's current structure (based on Vite + React + Tailwind + React Router), the application already has the necessary modular division for this validation, including:
- **Habit and Configuration Management:** Components like `ConfigHabit` and `ConfigBook`.
- **Reading Logging and Tracking:** Components like `ResgiterBook`, `BookLog`, `ReadBook`, and the use of the timer (`Timer`).
- **Gamification / Retention:** Dedicated components like `DailyStreak`.
- **Navigation Core:** `Home`, `ToolBar`, and global context management.

---

## Next Steps (OMTM Roadmap)

To achieve the MVP goal, the following development milestones will take priority:

- [ ] **Deploy:** Deploy the MVP to production using Vercel.

- [ ] **Auth:** Integrate an identity provider (e.g., Firebase, Supabase auth) for "Login with Google".

- [ ] **Cloud/Backend:** Develop an API in **FastAPI** connected to a centralized database to save persistent information (streaks, logs, users); and include administrative endpoints to easily visualize these retention metrics.

- [ ] **Search:** Scale the current Google Books API integration using a more robust token/plan that can handle massive simultaneous requests from users without being blocked.

- [ ] **Tracking UI:** Instrument events in React and develop a custom endpoint in the backend (FastAPI) to log telemetry (number of clicks on buttons/books, action time, and screens viewed) without depending on external services.

- [ ] **Push Notifications (Backend):** Implement workers/tasks in FastAPI that query the user's configuration (`ConfigHabit.jsx`) in the database and trigger Web Push notifications to their browser.
