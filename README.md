# 📋 Full Stack Task Manager

A collaborative, real-time task management dashboard built with the **PERN Stack** (PostgreSQL, Express, React, Node.js). This application works like a team Kanban board, featuring live updates, drag-and-drop task management, and secure authentication.

---

## 🚀 Key Features

* **Authentication**: Secure user registration and login using **JWT** and **BCrypt**
* **Real-Time Collaboration**: Tasks update instantly across all connected users via **Socket.io**
* **Kanban Dashboard**: Drag-and-drop tasks between stages: **Todo, In Progress, Review, Done**
* **Smart Filtering**: View **My Tasks**, **Overdue**, or **All Tasks**
* **Sorting**: Sort by **Due Date** or **Priority** (Urgent / High / Medium / Low)
* **Validation**: Strong backend validation using **Zod**
* **Responsive UI**: Clean, modern, mobile-friendly interface built with **Tailwind CSS**

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* Axios (with interceptors)
* Socket.io-client

### Backend

* Node.js & Express
* Prisma ORM
* Socket.io (real-time events)
* Jest (unit testing)

### Database

* PostgreSQL (Supabase)

---

## 🏃‍♂️ Getting Started

Follow these instructions to run the project locally.

### 1. Prerequisites

* Node.js (v16 or higher)
* npm
* PostgreSQL database (local or Supabase)

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
```

### Database Setup

1. Create a `.env` file inside the `backend` folder
2. Add your PostgreSQL / Supabase connection string
3. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

### Start Backend Server

```bash
npm run dev
```

Backend API will run at:

```
http://localhost:4000
```

---

## 🎨 Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

## 🧪 Running Tests

The backend includes unit tests for authentication and task logic.

```bash
cd backend
npx jest
```

**Expected Result:** All tests should pass ✅

---

## 🔑 Environment Variables

Create a `.env` file in the `backend` folder with the following values:

```env
# Backend Port
PORT=4000

# Database Connection (Supabase / PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# JWT Secret
JWT_SECRET="your_secret_key_here"
```

---

## 📝 API Endpoints Overview

| Method | Endpoint       | Description                 | Protected |
| ------ | -------------- | --------------------------- | --------- |
| POST   | /auth/register | Register a new user         | ❌         |
| POST   | /auth/login    | Login and receive JWT token | ❌         |
| GET    | /tasks         | Fetch all tasks             | ✅         |
| POST   | /tasks         | Create a new task           | ✅         |
| PATCH  | /tasks/:id     | Update task status/details  | ✅         |
| DELETE | /tasks/:id     | Delete a task               | ✅         |

---

## 📂 Project Structure

```
root
├── backend/
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth middleware
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── tests/       # Unit tests
│   └── index.ts         # Entry point & Socket.io setup
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Login, Register, Dashboard
    │   ├── lib/         # Axios & Socket configuration
    │   └── types/       # TypeScript interfaces
    └── ...
```



### ⭐ If you like this project, consider giving it a star on GitHub!
