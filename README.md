# SerenitySpace • Backend

**A calming backend built to support emotional wellbeing.**

SerenitySpace is a mental wellness platform where users can vent privately, reflect through journaling, send messages to their future selves, and talk to a supportive AI companion.  
This backend powers all core features — handling secure authentication, data management, real-time delivery, and chatbot responses — with reliability and care.

It’s not just code — it’s the foundation of a space where users can feel safe, heard, and supported.

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
  When due, the message is pushed instantly to the user using Socket.IO — even if they’re mid-session.

- **AI Companion (SerenityBot):**  
  Users can chat with a supportive AI companion, powered by Google Gemini.  
  The bot responds empathetically using a calming system prompt tailored for emotional wellbeing.

- **Dashboard API:**  
  Provides a summarized view of the user’s activity — including latest vents, reflections, and delivered messages — for a clean frontend dashboard experience.

---

## ⚙️ Tech Stack

| Layer               | Technology / Tools                          |
|---------------------|---------------------------------------------|
| Server              | Node.js + Express.js                        |
| Database            | MongoDB + Mongoose                          |
| Realtime            | Socket.IO                                   |
| Scheduling          | node-cron                                   |
| AI Integration      | Google Gemini API                           |
| Auth & Security     | JWT, bcrypt, CORS                           |
| Utilities & Helpers | dotenv, async-handler, api-error, api-response |

---

## 📁 Folder Structure

```
serenityspace-backend/
│
├── src/
│ ├── controllers/ # Route logic per feature (user, vent, reflection, vault, etc.)
│ ├── cron/ # Scheduled tasks (e.g., vault message delivery)
│ ├── db/ # MongoDB connection setup
│ ├── middlewares/ # Auth, error handler, etc.
│ ├── models/ # Mongoose schemas for all collections
│ ├── routes/ # API endpoint definitions
│ ├── services/ # chatbot logic
│ ├── socket/ # WebSocket config and event handlers
│ └── utils/ # Helpers like api-error, api-response, formatters
│
├── app.js # Express app config (routes, middlewares, errors)
├── index.js # Server entry point (DB, server, socket setup)
├── .env # Environment variables
├── package.json # Project metadata, dependencies, and scripts
└── README.md # Project documentation (this file)
```

---

## Environment Setup

Create a `.env` file with:

```env
PORT=5000
MONGODB_URI=<your_mongo_uri>
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CORS_ORIGIN=<your_frontend_url>
GEMINI_API_KEY=<your_api_key>
```

---

## Getting Started (Local Development)

```bash
git clone https://github.com/rishank14/SerenitySpace-Backend.git
cd SerenitySpace-Backend
npm install
npm run dev
```

- Server runs at: `http://localhost:5000`
- All routes, real-time socket, and cron-job systems are live

---

## 📡 API Routes Overview

| Module           | Endpoint                                         | Method(s)     | Description                                      |
|------------------|--------------------------------------------------|---------------|--------------------------------------------------|
| **Users / Auth** | `/api/v1/users/register`                         | POST          | Register a new user                             |
|                  | `/api/v1/users/login`                            | POST          | Login and receive access/refresh tokens         |
|                  | `/api/v1/users/refresh-token`                    | POST          | Generate new access token                       |
|                  | `/api/v1/users/logout`                           | POST          | Logout and clear refresh token                  |
|                  | `/api/v1/users/change-password`                  | POST          | Change current password                         |
|                  | `/api/v1/users/current-user`                     | GET           | Get current logged-in user's data               |
|                  | `/api/v1/users/update-profile`                   | PATCH         | Update user profile                             |
|                  | `/api/v1/users/delete-account`                   | DELETE        | Delete user account                             |

| Module           | Endpoint                                         | Method(s)     | Description                                      |
|------------------|--------------------------------------------------|---------------|--------------------------------------------------|
| **Vents**        | `/api/v1/vents/`                                  | GET           | Get all public vents + user's private vents     |
|                  | `/api/v1/vents/:ventId`                           | GET           | Get a single vent by ID                         |
|                  | `/api/v1/vents/user/:userId`                      | GET           | Get all vents by a specific user                |
|                  | `/api/v1/vents/create`                            | POST          | Create a new vent                               |
|                  | `/api/v1/vents/update/:ventId`                   | PATCH         | Update a vent                                   |
|                  | `/api/v1/vents/delete/:ventId`                   | DELETE        | Delete a vent                                   |

| Module           | Endpoint                                         | Method(s)     | Description                                      |
|------------------|--------------------------------------------------|---------------|--------------------------------------------------|
| **Reflections**  | `/api/v1/reflections/`                            | GET           | Get all reflections (for testing)               |
|                  | `/api/v1/reflections/:reflectionId`              | GET           | Get a single reflection by ID                   |
|                  | `/api/v1/reflections/user/:userId`               | GET           | Get all reflections by a specific user          |
|                  | `/api/v1/reflections/create`                     | POST          | Create a new reflection                         |
|                  | `/api/v1/reflections/update/:reflectionId`       | PATCH         | Update a reflection                             |
|                  | `/api/v1/reflections/delete/:reflectionId`       | DELETE        | Delete a reflection                             |

| Module           | Endpoint                                         | Method(s)     | Description                                      |
|------------------|--------------------------------------------------|---------------|--------------------------------------------------|
| **Message Vault**| `/api/v1/message-vault/create`                   | POST          | Create a scheduled message                      |
|                  | `/api/v1/message-vault/update/:messageId`        | PATCH         | Update an upcoming message                      |
|                  | `/api/v1/message-vault/delete/:messageId`        | DELETE        | Delete a message                                |
|                  | `/api/v1/message-vault/delivered/:userId`        | GET           | Get all delivered messages for a user           |
|                  | `/api/v1/message-vault/upcoming/:userId`         | GET           | Get all upcoming (scheduled) messages           |
|                  | `/api/v1/message-vault/:messageId`               | GET           | Get a specific message by ID                    |

| Module           | Endpoint                                         | Method(s)     | Description                                      |
|------------------|--------------------------------------------------|---------------|--------------------------------------------------|
| **Dashboard**    | `/api/v1/dashboard/`                              | GET           | Get summary of recent activity                  |

| Module           | Endpoint                                         | Method(s)     | Description                                      |
|------------------|--------------------------------------------------|---------------|--------------------------------------------------|
| **Chatbot**      | `/api/v1/chatbot/chat`                            | POST          | Send message to SerenityBot and receive reply   |

---

## Real-time Engine

- **Cron Job**: Runs every minute to scan for vault messages due for delivery
- **Message Delivery**: Uses Socket.IO to push messages instantly to active sessions

---

## Chatbot Integration

`serenity-bot` features a calming system prompt via the Gemini Generative AI API, ensuring supportive, human-like replies for emotional support.

---

## 🚀 Deployment

This backend is deployed on **Render** and tested in a production environment.  
It fully supports WebSocket connections (for real-time delivery) and runs smoothly with scheduled background jobs.

---

## 👤 Author

**Rishank Kalra**  
