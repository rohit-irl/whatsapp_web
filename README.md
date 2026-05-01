# WhatsApp Web Clone

A full-stack WhatsApp Web Clone built with React (Vite), Tailwind CSS, Node.js, Express, MongoDB, and Socket.IO.

## Project Structure

```text
whatsapp_web/
├── frontend/
└── backend/
```

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO

## Setup Instructions

### 1) Clone and open the project

```bash
git clone <your-repo-url>
cd whatsapp_web
```

### 2) Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs by default on `http://localhost:5000`.

### 3) Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs by default on `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/whatsapp_web_clone
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Endpoints

- `POST /api/users` -> Create/find user by username
- `GET /api/users` -> Fetch all users
- `POST /api/messages` -> Send message
- `GET /api/messages/:user1/:user2` -> Fetch chat between two users

## Notes

- Users are identified by unique `username`.
- Message text is validated to prevent empty messages.
- Real-time chat updates are delivered using Socket.IO.
