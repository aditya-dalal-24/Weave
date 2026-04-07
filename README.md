# <img src="frontend/public/logo.png" width="40" height="40" align="center" /> Weave 

### AI-Powered Internship Recommendation Ecosystem

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/AI_Service-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Weave** is a cutting-edge, full-stack recruitment platform that leverages artificial intelligence to bridge the gap between ambitious students and industry leaders. By analyzing skills, preferences, and education, Weave provides high-precision internship matches that evolve with the user.

---

## 🌟 Key Features

### 🎓 For Candidates
- **AI Matchmaker**: Receive personalized internship suggestions with a detailed % compatibility breakdown.
- **Smart Dashboard**: Track profile strength, application status, and platform activity in real-time.
- **Smart Profile**: Build a resume-ready profile with automated skill tagging and education history.
- **Live Chat**: Connect directly with recruiters through an integrated real-time messaging system.

### 🏢 For Recruiters
- **Candidate Alpha-Rank**: View applicants ranked by their AI match score for each internship.
- **Hiring Pipeline**: Seamlessly transition candidates from *Applied* to *Shortlisted* and *Selected*.
- **Internship Management**: Create, edit, and track visibility for multiple listings with ease.
- **Verification Badge**: Secure your company's profile through the admin-led verification process.

### 🛡️ Security & Authentication
- **Gmail OTP**: 6-digit email verification on registration to ensure a bot-free ecosystem.
- **Google OAuth 2.0**: One-click, secure registration and login with Google.
- **JWT Authorization**: Robust session management with Access and Refresh token rotation.

---

## 🧠 The AI Engine

Our recommendation engine uses a multi-dimensional scoring algorithm to ensure the highest quality matches:

| Factor | Weight | Strategy |
| :--- | :--- | :--- |
| **Skill Similarity** | **50%** | Cosine similarity between candidate skill vectors and internship requirements. |
| **Preference Alignment** | **30%** | Matches location (Onsite/Remote), industries, and stipend expectations. |
| **Education Context** | **20%** | Analyzes field of study and degree level relevance. |

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Node.js, Express.js, Prisma ORM, Socket.io (Real-time).
- **AI Service**: Python 3.10, FastAPI, Scikit-learn (Machine Learning).
- **Database**: PostgreSQL (Structured data), Vector-like similarity processing.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.10+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)

### 1. Unified Setup

#### 📦 Backend
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js # Optional: Seed sample data
npm run dev
```

#### 🤖 AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate # windows: .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

#### 🎨 Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Backend `.env`
| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for access tokens |
| `GOOGLE_CLIENT_ID` | Google Developer Console Client ID |
| `EMAIL_USER` | Gmail address for OTP delivery |
| `EMAIL_PASS` | Gmail App Password (16 chars) |

### Frontend `.env`
| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | Backend server URL (default: http://localhost:5000) |
| `VITE_GOOGLE_CLIENT_ID` | Matching Google Client ID for OAuth |

---

## 👥 Demo Access

| Account Type | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@internmatch.com` | `password123` |
| **Recruiter** | `hr@techcorp.com` | `password123` |
| **Candidate** | `alice@student.com` | `password123` |

---

## 📜 License
Distibuted under the MIT License. See `LICENSE` for more information.

<p align="center">
  Made with ❤️ for the future of recruitment.
</p>
