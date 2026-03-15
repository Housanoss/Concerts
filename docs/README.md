#  The Ticket Stand

A full-stack web application for browsing and purchasing concert tickets. All tickets are sold exclusively by **The Ticket Stand** — one trusted seller, no third-party listings.

>  Repository: [https://github.com/Housanoss/Concerts](https://github.com/Housanoss/Concerts)

---

## Summary

The Ticket Stand is a student full-stack project built with **React** on the frontend and **ASP.NET Core** on the backend, connected to a **MySQL** database. Users can browse concerts, create an account, log in, and purchase Standard or VIP tickets. The app includes a role-based access system — regular users manage their own tickets and profile, while admins can create, edit, and delete concerts and manage ticket supply. Authentication is handled via **JWT tokens** with **BCrypt** password hashing.

---

##  Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the App](#running-the-app)

---

## About

**The Ticket Stand** is a full-stack concert ticket platform. Users can browse upcoming concerts, register an account, sign in, and purchase Standard or VIP tickets. An admin role allows managing concerts and ticket supply directly through the API.

---

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 19, TypeScript, Vite                    |
| Backend  | ASP.NET Core (.NET 8), Entity Framework Core  |
| Database | MySQL                                         |
| Auth     | JWT tokens, BCrypt password hashing           |

---

## Project Structure

```
Concerts/
├── Concerts-API/
│   ├── Concerts-API/
│   │   ├── Controllers/
│   │   │   ├── AuthenticatorController.cs
│   │   │   ├── BandController.cs
│   │   │   ├── ConcertsController.cs
│   │   │   ├── TicketsController.cs
│   │   │   └── UserController.cs
│   │   ├── Data/
│   │   │   └── dbConcerts.cs         # EF Core DbContext
│   │   ├── Entities/
│   │   │   ├── Bands.cs
│   │   │   ├── Concerts.cs
│   │   │   ├── Tickets.cs
│   │   │   └── Users.cs
│   │   ├── Users/                    # Auth & security
│   │   │   ├── LoginUser.cs
│   │   │   ├── PasswordHasher.cs
│   │   │   ├── RegisterUser.cs
│   │   │   └── TokenProvider.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── concerts-web/
│       └── src/
│           ├── Components/
│           │   ├── ConcertList.tsx
│           │   └── SignIn.tsx
│           ├── App.tsx
│           └── main.tsx
└── docs/
```

---

## Database Schema

The app uses a MySQL database with 4 tables.

---

### `Concert`

Represents a concert event. One concert can have many tickets.

| Column        | Type           | Description                                      |
|---------------|----------------|--------------------------------------------------|
| `Id`          | `int`          | Primary key                                      |
| `Date`        | `DateTime`     | Date of the concert                              |
| `Venue`       | `text`         | Location or venue name                           |
| `Bands`       | `varchar(255)` | Comma-separated list of performing artists       |
| `Price`       | `varchar(255)` | Base ticket price                                |
| `Sold_out`    | `bool`         | Whether the concert is sold out                  |
| `Description` | `text`         | Description of the concert                       |
| `Genres`      | `text`         | Genre tags                                       |

---

### `Tickets`

Represents a purchased ticket, linking a user to a concert. Supports `Standard` and `VIP` types — VIP is priced at 1.5× the base concert price.

| Column       | Type           | Description                          |
|--------------|----------------|--------------------------------------|
| `Id`         | `int`          | Primary key                          |
| `Concert_id` | `int`          | Foreign key → `Concert`              |
| `User_id`    | `int`          | Foreign key → `Users`                |
| `Price`      | `decimal(10,0)`| Final price paid for the ticket      |
| `Type`       | `text`         | Ticket type: `Standard` or `VIP`     |

---

### `Users`

Represents a registered user. Roles are embedded in the JWT token and used for access control throughout the API.

| Column     | Type           | Description                              |
|------------|----------------|------------------------------------------|
| `Id`       | `int`          | Primary key                              |
| `Username` | `varchar(255)` | Display name                             |
| `Email`    | `varchar(255)` | Login email (must be unique)             |
| `Password` | `varchar(255)` | BCrypt hashed password                   |
| `Role`     | `string`       | `User` (default) or `Admin`              |

---

### `Band`

Represents a music artist or band.

| Column        | Type           | Description              |
|---------------|----------------|--------------------------|
| `Id`          | `int`          | Primary key              |
| `Band_name`   | `varchar(255)` | Name of the artist/band  |
| `Genres`      | `text`         | Genre tags               |
| `Description` | `text`         | Bio or description       |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm
- [.NET SDK](https://dotnet.microsoft.com/download) v8+
- A running MySQL server

### Backend Setup

1. Navigate to the API project:
```bash
cd Concerts-API/Concerts-API
```

2. Configure your database and JWT settings in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=...;database=...;user=...;password=..."
  },
  "Jwt": {
    "Secret": "your-secret-key",
    "Issuer": "your-issuer",
    "Audience": "your-audience",
    "ExpirationInMinutes": 60
  }
}
```

3. Restore and run:
```bash
dotnet restore
dotnet run
```

### Frontend Setup

```bash
cd Concerts-API/concerts-web
npm install
npm run dev
```

---

## Running the App

Both services must run at the same time:

| Service  | Command       | URL                       |
|----------|---------------|---------------------------|
| API      | `dotnet run`  | `https://localhost:7000`  |
| Frontend | `npm run dev` | `http://localhost:5077`   |

>  CORS is configured to allow `http://localhost:5077`. Update the origin in `Program.cs` if your frontend runs on a different port.

---
