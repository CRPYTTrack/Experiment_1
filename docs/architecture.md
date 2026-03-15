# System Architecture

## Overview
CryptoTrack is a modern web application built with a decoupled architecture, using a React frontend and an Express.js backend, communicating via RESTful APIs. It leverages a Supabase PostgreSQL database for persistent storage and uses external APIs for real-time cryptocurrency data and currency conversion.

## Tech Stack
-   **Frontend**: React, React Router, Tailwind CSS, Framer Motion, Recharts
-   **Backend**: Node.js, Express.js
-   **Database**: Supabase (PostgreSQL)
-   **Authentication**: Passport.js (Local & JWT strategies)
-   **External APIs**:
    -   CoinGecko API: Real-time cryptocurrency prices and market data
    -   Frankfurter API: Fiat currency conversion rates

## Component Layers

### 1. Frontend Layer (Client)
The frontend is a Single Page Application (SPA) built with Vite and React. It is responsible for user interactions and rendering data.
-   **State Management**: React state and context (if applicable) for managing local UI state.
-   **Routing**: Handled by `react-router-dom` for navigating between pages like Home, Dashboard, Watchlist, and Authentication.
-   **Styling**: Utilizes Tailwind CSS for utility-first styling and response layouts.
-   **Data Visualization**: Uses `react-google-charts` and `recharts` to render asset allocation and line/bar charts.
-   **Exporting Data**: `jspdf` and `jspdf-autotable` are utilized for generating downloadable PDF reports of the user's portfolio.

### 2. Backend Layer (Server)
An Express.js REST API serving the frontend requests.
-   **Authentication Flow**:
    -   **Register**: Hashes user passwords using `bcrypt` and stores the credentials in the database.
    -   **Login**: Validates credentials using `passport-local` and issues a JSON Web Token (JWT).
    -   **Protected Routes**: Validates the incoming JWT using `passport-jwt` before fulfilling the request.
-   **Business Logic**: Handles the logic for managing watchlist coins, tracking portfolio transactions, and setting price alerts.
-   **CORS Configuration**: Explicitly configured to allow requests from the designated client URL.

### 3. Database Layer (Supabase / PostgreSQL)

The database schema is designed to manage user identities, watchlists, portfolio holdings, and alerts.

**Tables:**

-   **`users`**:
    -   `id` (UUID, Primary Key)
    -   `username` (TEXT, Unique)
    -   `password` (TEXT, Hashed)
    -   `created_at` (TIMESTAMPTZ)
-   **`watchlist`**:
    -   `id` (UUID, Primary Key)
    -   `user_id` (UUID, Foreign Key -> `users.id`)
    -   `coin` (TEXT)
    -   `added_at` (TIMESTAMPTZ)
-   **`portfolio`**:
    -   `id` (UUID, Primary Key)
    -   `user_id` (UUID, Foreign Key -> `users.id`)
    -   `coin` (TEXT)
    -   `total_investment` (NUMERIC)
    -   `coins` (NUMERIC) - Quantity of the asset held
    -   `updated_at` (TIMESTAMPTZ)
-   **`alerts`**:
    -   `id` (UUID, Primary Key)
    -   `user_id` (UUID, Foreign Key -> `users.id`)
    -   `coin_id` (TEXT)
    -   `coin_name` (TEXT)
    -   `coin_image` (TEXT)
    -   `target_price` (NUMERIC)
    -   `condition` (TEXT: 'above' | 'below')
    -   `created_at` (TIMESTAMPTZ)

Relations are strictly enforced using foreign keys, with cascading deletes on `user_id` ensuring data integrity if a user account is removed.
