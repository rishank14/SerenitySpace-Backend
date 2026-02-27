# SerenitySpace • Backend

**A calming backend built to support emotional wellbeing.**

SerenitySpace is a mental wellness platform where users can vent privately, reflect through journaling, send messages to their future selves, and talk to a supportive AI companion.  
This backend powers all core features — handling secure authentication, data management, real-time delivery, and chatbot responses — with reliability and care.

It's not just code — it's the foundation of a space where users can feel safe, heard, and supported.

---

## 🧩 Overview

This backend provides the API and real-time infrastructure for SerenitySpace — enabling users to express emotions, reflect on thoughts, receive timed messages, and engage with an empathetic AI chatbot.

It is built for clarity, stability, and emotional impact — with real-time communication, scheduled message delivery, and modular architecture.

---

## 🚀 Features

- **Authentication System:**  
  Complete user auth flow with registration, login, JWT-based access and refresh tokens, profile updates, password change, logout, and account deletion.

- **Venting System:**  
  Users can express their thoughts through vents — either privately or publicly.  
  All public vents are visible to other users anonymously, fostering shared expression without judgment.

- **Reflection Journal:**  
  A private, secure journaling space for users to write, update, and delete personal reflections.  
  No prompts — just free, open-ended emotional writing.

- **Message Vault:**  
  Users can write future messages to themselves and schedule them for a specific delivery time.  
  Ideal for motivation, reminders, or emotional anchoring.

- **Real-Time Delivery Engine:**  
  A background cron job checks every minute for scheduled messages.  
  When due, the message is pushed instantly to the user using Socket.IO — even if they're mid-session.

- **AI Companion (SerenityBot):**  
  Users can chat with a supportive AI companion, powered by Google Gemini.  
  The bot responds empathetically using a calming system prompt tailored for emotional wellbeing.

- **Dashboard API:**  
  Provides a summarized view of the user's activity — including latest vents, reflections, and delivered messages — for a clean frontend dashboard experience.

---

## ⚙️ Tech Stack

| Layer           | Technology / Tools                                           |
| --------------- | ------------------------------------------------------------ |
| Server          | Node.js + Express 5                                          |
| Database        | MongoDB + Mongoose                                           |
| Real-time       | Socket.IO                                                    |
| Scheduling      | node-cron                                                    |
| AI Integration  | Google Gemini 2.0 Flash                                      |
| Auth & Security | JWT, bcrypt, CORS, HTTP-only cookies                         |
| Utilities       | dotenv, cookie-parser, async-handler, ApiError / ApiResponse |

---

## 📁 Folder Structure

```
server/
│
├── src/
│   ├── controllers/        # Route logic per feature (user, vent, reflection, vault, etc.)
│   ├── cron/               # Scheduled tasks (e.g., vault message delivery)
│   ├── db/                 # MongoDB connection setup
│   ├── middlewares/         # Auth middleware, error handler
│   ├── models/             # Mongoose schemas for all collections
│   ├── routes/             # API endpoint definitions
│   ├── services/           # Gemini AI chatbot logic
│   ├── socket/             # WebSocket config and event handlers
│   ├── utils/              # ApiError, ApiResponse, asyncHandler
│   ├── app.js              # Express app config (routes, middlewares, CORS)
│   └── index.js            # Server entry point (DB, HTTP server, Socket.IO)
│
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

---

## 🔧 Environment Setup

Create a `.env` file in the `server/` directory:

```env
PORT=7000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/serenityspace
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## 🏁 Getting Started

```bash
cd server
npm install
npm run dev
```

- Server runs at: `http://localhost:7000`
- All routes, real-time socket, and cron-job systems are live

---

## 📡 API Routes Overview

All routes are prefixed with `/api/v1`

### Authentication — `/users`

| Method   | Endpoint           | Auth | Description               |
| -------- | ------------------ | ---- | ------------------------- |
| `POST`   | `/register`        | —    | Create a new account      |
| `POST`   | `/login`           | —    | Login (email or username) |
| `POST`   | `/refresh-token`   | —    | Refresh access token      |
| `POST`   | `/logout`          | JWT  | Logout and clear tokens   |
| `POST`   | `/change-password` | JWT  | Update password           |
| `GET`    | `/current-user`    | JWT  | Get current user profile  |
| `PATCH`  | `/update-profile`  | JWT  | Update email/username     |
| `DELETE` | `/delete-account`  | JWT  | Delete account + all data |

### Vents — `/vents`

| Method   | Endpoint          | Auth | Description                    |
| -------- | ----------------- | ---- | ------------------------------ |
| `GET`    | `/`               | JWT  | All public + own private vents |
| `GET`    | `/:ventId`        | JWT  | Get single vent                |
| `GET`    | `/user/:userId`   | JWT  | Get user's vents               |
| `POST`   | `/create`         | JWT  | Create a vent                  |
| `PATCH`  | `/update/:ventId` | JWT  | Update own vent                |
| `DELETE` | `/delete/:ventId` | JWT  | Delete own vent                |

### Reflections — `/reflections`

| Method   | Endpoint                | Auth | Description            |
| -------- | ----------------------- | ---- | ---------------------- |
| `GET`    | `/`                     | JWT  | All own reflections    |
| `GET`    | `/:reflectionId`        | JWT  | Get single reflection  |
| `GET`    | `/user/:userId`         | JWT  | Get user's reflections |
| `POST`   | `/create`               | JWT  | Create a reflection    |
| `PATCH`  | `/update/:reflectionId` | JWT  | Update own reflection  |
| `DELETE` | `/delete/:reflectionId` | JWT  | Delete own reflection  |

### Message Vault — `/message-vault`

| Method   | Endpoint             | Auth | Description               |
| -------- | -------------------- | ---- | ------------------------- |
| `POST`   | `/create`            | JWT  | Schedule a future message |
| `PATCH`  | `/update/:messageId` | JWT  | Edit (if not delivered)   |
| `DELETE` | `/delete/:messageId` | JWT  | Delete any message        |
| `GET`    | `/delivered/:userId` | JWT  | Get delivered messages    |
| `GET`    | `/upcoming/:userId`  | JWT  | Get scheduled messages    |
| `GET`    | `/:messageId`        | JWT  | Get single message        |

### Dashboard & Chatbot

| Method | Endpoint        | Auth | Description                 |
| ------ | --------------- | ---- | --------------------------- |
| `GET`  | `/dashboard/`   | JWT  | Get aggregated user stats   |
| `POST` | `/chatbot/chat` | JWT  | Send message to SerenityBot |

---

## 🚀 Deployment

This backend is deployed on **Render** and tested in a production environment.  
It fully supports WebSocket connections (for real-time delivery) and runs smoothly with scheduled background jobs.

---

## 👤 Author

**Rishank Kalra**
