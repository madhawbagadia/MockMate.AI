# MockMate.AI 🤖

> An AI-powered mock interview platform that helps users practice interviews, receive AI-based feedback, track performance, and improve their interview skills.

🌐 **Live Demo:** https://mockmate-client-ouu2.onrender.com

📦 **GitHub:** https://github.com/madhawbagadia/MockMate.AI

---

## 📌 Overview

**MockMate.AI** is a full-stack AI-powered mock interview platform designed to simulate real-world interview experiences.

Users can select an interview role, experience level, and interview mode, upload their resume, and participate in an AI-driven mock interview.

The platform dynamically generates interview questions, evaluates answers using AI, provides performance reports, stores interview history, and allows users to purchase additional interview credits through Razorpay.

---

## ✨ Features

### 🤖 AI-Powered Mock Interviews

- Role-based interview questions
- AI-generated interview questions
- Resume-based interview preparation
- AI-based answer evaluation
- Adaptive interview flow
- Interview scoring and feedback

### 📄 Resume Analysis

- Upload resume during interview preparation
- Analyze resume information
- Generate personalized interview questions

### 📊 Performance Reports

- Overall interview score
- Question-wise evaluation
- AI-generated feedback
- Interview completion status
- Detailed performance reports

### 🗂️ Interview History

- View previous interviews
- View detailed interview reports
- Track interview scores
- Track interview status
- Delete interview history
- User-specific interview data protection

### 🔐 Authentication

- Firebase Authentication
- Google Sign-In
- JWT-based authentication
- Protected backend routes
- Secure HTTP cookies

### 💳 Payment System

- Razorpay integration
- Credit-based interview system
- Razorpay order creation
- Server-side payment verification
- Automatic credit updates after successful payment

### ⚡ Redis

- Redis integration
- Caching support
- Improved backend performance

### 🐳 Docker & Nginx

- Dockerized backend
- Dockerized frontend
- Docker Compose setup
- Nginx reverse proxy
- Multi-stage frontend Docker build
- Static asset caching
- Server health check

### ☁️ Deployment

- GitHub integration
- Render frontend deployment
- Render backend deployment
- MongoDB Atlas
- Redis
- Firebase Authentication
- Razorpay

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Redux Toolkit
- Firebase Authentication
- Razorpay

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- JWT
- Multer
- Cookie Parser
- CORS

### AI & APIs

- OpenRouter API
- AI-generated interview questions
- AI-based answer evaluation

### DevOps

- Docker
- Docker Compose
- Nginx
- GitHub
- Render

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         │      Browser        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React + Vite      │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                              HTTP / HTTPS
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js + Express │
                         │       Backend       │
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └────────────┐
                    ▼                               ▼
          ┌──────────────────┐             ┌──────────────────┐
          │     MongoDB      │             │      Redis       │
          │     Database     │             │      Cache       │
          └──────────────────┘             └──────────────────┘
                    │
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
 ┌──────────────────┐   ┌──────────────────┐
 │  OpenRouter API  │   │     Razorpay     │
 │   AI Services    │   │     Payments     │
 └──────────────────┘   └──────────────────┘


🔄 Interview Flow
User
  │
  ▼
Select Interview Role
  │
  ▼
Select Experience & Mode
  │
  ▼
Upload Resume
  │
  ▼
Resume Analysis
  │
  ▼
Generate AI Question
  │
  ▼
User Answers
  │
  ▼
AI Evaluation
  │
  ▼
Generate Next Question
  │
  ▼
Continue Interview
  │
  ▼
Finish Interview
  │
  ▼
Generate Performance Report
  │
  ▼
Save Interview History


💳 Payment Flow
User selects credit plan
          │
          ▼
Backend creates Razorpay order
          │
          ▼
Razorpay Checkout
          │
          ▼
Payment completed
          │
          ▼
Frontend receives payment response
          │
          ▼
Backend verifies payment
          │
          ▼
User credits updated
🚀 Getting Started
1. Clone Repository
git clone https://github.com/madhawbagadia/MockMate.AI.git
cd MockMate.AI
2. Client Setup

Navigate to the Client directory:

cd Client

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally run on:

http://localhost:5173
3. Server Setup

Open another terminal and navigate to the Server directory:

cd Server

Install dependencies:

npm install

Start the development server:

npm run dev


🐳 Docker Setup

The project can also be run completely using Docker.

Build and Start Containers

From the project root:

docker compose up --build

Application:

http://localhost
Run Containers in Background
docker compose up -d
Check Running Containers
docker compose ps
View All Logs
docker compose logs
View Server Logs
docker compose logs server
View Nginx Logs
docker compose logs nginx
Stop Containers
docker compose down
Rebuild Containers
docker compose up --build
Enter Server Container
docker compose exec server sh
Server Health Check
docker compose exec server wget -qO- http://localhost:8000/health

Expected response:

{
  "status": "OK"
}
⚙️ Environment Variables

⚠️ Never commit .env files, API keys, database credentials, or other secrets to GitHub.

Client

Create:

Client/.env
VITE_SERVER_URL=http://localhost:8000
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
Server

Create:

Server/.env
PORT=8000

DB_CONNECT=your_mongodb_connection_string

JWT_SECRET_KEY=your_jwt_secret

REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port

OPENROUTER_API_KEY=your_openrouter_api_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret


📁 Project Structure
MockMate.AI/
│
├── Client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
│
├── Server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── .gitignore
└── README.md


🔗 API Endpoints
Authentication
/api/auth/*
User
/api/user/*
Interview
POST   /api/interview/resume
POST   /api/interview/generate-question
POST   /api/interview/submit-answer
POST   /api/interview/finish-interview

GET    /api/interview/get-interviews
GET    /api/interview/report/:id

DELETE /api/interview/delete/:id
Payment
/api/payment/*
Health Check
GET /health

Response:

{
  "status": "OK"
}


🔐 Security

MockMate.AI implements several security practices:

Firebase Authentication
JWT-based authentication
Protected Express routes
HTTP cookies
CORS configuration
Environment-based secrets
Server-side Razorpay payment verification
User-specific interview access
User-specific interview deletion
Sensitive credentials excluded from GitHub


☁️ Production Deployment

MockMate.AI is deployed using Render.

Frontend

https://mockmate-client-ouu2.onrender.com

Backend

https://mockmate-server-7i7c.onrender.com

Production frontend configuration:

VITE_SERVER_URL=https://mockmate-server-7i7c.onrender.com


🚀 Production Architecture
                    GitHub
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
      Render Static Site    Render Web Service
             │                   │
             │                   ├── Node.js
             │                   ├── Express
             │                   └── Docker
             │                          │
             ▼                          ├── MongoDB Atlas
         React/Vite                     ├── Redis
                                        ├── OpenRouter
                                        └── Razorpay


📈 Future Improvements
 Custom domain
 Email notifications
 Advanced analytics dashboard
 More interview modes
 Resume improvement suggestions
 Personalized interview recommendations
 Leaderboard
 Automated testing
 CI/CD pipeline
 Advanced AI performance analytics


👨‍💻 Author

Madhaw Kumar Bagadia

GitHub:
https://github.com/madhawbagadia


⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.


📄 License

This project is developed for educational and portfolio purposes.
