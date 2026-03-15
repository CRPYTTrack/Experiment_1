# Local Setup Guide

This guide walks you through setting up the CryptoTrack application on your local machine for development purposes.

## Prerequisites
-   **Node.js**: v18 or newer recommended.
-   **Git**: For cloning the repository.
-   **Supabase Account**: You will need a Supabase project for the PostgreSQL database.

## 1. Supabase Initialization
1.  Log in to [Supabase](https://supabase.com/) and create a new project.
2.  Navigate to the **SQL Editor** in the Supabase dashboard.
3.  Run the necessary table creation SQL script (found in the main `README.md`) to set up `users`, `watchlist`, `portfolio`, and `alerts` tables.
4.  Navigate to **Project Settings -> API** and copy your **Project URL** and **`service_role` secret key**.

## 2. Clone the Repository
Open your terminal and clone the GitHub repository:
```bash
git clone <REPO_CLONE_URL>
cd <REPO_DIRECTORY>
```

## 3. Backend (Server) Setup
1. Navigate to the Server directory:
   ```bash
   cd Server
   npm install
   ```
2. Create a `.env` file in the `Server` directory with the following variables:
   ```env
   SUPABASE_URL="https://your-project-id.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-secret"
   PORT=3000
   CLIENT="http://localhost:5173"
   JWT_SECRET="generate-a-random-secret-string"
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:3000`.

## 4. Frontend (Client) Setup
1. Open a new terminal window/tab and navigate to the Client directory:
   ```bash
   cd Client
   npm install
   ```
2. Create a `.env` file in the `Client` directory:
   ```env
   VITE_API_URL="http://localhost:3000"
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## 5. Development Workflow
- When making backend changes, `nodemon` (invoked via `npm run dev`) will automatically restart the Express server.
- The Vite development server provides Hot Module Replacement (HMR) for the React frontend, reflecting layout changes instantly.
