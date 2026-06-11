# Workout Logger

A clean, functional full-stack application for tracking gym sessions. I'm building this to replace messy notes apps with a structured way to log exercises, sets, and weight progress.

This project is currently a **work in progress** as I build out the core features.

---

### 🚀 What it does (so far)
The "plumbing" of the app is solid and ready for data:
*   **Secure Auth:** Fully implemented user registration and login using JWT.
*   **Database Engine:** A PostgreSQL schema designed to handle complex relationships (Workouts → Exercises → Sets).
*   **API:** A Node/Express backend that handles everything from exercise retrieval to multi-set workout logging.
*   **Frontend Connection:** A React (Vite) interface that is now successfully talking to the backend via CORS.

### 🛠 The Tech Stack
*   **Frontend:** React, Material UI (MUI), Axios
*   **Backend:** Node.js, Express
*   **Database:** PostgreSQL (hosted on Neon)
*   **ORM:** Prisma
*   **Authentication:** JSON Web Tokens (JWT)

### 📈 What's next
I'm currently working through the following roadmap:
- [ ] **Dynamic Workout Form:** A MUI-based form to add exercises and sets on the fly.
- [ ] **History Dashboard:** A dedicated view to look back at previous sessions.
- [ ] **Data Validation:** Integrating Zod on the backend to ensure data integrity.
- [ ] **Progress Tracking:** Charts to visualize strength gains over time.
- [ ] **Unit Preference** Currently app uses kg only, aiming to add functionality for other measurement systems.

---
*Developed as part of my Year 2, Semester 1 university studies. Focused on clean code, scalable database design, and a smooth user experience.*
