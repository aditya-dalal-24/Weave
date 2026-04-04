# InternMatch — AI-Powered Internship Recommendation System

A full-stack web application that uses AI to match candidates with internship opportunities based on skills, education, and preferences.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Prisma ORM |
| AI Service | Python + FastAPI + scikit-learn |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |

## Prerequisites

- **Node.js** v18+ → [download](https://nodejs.org)
- **Python** 3.10+ → [download](https://python.org)
- **PostgreSQL** 14+ → [download](https://postgresql.org/download)

## Setup Instructions

### 1. Create PostgreSQL Database

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE internship_db;
```

### 2. Backend Setup

```bash
cd backend

# Update .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/internship_db"

# Install dependencies
npm install

# Generate Prisma client & push schema
npx prisma db push

# Seed sample data
node prisma/seed.js

# Start backend
npm run dev
```

Backend runs on **http://localhost:5000**

### 3. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start AI service
python main.py
```

AI service runs on **http://localhost:8000**

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@internmatch.com | password123 |
| Recruiter | hr@techcorp.com | password123 |
| Recruiter | careers@designstudio.com | password123 |
| Candidate | alice@student.com | password123 |
| Candidate | bob@student.com | password123 |
| Candidate | carol@student.com | password123 |

## Features

### Candidate
- Dashboard with stats and profile strength
- Profile management (personal info, education, skills, preferences)
- AI-powered internship recommendations with match % and breakdown
- Application tracking (Applied → Shortlisted → Selected)
- Real-time chat with recruiters
- Profile improvement suggestions

### Recruiter
- Dashboard with hiring stats
- Create/edit/delete internships
- View and filter applicants by skills, education, status
- Shortlist, select, or reject candidates (with auto-notification)
- Real-time chat with candidates

### Admin
- Platform-wide dashboard and stats
- User management (search, filter, activate/deactivate)
- Recruiter verification (approve/reject)

### AI Recommendation Engine
- **Skills Match (50%)**: Cosine similarity between candidate and internship skill vectors
- **Preferences Match (30%)**: Location, type, industry, stipend compatibility
- **Education Relevance (20%)**: Field and degree matching

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/candidate/dashboard | Candidate stats |
| GET | /api/candidate/profile | Get profile |
| PUT | /api/candidate/profile | Update profile |
| GET | /api/recommendations | Get AI recommendations |
| POST | /api/applications | Apply to internship |
| GET | /api/applications | List applications |
| POST | /api/internships | Create internship |
| GET | /api/internships | List internships |
| GET | /api/recruiter/applicants | View applicants |
| GET | /api/admin/dashboard | Admin stats |
| GET | /api/chat/conversations | List conversations |
| POST | /api/chat/messages | Send message |

## Project Structure

```
├── backend/
│   ├── prisma/          # Schema + seed
│   └── src/
│       ├── config/      # DB config
│       ├── controllers/ # Request handlers
│       ├── middleware/   # Auth, validation, rate-limit
│       ├── routes/      # API routes
│       ├── services/    # Business logic
│       └── socket/      # Socket.io handlers
├── frontend/
│   └── src/
│       ├── components/  # Layout, ProtectedRoute
│       ├── context/     # Auth, Socket contexts
│       ├── pages/       # All page components
│       └── services/    # API client
└── ai-service/
    ├── main.py          # FastAPI app
    └── recommendation.py # AI engine
```
