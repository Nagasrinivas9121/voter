# 🗳️ ElectEd AI — Election Process Education Assistant

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-8E75B2?logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Firebase](https://img.shields.io/badge/Auth-Firebase%20Admin-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**ElectEd AI** is a state-of-the-art AI-powered platform designed to educate Indian citizens about the democratic process. Built for the modern voter, it simplifies complex election procedures into interactive, accessible, and multilingual experiences.

---

## 🌟 Key Features

- **🤖 AI Consultant**: Real-time, context-aware guidance using **Google Gemini 1.5 Flash**. Enforces step-by-step procedural outputs.
- **📅 Interactive Timeline**: Visual walkthrough of the 7 phases of the Indian election process (Source: ECI).
- **✅ Smart Eligibility**: Determine voting eligibility with AI-generated roadmaps and actionable next steps.
- **🗳️ Mock Voting Sim**: A safe simulation of the EVM + VVPAT process to reduce first-time voter anxiety.
- **🌐 Multilingual (English & Telugu)**: Full i18n support including AI responses.
- **📊 Personalized Analytics**: Secure dashboard to track voting status and learning progress.

---

## 🏗️ Google Cloud Ecosystem (High Impact)

This project is architected to maximize Google Cloud services integration:

### 1. Google Gemini API (Structured AI)
- **Structured Prompts**: Uses system-level instructions to enforce neutrality and procedural accuracy.
- **Context-Aware**: Adapts responses based on user type (First-time voter, Student, NRI, PwD).
- **History Management**: Maintains 4-turn conversation memory for coherent follow-up guidance.

### 2. Firebase Authentication (Secure Auth)
- **Token Verification**: Backend uses `firebase-admin` for 100% secure ID token verification.
- **Stateless Session**: Zero-trust architecture using Firebase UID as the primary key.

### 3. Google Analytics (Actionable Insights)
- **SPA Routing**: Fully integrated tracking for React Router.
- **Custom Events**: Track `chat_query`, `eligibility_check`, and `timeline_view` with detailed metadata.

### 4. Cloud Logging (Structured JSON)
- **Severity Mapping**: Logs are formatted for Google Cloud Logging (INFO, WARN, ERROR mapped to Severity).
- **Metadata Context**: Every log includes `service`, `userId`, and `responseTime`.

---

## 🛡️ Security & Performance

| Feature | Implementation |
| :--- | :--- |
| **Auth** | Firebase Admin SDK (Server-side verification) |
| **Headers** | Helmet.js (Strict CSP, XSS protection) |
| **Sanitization** | Express-Mongo-Sanitize & XSS-clean |
| **Rate Limiting** | Tiered limits for Auth (10/15min) and Chat (20/min) |
| **Performance** | Mongoose `.lean()` and targeted indexing |
| **Infrastructure** | Containerized (Docker) & deployed on Cloud Run |

---

## 📡 API Reference

### Auth
- `POST /api/auth/google`: Verify Firebase token and upsert user profile.
- `GET /api/auth/verify`: Returns authenticated user object.

### Chat
- `POST /api/chat/send`: Interactive AI session (`message`, `sessionId`, `language`).
- `GET /api/chat/sessions`: Retrieve paginated chat history.

### Tools
- `POST /api/eligibility/check`: Logic-gate + AI assessment of voter eligibility.
- `GET /api/timeline`: Cached election process phases.

---

## 🚀 Deployment (Cloud Run)

The project is optimized for **Google Cloud Run** deployment:
1. Build image: `docker build -t gcr.io/[PROJECT-ID]/elected-ai-server ./server`
2. Push image: `docker push gcr.io/[PROJECT-ID]/elected-ai-server`
3. Deploy: `gcloud run deploy elected-ai --image gcr.io/[PROJECT-ID]/elected-ai-server --platform managed`

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Framer Motion, Tailwind CSS.
- **Backend**: Node.js 18, Express, MongoDB Atlas.
- **AI**: Google Generative AI (Gemini 1.5 Flash).
- **DevOps**: Docker, Google Cloud Run, Firebase Admin.

---

*Made with ❤️ for Indian Democracy. Source data: Election Commission of India (eci.gov.in)*