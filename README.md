# FleetHub

> **Multi-client fleet & logistics management SaaS platform**

FleetHub is a full-stack MERN web application designed for businesses to manage their delivery fleet operations through a single, centralized system. Built for the Indian market (Maharashtra region), it supports multiple business clients such as Domino's, KFC, BigBasket, Apollo Pharmacy, D-Mart, and Blinkit.

---

## Tech Stack

### Frontend

| Technology       | Purpose                    |
| ---------------- | -------------------------- |
| React 19         | UI library                 |
| Vite             | Build tool & dev server    |
| Tailwind CSS     | Utility-first CSS          |
| React Router DOM | Client-side routing        |
| Axios            | HTTP client                |
| React Hook Form  | Form management            |
| Zod              | Schema validation          |
| React Hot Toast  | Toast notifications        |
| React Icons      | Icon library               |
| Recharts         | Charts & data viz          |

### Backend

| Technology            | Purpose                   |
| --------------------- | ------------------------- |
| Node.js               | Runtime                   |
| Express.js            | Web framework             |
| MongoDB               | Database                  |
| Mongoose              | ODM                       |
| JWT                   | Authentication            |
| bcryptjs              | Password hashing          |
| multer                | File uploads              |
| helmet                | Security headers          |
| morgan                | HTTP logging              |
| express-rate-limit    | Rate limiting             |
| express-validator     | Input validation          |
| cors                  | Cross-origin support      |
| cookie-parser         | Cookie handling            |

---

## Folder Structure

```
FleetHub/
├── client/                  # React Frontend
│   ├── public/              # Static assets
│   └── src/
│       ├── api/             # Axios service layer
│       ├── assets/          # Images, icons, fonts
│       ├── components/      # Reusable UI components
│       │   ├── charts/      # Chart components
│       │   ├── common/      # Buttons, modals, loaders, etc.
│       │   ├── forms/       # Form building blocks
│       │   ├── layout/      # Header, Sidebar, Footer, MainLayout
│       │   ├── maps/        # Map components
│       │   └── tables/      # Data table components
│       ├── config/          # App, API, route, sidebar, role config
│       ├── constants/       # Enums (roles, statuses, vehicle types, etc.)
│       ├── context/         # React context providers
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Feature pages (auth, dashboard, clients, etc.)
│       ├── router/          # App router, private/role routes
│       ├── styles/          # Global CSS, variables, animations
│       └── utils/           # Helpers, formatters, validators
│
├── server/                  # Express Backend
│   ├── config/              # DB, CORS, env, logger, multer, rate limiter
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth, error, role, validation middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express route definitions
│   ├── seeds/               # Database seed scripts
│   ├── services/            # Business logic layer
│   ├── templates/           # Email templates
│   ├── tests/               # Unit & integration tests
│   ├── uploads/             # User-uploaded files
│   ├── utils/               # API helpers, error classes, pagination
│   └── validators/          # express-validator schemas
│
├── .gitignore
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/FleetHub.git
   cd FleetHub
   ```

2. **Install client dependencies**

   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**

   ```bash
   cd ../server
   npm install
   ```

---

## Environment Variables

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=FleetHub
VITE_APP_VERSION=1.0.0
VITE_MAP_API_KEY=your_map_api_key_here
```

### Server (`server/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/fleethub

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password_here
FROM_EMAIL=noreply@fleethub.com
FROM_NAME=FleetHub

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=dev
```

> Copy `.env.example` to `.env` in both `client/` and `server/` directories and fill in your values.

---

## Running the Application

### Start the Backend (API Server)

```bash
cd server
npm run dev
```

The API server runs at **http://localhost:5000**.

Verify it's running:

```bash
curl http://localhost:5000/api/v1/health
# → { "success": true, "message": "FleetHub API Running" }
```

### Start the Frontend (React Dev Server)

```bash
cd client
npm run dev
```

The client runs at **http://localhost:5173** with API requests proxied to port 5000.

---

## Available Scripts

### Client

| Script          | Command           | Description               |
| --------------- | ----------------- | ------------------------- |
| `npm run dev`   | `vite`            | Start dev server          |
| `npm run build` | `vite build`      | Production build          |
| `npm run preview` | `vite preview`  | Preview production build  |
| `npm run lint`  | `eslint .`        | Lint source files         |

### Server

| Script          | Command             | Description               |
| --------------- | ------------------- | ------------------------- |
| `npm run dev`   | `nodemon server.js` | Start with auto-reload    |
| `npm start`     | `node server.js`    | Start production server   |
| `npm run seed`  | `node seeds/index.js` | Seed database           |
| `npm run lint`  | `eslint .`          | Lint source files         |

---

## Currency & Region

- **Region:** India (Maharashtra)
- **Currency:** Indian Rupee (₹ / INR)
- **Date Format:** DD/MM/YYYY

---

## License

This project is proprietary. All rights reserved.
