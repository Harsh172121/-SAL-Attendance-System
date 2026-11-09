# SAL Education - Attendance Management System

![Project Poster](projectlogo.png)

A comprehensive College Attendance Management System built with React (Vite), Node.js (Express), and PostgreSQL (Sequelize).


## 🚀 Features

- **Multi-Role Authentication**: Secure login for Admins, Teachers, and Students.
- **Admin Dashboard**: Manage Students, Teachers, Classes, Batches, and Subjects.
- **Attendance Tracking**: Teachers can mark and view attendance for theory and lab sessions.
- **Proxy Management**: Teachers can request and approve proxy lectures.
- **Student Portal**: Students can view their attendance reports and apply for leave.
- **Data Import**: Supports importing data via CSV and XML files.
- **Detailed Reports**: Comprehensive attendance reports for analysis.

---

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL, Sequelize ORM v6
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies

---

## 📦 Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- PostgreSQL server and client tools

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/sal-attendance-system.git
cd sal-attendance-system
```

### 3. Install Dependencies
Install dependencies for both the root project (frontend) and the backend.

```bash
# Install root/frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 4. Environment Variables
1. Go to the `backend` folder.
2. Create a `.env` file from the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
3. Set PostgreSQL connection values in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sal_attendance
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=any_random_secret_string
   ```

The initial PostgreSQL schema migration is in `backend/migrations/001_initial_schema.js`. The backend does not create or alter tables at startup; after confirming the target database is empty and configured, apply the versioned schema with `cd backend && npm run db:migrate`. Any MySQL data migration remains a separate future task.

### Database troubleshooting
- `Missing required PostgreSQL configuration`: check that `DB_NAME`, `DB_USER`, and `DB_PASSWORD` are present in `backend/.env` (an empty password is allowed if your local PostgreSQL authentication uses it).
- Connection refused: confirm the PostgreSQL service is running and `DB_HOST` / `DB_PORT` point to it.
- Authentication failed: verify the PostgreSQL role and password with the database administrator; the application does not print credentials.
- Missing relation/table: the database has not had its migrations applied. Startup does not create tables. See [`backend/migrations/README.md`](backend/migrations/README.md).
- The PostgreSQL database itself must be created separately before migrations or application use.

### 5. Schema and sample data
Do not run the seeder until a PostgreSQL schema migration has been reviewed and applied. The seeder is destructive: when intentionally used, it clears application tables before adding demo data.

```bash
cd backend
npm run seed -- --reset
cd ..
```

The old `reset-users.js` utility is retired because it disabled foreign-key checks and changed a required column to nullable.

---

## 🚦 Running the Project

You can start both the frontend and backend simultaneously from the root directory:

```bash
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔐 Login Credentials (After Seeding)

**Admin:**
- Email: `admin@sal.edu`
- Password: `admin123`

**Teacher (Example):**
- Email: `rajesh@sal.edu`
- Password: `teacher123`

**Student (Example):**
- Email: `rahul@sal.edu`
- Password: `student123`

---

## 📄 License
This project is for educational purposes at SAL Education.
