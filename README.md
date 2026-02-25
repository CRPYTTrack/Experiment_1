# CryptoTrack

A web application to track real-time cryptocurrency prices, manage a personal portfolio, and maintain a watchlist of favorite coins.

## Table of Contents

- [Description](#description)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Attributions](#attributions)
- [Contact](#contact)

## Description

CryptoTrack is a web application that allows users to track real-time cryptocurrency prices, manage their portfolio, and maintain a watchlist. Users can register, log in, add/remove coins to their portfolio or watchlist, and export their portfolio data as PDF or CSV reports. This project was developed as part of an internship at Ultimez Technology Pvt Ltd.

## Features

- User authentication (register, login, logout)
- Real-time cryptocurrency prices (via CoinGecko API)
- Search cryptocurrency
- Add/remove coins to portfolio and watchlist
- Portfolio performance analytics (profit/loss, allocation chart, top gainers, top losers)
- Export your portfolio report in both PDF and CSV formats
- View portfolio values in different fiat currencies (via Frankfurter API)
- Dark mode support with theme persistence

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT, Passport.js
- **APIs:** CoinGecko (crypto data), Frankfurter (currency conversion)
- **Key Libraries:**
    - `axios`: For making API requests
    - `recharts`: For creating pie chart and bar chart
    - `framer-motion`: For UI animations
    - `jspdf` & `jspdf-autotable`: For generating PDF reports
    - `react-toastify`: For alerts

## Screenshots

### Home Page
<img src="./images/home.png" alt="Home Page" width="800px">
Search and view top cryptocurrencies, add to watchlist or portfolio.

### Login Page
<img src="./images/login.png" alt="Login Page" width="800px">
Login for registered users.

### Sign Up Page
<img src="./images/signup.png" alt="Sign Up Page" width="800px">
Register a new account.

### Dashboard
<img src="./images/dashboard-top.png" alt="Dashboard - Top" width="800px">
<br>
<img src="./images/dashboard-bottom.png" alt="Dashboard - Bottom" width="800px">
View portfolio summary, allocation charts, and top gainers/losers.

### Watchlist
<img src="./images/watchlist.png" alt="Watchlist" width="800px">
Manage your favorite coins.

### Dark Mode
<img src="./images/dark.png" alt="Dark Mode" width="800px">
Toggle between light and dark themes with persistent preference.

### Exported PDF
<img src="./images/pdf.png" alt="Exported PDF" width="800px">
Downloadable portfolio report in PDF format.

### Exported CSV
<img src="./images/csv.png" alt="Exported CSV" width="800px">
Downloadable portfolio report in CSV format.

## Getting Started

Follow these instructions to set up and run the project locally on your machine.

### Prerequisites

- Node.js (v18 or later recommended)
- Git
- A [Supabase](https://supabase.com) account and project

### 1. Clone the Repository

```bash
git clone https://github.com/JoyM268/CryptoTrack.git
cd CryptoTrack
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** in your project and run the following to create the required tables:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, coin)
);

CREATE TABLE portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  total_investment NUMERIC(20, 8) NOT NULL DEFAULT 0,
  coins NUMERIC(20, 8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, coin)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX idx_portfolio_user_coin ON portfolio(user_id, coin);
```

3. Go to **Project Settings → API** and note down your **Project URL** and **service_role** secret key

### 3. Backend Setup

Navigate to the server directory and install dependencies.

```bash
cd Server
npm install
```

#### Environment Variables

Create a `.env` file in the `Server` directory and add the following:

```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"
PORT=3000
CLIENT="http://localhost:5173"
JWT_SECRET="your-jwt-secret"
```

#### Run the Backend Server

```bash
npm run dev
```

The server will start at **http://localhost:3000**.

### 4. Frontend Setup

In a new terminal, navigate to the client directory and install dependencies.

```bash
# From the root CryptoTrack directory
cd Client
npm install
```

#### Environment Variables

Create a `.env` file in the `Client` directory and add the following:

```env
VITE_API_URL="http://localhost:3000"
```

#### Run the Frontend

```bash
npm run dev
```

The application should now be running at **http://localhost:5173**.

## Attributions

- Cryptocurrency data provided by [CoinGecko API](https://www.coingecko.com/en/api).
- Currency conversion powered by [Frankfurter API](https://www.frankfurter.app/).
