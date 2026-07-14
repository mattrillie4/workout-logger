# Workout Logger

A clean, functional full-stack application for tracking gym sessions. I'm building this to replace messy notes apps with a structured way to log exercises, sets, and weight progress.

This project is currently a **work in progress** as I build out more features and polish the app.

The project has been deployed (both backend and frontend), but features and improvements will still be made

### Live link: <https://workout-logger-beryl.vercel.app>

---

### 🚀 What it does (so far)

- **Secure Auth:** Fully implemented user registration and login using JWT.
- **Database Engine:** A PostgreSQL schema designed to handle complex relationships (Workouts → Exercises → Sets).
- **API:** A Node/Express backend that handles everything from exercise retrieval to multi-set workout logging.
- **Frontend Connection:** A React (Vite) interface that is now successfully talking to the backend via CORS.
- **Frontend Functionality** The React frontend has a theme, and handles all of the important API endpoints
- **User Profiles** Users can input their metrics and preferences, and this is securely stored in the database
- **Progression** User can view progression information about specific exercises, or their workout history overall. This is the most dynamic and differentiating feature of the app.

### 🛠 The Tech Stack

- **Frontend:** React, Material UI (MUI), Axios
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Vercel for frontend and Render for backend (free tiers)

### 🏗️ Architecture

#### As stated, the app is written in JavaScript with React frontend and Express API backend:

- Frontend handles authenticated routes, workout entry, filtering, and progress views
- Backend exposes REST endpoints for users, workouts, exercises and progress

### 📈 What's next

I'm currently working through the following roadmap:

- [x] **Dynamic Workout Form:** A MUI-based form to add exercises and sets on the fly.
- [x] **History Dashboard:** A dedicated view to look back at previous sessions.
- [ ] **Data Validation:** Integrating Zod on the backend to ensure data integrity.
- [ ] **Progress Tracking:** Charts to visualize strength gains over time.
- [x] **Unit Preference** Currently app uses kg only, aiming to add functionality for other measurement systems.
- [ ] **Add automated backend route tests**
- [ ] **Add demo account or seeded demo user data**
- [x] **Deploy backend and frontend**

---

## 📷 App Snapshots

**Dashboard for creating workouts**

<img width="947" height="472" alt="image" src="https://github.com/user-attachments/assets/ae568d80-eba0-43ba-8a70-37ae915746b4" />

**Login and signup view, with redirects to each other**

<img width="406" height="367" alt="image" src="https://github.com/user-attachments/assets/29879f71-400c-41ca-8bee-ada2e26a98d4" /> 
<img width="406" height="367" alt="image" src="https://github.com/user-attachments/assets/919b1ab3-e460-4ff6-bc53-810128df601e" />

**Entire profile page**

<img width="684" height="434" alt="image" src="https://github.com/user-attachments/assets/3cd09f97-5098-4735-b433-72f398b3ad03" />
<img width="688" height="421" alt="image" src="https://github.com/user-attachments/assets/eddc3032-a168-41d0-abb7-5f4c38da1f9f" />

## What I Learned

- Relational database design with Prisma schemas
- Protecting user specific resources with JWT tokens and authentication
- Creating more dynamic and detailed forms in React frontend apps
- Managing auth state and expired sessions on the frontend
- Handling more real CRUD workflows with multi-table databases, instead of single table static data
- How to deploy both backend and frontend apps to the live web, and deal with deployment issues

_Developed as part of my Year 2, Semester 1 university studies. Focused on clean code, scalable database design, and a smooth user experience._
