# 🚀 Placement Portal

A modern, full-stack web application designed to manage, streamline, and automate college/university placement drives. The platform connects students with job opportunities and provides administrators with robust tools to manage applications, jobs, and recruitment analytics.

---

## 🌟 Key Features

### 👨‍🎓 For Students
- **Profile Management**: Build and update personal profiles, including uploading resume PDFs.
- **Job Discovery**: Browse, filter, and view details of available job postings.
- **Application Tracking**: Apply to jobs with a single click and track the status of applications (e.g., *Pending*, *Shortlisted*, *Rejected*) in real-time.

### 👩‍💼 For Admins
- **Admin Dashboard**: View comprehensive placement statistics (total jobs, total applicants, shortlist rates).
- **Job Management**: Create, edit, and delete job postings.
- **Applicant Management**: View resumes, filter applicants, and update application statuses dynamically.

### 🔒 Core Security
- **Authentication**: JWT (JSON Web Token) based user authentication.
- **Session Security**: Secured using **HTTP-only Cookies** to store the JWT, preventing XSS-based token theft and enabling automatic session management.
- **Password Hashing**: Bcrypt encryption for storing user credentials.
- **Protected Routes**: Middleware routing to separate public, student-only, and admin-only pages.


---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 19** & **Vite** | Modern, fast UI render library and build tool |
| **Styling** | **Tailwind CSS v4** | Utility-first CSS styling engine |
| **Routing** | **React Router v7** | Declarative routing for single-page applications |
| **Backend** | **Node.js** & **Express** | Fast, minimalist server framework running in ES Modules mode |
| **Database** | **MongoDB** & **Mongoose** | Flexible document database with schema modeling |
| **HTTP Client** | **Axios** | Promised-based HTTP request client for API integration |

---

## 📁 Repository Structure

```text
PLACEMENT-PORTAL/
├── backend/
│   ├── config/             # DB connection config
│   ├── controllers/        # Express request handlers (auth, job, application, dashboard)
│   ├── middleware/         # Auth verification and admin checks
│   ├── models/             # Mongoose schemas (User, Job, Application)
│   ├── routes/             # Express API endpoints
│   ├── public/uploads/     # Stored resumes and documents (local only)
│   ├── server.js           # Server startup script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/         # Images, icons, global styling
│   │   ├── components/     # UI kit and layouts (Button, Input, Sidebar, Navbar)
│   │   ├── context/        # Global authentication state
│   │   ├── pages/          # Page components (Dashboard, Profile, Login, Jobs)
│   │   ├── services/       # Axios API instances
│   │   ├── App.jsx         # Application routing root
│   │   └── main.jsx        # DOM entrypoint
│   └── package.json
```

---

## ⚙️ Getting Started & Installation

### Prerequisites
Make sure you have **Node.js (v18+)** and **MongoDB** installed on your system.

### 1. Backend Setup
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder and add the following configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/placement-portal
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend server in development mode:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

---

### 2. Frontend Setup
1. Open another terminal and navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install the client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 📄 License
Distributed under the ISC License. See `LICENSE` for more information.
