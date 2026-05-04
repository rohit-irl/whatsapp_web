# WhatsApp Web Clone 📱

A high-performance, real-time WhatsApp Web clone built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. This project replicates the core features of WhatsApp Web, including instant messaging, voice/video calls, status updates, and group chats.

![WhatsApp Web Clone Preview](https://via.placeholder.com/1200x600?text=WhatsApp+Web+Clone+Preview)

## ✨ Features

- **Real-time Messaging**: Instant message delivery using WebSockets.
- **Voice & Video Calls**: Robust signaling system for real-time communication.
- **Group Chats**: Create and manage groups with multiple participants.
- **Status Updates**: Share and view ephemeral status updates (stories).
- **Typing Indicators**: Live "typing..." status for individual and group chats.
- **Message Receipts**: Sent, Delivered, and Read receipts (ticks).
- **Delete for Everyone**: Remove messages for all participants in a chat.
- **Starred Messages**: Save important messages for quick access.
- **Responsive UI**: Pixel-perfect design using Tailwind CSS 4.
- **Authentication**: Secure JWT-based login and signup.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: React Hooks & Context API
- **Real-time**: Socket.IO Client
- **API Client**: Axios
- **Routing**: React Router Dom 7

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Real-time**: Socket.IO
- **Security**: Bcrypt.js (Password hashing)
- **Environment**: Dotenv

## 📂 Project Structure

```text
whatsapp-web-clone/
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # UI components (Panels, Bubbles, etc.)
│   │   ├── context/         # Auth & Socket contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Main application views
│   │   └── App.jsx          # Root component
│   └── vite.config.js
├── backend/                 # Express server
│   ├── config/              # Database connection
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── socket/              # WebSocket event handlers
│   └── server.js            # Entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rohit-irl/whatsapp_web.git
   cd whatsapp-web-clone
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env and add your MONGO_URI

   # Start the server (Option 1: Nodemon for auto-restart)
   npm run dev

   # Start the server (Option 2: Direct node command)
   node server.js
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env and add VITE_API_URL=http://localhost:5000
   npm run dev
   ```

## 🔐 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/whatsapp` |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`/frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

## 🔌 API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Clear session

### Messages
- `GET /api/messages/:user1/:user2` - Get chat history
- `POST /api/messages` - Send a message
- `PATCH /api/messages/delete-for-everyone/:id` - Delete message for all
- `GET /api/messages/starred` - Get starred messages

### Status
- `GET /api/status` - Get all statuses
- `POST /api/status` - Post a new status

## 📡 Socket.IO Events

| Event | Type | Description |
| :--- | :--- | :--- |
| `join` | Emit | Joins the user to their private room |
| `sendMessage` | Emit | Sends a message to a recipient |
| `receiveMessage` | Listen | Triggered when a new message arrives |
| `typing` | Emit/Listen | Broadcasts typing status |
| `call_user` | Emit | Initiates a voice/video call |
| `incoming_call` | Listen | Triggered for the call recipient |
| `mark_seen` | Emit | Marks messages as read |

## 📸 Screenshots

*Coming Soon! Replace these with your actual app screenshots.*

| Login Page | Chat Interface | Status View |
| :---: | :---: | :---: |
| ![Login](<img width="873" height="793" alt="image" src="https://github.com/user-attachments/assets/ea902abf-f091-4986-85f4-9d8e65f92fd7" />
) | ![Chat](<img width="700" height="576" alt="image" src="https://github.com/user-attachments/assets/5ffb5a0b-cb74-44a7-bcb0-700a034d7c9b" />
) | ![Profile](<img width="652" height="492" alt="image" src="https://github.com/user-attachments/assets/d888b2ff-ae9e-4ffc-b8d7-3fa060e4b8f4" />
 |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
