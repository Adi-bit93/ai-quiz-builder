# ai-quiz-builder# 🧠 AI-QUIZ-BUILDER

<div align="center">

![AI Quiz Builder Logo](https://img.shields.io/badge/AI-Quiz%20Builder-blue?style=for-the-badge&logo=openai)

**Transform Learning with AI-Driven Quizzes Instantly**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![JavaScript](https://img.shields.io/badge/JavaScript-99.7%25-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb)](https://www.mongodb.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Real-time Features](#-real-time-features)
- [Database Schema](#-database-schema)
- [Frontend Structure](#-frontend-structure)
- [Backend Structure](#-backend-structure)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

**AI Quiz Builder** is a cutting-edge, full-stack MERN application that revolutionizes quiz creation and management through artificial intelligence. Built for educators, trainers, and content creators, it enables instant quiz generation, real-time participant engagement, and live leaderboard rankings.

### Why AI Quiz Builder?

- **⚡ Lightning Fast**: Generate professional quizzes in seconds with AI
- **🎯 Interactive**: Real-time quiz participation with live leaderboards
- **🎨 Beautiful UI**: Modern, responsive design that works on all devices
- **🔐 Secure**: JWT-based authentication with refresh tokens
- **📊 Analytics**: Track participant performance and quiz statistics
- **🚀 Scalable**: Built with production-ready architecture

---

## ✨ Key Features

### 🤖 AI-Powered Quiz Generation
- **Gemini Integration**: Generate quizzes from simple text prompts
- **Smart Question Creation**: AI creates relevant multiple-choice questions
- **Customizable Difficulty**: Easy, Medium, or Hard question levels
- **Bulk Generation**: Create 1-50 questions at once
- **Auto-Validation**: AI ensures question quality and relevance

### 📝 Manual Quiz Creation
- **Custom Questions**: Create questions manually with full control
- **Rich Editor**: Add images, code snippets, and formatting
- **Question Types**: Multiple choice, True/False, and more
- **Timer Settings**: Set custom time limits per question
- **Preview Mode**: Test your quiz before publishing

### 🎮 Live Quiz Sessions
- **Real-time Participation**: Multiple users can join simultaneously
- **Unique Session Codes**: 6-character codes for easy joining
- **Organizer Controls**: Start, pause, and navigate through questions
- **Participant View**: Clean, distraction-free quiz interface
- **Auto-scoring**: Instant score calculation with time bonuses

### 🏆 Live Leaderboard
- **Real-time Updates**: Rankings change instantly as users answer
- **Score Calculation**: Points based on accuracy + speed
- **Visual Rankings**: Animated position changes with medals (🥇🥈🥉)
- **Participant Count**: See who's online in real-time
- **Final Results**: Comprehensive results page after quiz completion

### 👥 User Management
- **Authentication**: Secure JWT-based login/signup
- **User Roles**: Organizer and Participant roles
- **Profile Management**: Update user information and preferences
- **Session Management**: Auto-logout and token refresh

### 📊 Analytics & Insights
- **Quiz Statistics**: View total quizzes, published, and drafts
- **Participant Data**: Track who joined and their scores
- **Performance Metrics**: Accuracy rates and time analysis
- **Export Data**: Download results in various formats

---

## 🛠 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | 18.x | UI Library for building interactive interfaces |
| **Vite** | 5.x | Fast build tool and dev server |
| **React Router** | 6.x | Client-side routing and navigation |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Framer Motion** | 11.x | Animation library for smooth transitions |
| **Socket.io Client** | 4.x | Real-time WebSocket communication |
| **Axios** | 1.x | HTTP client for API requests |
| **Lucide React** | Latest | Beautiful icon library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime environment |
| **Express.js** | 4.x | Web application framework |
| **MongoDB** | 6.x | NoSQL database for data storage |
| **Mongoose** | 8.x | MongoDB object modeling |
| **Socket.io** | 4.x | Real-time bidirectional communication |
| **OpenAI API** | Latest | AI-powered quiz generation |
| **JWT** | 9.x | JSON Web Tokens for authentication |
| **Bcrypt** | 5.x | Password hashing and encryption |
| **Cors** | 2.x | Cross-Origin Resource Sharing |
| **Dotenv** | 16.x | Environment variable management |

### Development Tools

- **ESLint** - Code linting and quality
- **Nodemon** - Auto-restart server on changes
- **Postman** - API testing
- **MongoDB Compass** - Database GUI

---

## 🏗 Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   React     │  │  Tailwind   │  │  Framer Motion   │   │
│  │  Components │  │     CSS     │  │   Animations     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   React     │  │  Socket.io  │  │      Fetch       │   │
│  │   Router    │  │   Client    │  │   HTTP Client    │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         SERVER SIDE                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Express.js │  │  Socket.io  │  │   Middleware     │   │
│  │   Routes    │  │   Server    │  │   (Auth, CORS)   │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Controllers │  │  Services   │  │   Validators     │   │
│  │  (Business  │  │  (AI API)   │  │  (Input Check)   │   │
│  │   Logic)    │  │             │  │                  │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                         Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         DATABASE                             │
├─────────────────────────────────────────────────────────────┤
│                      MongoDB Atlas                           │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Quizzes │  │ Sessions │  │  Answers │   │
│  │Collection│  │Collection│  │Collection│  │Collection│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: JWT tokens stored in localStorage
2. **Quiz Generation**: Frontend → Backend → Google Gemini API → Database
3. **Real-time Updates**: Socket.io bidirectional events
4. **Score Calculation**: Backend calculates, broadcasts to all clients

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **npm** (v10.x or higher) or **yarn**
- **MongoDB** (v6.x or higher) - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** - [Download](https://git-scm.com/)
- **Gemini API Key** - [Get one here](https://aistudio.google.com/api-keys)
- **Code Editor** (VS Code recommended)

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 500MB free space
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-quiz-builder.git

# Navigate to project directory
cd ai-quiz-builder
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env

# Open .env and add the following variables:
```

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173


# Database
MONGO_URI=mongodb://localhost:27017/ai-quiz-builder

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d

REDIS_URL=redis://localhost:6379

# Gemini API
GEMINI_API_KEY=sk-your-Gemini-api-key-here

# Client URL (for CORS)
CORS_ORIGIN = *
```

```bash
# Start the backend server
npm run dev

# You should see:
# ✅ MongoDB connected successfully
# 🚀 Server running on port 5000
```

### Step 3: Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
touch .env

# Add the following to .env:
```

```env
BACKEND_URI = backend_Port
```

```bash
# Start the frontend development server
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
```

### Step 4: Open the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1

---


## 📖 Usage Guide

### For Organizers (Quiz Creators)

#### 1. Creating an Account

1. Navigate to `/signup`
2. Enter username, email, and password
3. Click "Sign Up"
4. You'll be redirected to the dashboard

#### 2. Generating a Quiz with AI

1. Click "Create Quiz" button in dashboard
2. Select "Generate with AI"
3. Enter a topic (e.g., "JavaScript Basics")
4. Set number of questions (1-50)
5. Choose difficulty level
6. Click "Generate"
7. Wait for AI to create questions (~10 seconds)
8. Review and edit questions if needed
9. Click "Save Quiz"

#### 3. Creating a Quiz Session

1. Go to your dashboard
2. Find the quiz you want to host
3. Click "copy" to copy code of the quiz card
4. A unique 6-character code will be generated
5. Share this code with participants

#### 4. Hosting a Live Quiz

1. Wait for participants to join
2. Monitor participant count in real-time
3. Click "Start Quiz" when ready
4. Navigate through questions with "Next Question"
5. Watch the leaderboard update live
6. End the quiz after the last question
7. View final results and statistics

### For Participants (Quiz Takers)

#### 1. Joining a Quiz

1. Navigate to `/join`
2. Enter your name
3. Enter the 6-character quiz code
4. Select role: "Participant"
5. Click "Join Quiz"
6. Wait in the lobby for organizer to start

#### 2. Taking the Quiz

1. Read each question carefully
2. Select your answer (A, B, C, or D)
3. Watch the timer countdown
4. Click "Next" to submit
5. Your score updates automatically
6. View your rank on the leaderboard

#### 3. Viewing Results

1. After the quiz ends, you'll see:
   - Your final score
   - Accuracy percentage
   - Time taken per question
   - Correct/incorrect answers
   - Final leaderboard position

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Quiz Endpoints

#### Generate Quiz with AI
```http
POST /quiz/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "JavaScript ES6 Features",
  "questionCount": 10,
  "difficulty": "medium",
  "timePerQuestion": 30
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Quiz generated successfully",
  "data": {
    "_id": "...",
    "title": "Quiz: JavaScript ES6 Features",
    "questions": [
      {
        "questionText": "What is arrow function?",
        "options": ["...", "...", "...", "..."],
        "correctAnswer": 2,
        "points": 10
      }
    ]
  }
}
```



## 🔄 Real-time Features

### Socket.io Events

#### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `joinLeaderboard` | Join quiz session | `{ quizCode, name, role }` |
| `updateScore` | Update participant score | `{ quizCode, name, score }` |
| `startQuiz` | Start the quiz (organizer) | `{ quizCode }` |
| `joinLobby` | Join waiting lobby | `{ quizCode, name }` |

#### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `leaderboardUpdate` | Leaderboard data changed | `[{name, score, rank}]` |
| `participantJoined` | New participant joined | `{id, name}` |
| `quizStarted` | Quiz has started | `{}` |
| `connect` | Socket connected | Socket ID |
| `disconnect` | Socket disconnected | Reason |

### Example Socket Implementation

```javascript
// Client-side
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join a quiz session
socket.emit('joinLeaderboard', {
  quizCode: 'ABC123',
  name: 'John Doe',
  role: 'participant'
});

// Listen for leaderboard updates
socket.on('leaderboardUpdate', (leaderboard) => {
  console.log('Updated rankings:', leaderboard);
  // Update UI with new rankings
});

// Submit an answer
socket.emit('updateScore', {
  quizCode: 'ABC123',
  name: 'John Doe',
  score: 25
});
```

---

## 📁 Frontend Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AuthGuard.jsx
│   │   ├── quiz/
│   │   │   ├── QuizCard.jsx
│   │   │   ├── QuestionEditor.jsx
│   │   │   └── QuizPreview.jsx
│   │   ├── leaderboard/
│   │   │   ├── Leaderboard.jsx
│   │   │   └── ParticipantRow.jsx
│   │   └── shared/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Modal.jsx
│   │       └── Button.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── QuizContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useQuiz.js
│   ├── lib/
│   │   ├── api.js
│   │   └── socket.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── QuizList.jsx
│   │   ├── CreateQuiz.jsx
│   │   ├── JoinQuiz.jsx
│   │   ├── Lobby.jsx
│   │   ├── QuizStart.jsx
│   │   └── QuizResult.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .gitignore
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 📁 Backend Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── quiz.controller.js
│   │   └── session.controller.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Quiz.model.js
│   │   └── QuizSession.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── quiz.routes.js
│   │   └── session.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── rateLimit.js
│   ├── services/
│   │   └── ai.services.js
│   ├── socket/
│   │   └── socketHandlers.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── asyncHandler.js
│   ├── validators/
│   │   ├── auth.validators.js
│   │   └── quiz.validators.js
│   ├── db/
│   │   └── index.js
│   ├── app.js
│   └── index.js
├── .env
├── .gitignore
└── package.json
```

---

## 🌐 Deployment

### Deploying to Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts to configure deployment
```

### Deploying to Railway/Render (Backend)

1. Push code to GitHub
2. Connect Railway/Render to your repository
3. Set environment variables in dashboard
4. Deploy with one click

### Environment Variables for Production

Update these in your hosting platform:
- `NODE_ENV=production`
- `CLIENT_URL=https://your-frontend-url.vercel.app`
- `MONGODB_URI=mongodb+srv://...` (Use MongoDB Atlas)

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm run dev

# Frontend tests
cd frontend
npm run dev

```

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] AI quiz generation works
- [ ] Manual quiz creation works
- [ ] Session creation works
- [ ] Participants can join with code
- [ ] Real-time leaderboard updates
- [ ] Score calculation is correct
- [ ] Quiz results display properly

---


## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Make your changes**
4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build/config changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 AI Quiz Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

### Built With

- [React](https://reactjs.org/) - UI Library
- [Node.js](https://nodejs.org/) - Runtime Environment
- [MongoDB](https://www.mongodb.com/) - Database
- [Gemini](https://aistudio.google.com/api-keys/) - AI API
- [Socket.io](https://socket.io/) - Real-time Engine
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework

<div align="center">

**Made with ❤️ by the AI Quiz Builder (Adi-bit93)**

⭐ Star us on GitHub — it helps!

[Report Bug](https://github.com/yourusername/ai-quiz-builder/issues) · [Request Feature](https://github.com/yourusername/ai-quiz-builder/issues) · [Documentation](https://docs.aiquizbuilder.com)

</div>