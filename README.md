<h1 align="center">🎓 AI Learning Assistant - RankUp</h1>

<p align="center">
  <em>An intelligent, AI-powered learning companion that transforms your study materials into interactive flashcards, smart quizzes, and provides on-demand conceptual explanations.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google" alt="Google Gemini AI" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa" alt="PWA Ready" />
</p>

---

## 📖 Project Overview

**RankUp** is a full-stack web application engineered to revolutionize how students and professionals study and retain complex information. By leveraging the power of Google's Gemini AI, RankUp allows users to seamlessly upload their study materials (PDFs, text files, images) and instantly generate personalized, interactive learning assets like flashcards and quizzes. 

Designed with a premium UI/UX, robust architecture, and mobile-first approach, RankUp not only tests your knowledge but actively assists you in building effective, long-term study habits through progress tracking, spaced repetition concepts, and a conversational AI tutor.

---

## ✨ Key Features & Functionalities

### 🧠 Core AI Capabilities
- **Automated Flashcards & Quizzes:** Instantly extract key concepts from uploaded documents and convert them into interactive study sets.
- **Contextual AI Chat Assistant:** Chat directly with an AI tutor that is context-aware of your specific document. Ask questions, request summaries, and get detailed explanations.

### 📚 Study Management
- **Multi-Format Document Upload:** Seamlessly process PDFs, TXT, PNG, and JPG files.
- **Spaced Repetition & Starring:** Mark difficult flashcards for prioritized review to optimize knowledge retention.
- **Comprehensive Dashboard:** Monitor daily study streaks, card mastery statistics, and recent activity timelines.

### ⚡ Performance & Experience
- **Progressive Web App (PWA):** Installable on desktop and mobile devices with robust offline support.
- **Premium UI/UX:** A visually stunning "Vibrant Sunrise" AI-themed interface featuring glassmorphism, smooth framer-motion animations, and responsive design.
- **Robust Error Handling:** Custom, beautifully designed system status pages (404, 500, Offline, Maintenance) for a flawless user experience.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework:** React 19.2 (Vite)
- **Styling:** Tailwind CSS v4, Framer Motion (Animations), Lucide React (Icons)
- **Routing & State:** React Router DOM, Context API
- **Utilities:** Axios, Moment.js, React Markdown

### Backend Architecture
- **Runtime & Framework:** Node.js, Express.js 5
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **File Processing:** Multer, PDF Parse

### API Integrations & Services
- **Google Gemini AI:** Core engine for generating educational content and powering the chat assistant.
- **Cloud Storage / Deployment:** Ready for Vercel/Render deployment.

---

## 🏗️ Project Architecture & Folder Structure

RankUp follows a decoupled Client-Server architecture, ensuring scalability and clean separation of concerns.

```text
ai-learning-assistant/
├── backend/                   # Node.js / Express API
│   ├── config/                # Database and middleware configurations
│   ├── controllers/           # Business logic (Auth, Documents, AI, Quizzes)
│   ├── middleware/            # JWT Auth, Error Handling, Request Validation
│   ├── models/                # MongoDB Mongoose Schemas
│   ├── routes/                # API Route definitions
│   └── utils/                 # Helper functions and validators
│
└── frontend/ai-learning-assistant/ # React / Vite Application
    ├── public/                # Static assets, PWA manifest, and Favicons
    ├── src/
    │   ├── components/        # Reusable UI components (Auth, Layouts, Status)
    │   ├── context/           # Global State (AuthContext)
    │   ├── pages/             # Route-level components (Dashboard, Study, Profile)
    │   └── utils/             # API helpers and constants
    ├── index.html             # Entry HTML with SEO Meta Tags
    └── vite.config.js         # Vite & PWA configuration
```

---

## 📱 PWA & Offline Support

RankUp is built as a **Progressive Web App (PWA)** to deliver a native-like experience:
- **Installable:** Can be installed on iOS, Android, and Desktop directly from the browser.
- **Offline Mode:** Custom offline detection UI informs users when they lose connection, gracefully handling network drops.
- **Service Workers:** Caches essential static assets for lightning-fast subsequent loads.

---

## 🚀 SEO & Performance Optimizations

- **Meta Tags & Open Graph:** Fully configured semantic HTML, Open Graph (OG) tags, and Twitter cards for optimal social sharing and search engine visibility.
- **Lazy Loading & Code Splitting:** Utilizes React Router's capabilities and Vite's optimized bundling.
- **Visual Feedback:** Premium Global Loader component handles initialization states seamlessly, preventing UI flickering.

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local instance or Atlas URI)
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/kunjjarsaniya/Ai-Learning-Assistant-APP.git
cd Ai-Learning-Assistant-APP
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

### 3. Frontend Setup
```bash
cd ../frontend/ai-learning-assistant
npm install

# Create environment file
cp .env.example .env
```

### 4. Run Development Servers
Open two terminal windows:
```bash
# Terminal 1: Backend (Runs on http://localhost:8000)
cd backend
npm run dev

# Terminal 2: Frontend (Runs on http://localhost:5173)
cd frontend/ai-learning-assistant
npm run dev
```

---

## 🔐 Environment Variables Configuration

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API Server Port | `8000` |
| `NODE_ENV` | Environment type | `development` |
| `MONGO_URI` | MongoDB Connection String | `mongodb://localhost:27017/rankup` |
| `JWT_SECRET` | Secure string for token hashing | `your_secret_key` |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `GEMINI_API_KEY`| Google Gemini AI Key | `AIzaSy...` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

### Frontend (`frontend/ai-learning-assistant/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API Base URL | `http://localhost:8000` |

---

## 🗺️ Future Improvements Roadmap

- [ ] **Collaborative Learning:** Share flashcard decks and quizzes with other users.
- [ ] **Advanced Analytics:** Deeper insights into learning patterns using data visualization.
- [ ] **Audio/Voice Support:** Text-to-speech for flashcards and voice commands for the AI assistant.
- [ ] **Gamification:** Leaderboards, achievements, and advanced streak rewards.
- [ ] **Export Functionality:** Export notes and flashcards to Anki or PDF formats.

---


<div align="center">
  <h3>Designed & Developed with ❤️ by <strong>Kunj Jarsaniya</strong></h3>
  <p>
    <a href="https://github.com/kunjjarsaniya">GitHub</a> &bull;
    <a href="https://www.linkedin.com/in/kunj-jarsaniya07">LinkedIn</a>
  </p>
  <p><i>If you find this project helpful or inspiring, please consider giving it a ⭐!</i></p>
</div>
