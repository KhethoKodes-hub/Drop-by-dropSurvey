# 💧 Drop by Drop — Water Awareness Digital System

### Developed by: Brandscapers Africa  
### In collaboration with: Rand Water & Water Wise  
### Platform: Next.js • Firebase • MongoDB Atlas • Vercel  
### Version: 1.0.0  
### Author: Khetho Mngomezulu  

---

## 🌍 Project Overview

**Drop by Drop** is a digital survey and data visualization system built to support **Water Wise and Rand Water’s community awareness campaigns** in South Africa.

It enables field agents to collect household water usage data via mobile-friendly forms and allows administrators to securely view, filter, and visualize that data in real time.

---

## 🎯 Key Features

- 📝 **Online survey forms** for townships (Soweto, Alexandra, Tembisa).  
- ☁️ **MongoDB Atlas integration** for centralized data storage.  
- 🔐 **Firebase Authentication** for admin security.  
- 📊 **Interactive Admin Dashboard** with charts and filters.  
- 📤 **Export to CSV** for reports.  
- 🕒 **Real-time updates** when new responses are submitted.  
- 🌐 **Hosted on Vercel** with automatic CI/CD from GitHub.

---

## 🧠 System Architecture

User (Survey Form)
↓
Next.js Frontend (/soweto, /alexandra, /tembisa)
↓
API Routes (/api/submit, /api/admin/*)
↓
MongoDB Atlas Database (surveyResponses)
↓
Admin Dashboard (Firebase Auth protected)


---

## ⚙️ Technology Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Frontend | Next.js (React) | UI for survey + dashboard |
| Backend | Next.js API Routes | Handles submissions & admin requests |
| Auth | Firebase Admin SDK | Verifies admin login |
| Database | MongoDB Atlas | Stores survey data |
| Hosting | Vercel | Cloud deployment |
| Styling | Tailwind CSS | Responsive design |
| Version Control | Git + GitHub | Code management |
| Deployment | Vercel CI/CD | Automatic deploys on push |

---

## 🧩 Folder Structure

drop-by-drop/
├── src/
│ ├── lib/
│ │ ├── mongodb.js
│ │ └── firebaseAdmin.js
│ ├── pages/
│ │ ├── api/
│ │ │ ├── submit.js
│ │ │ └── admin/
│ │ │ ├── list.js
│ │ │ └── summary.js
│ │ ├── admin.js
│ │ ├── login.js
│ │ ├── soweto.js
│ │ ├── alexandra.js
│ │ ├── tembisa.js
│ │ └── index.js
│ ├── components/
│ └── styles/
├── .env.local
├── next.config.js
├── package.json
└── README.md


---

## 🔐 Environment Variables

Create a `.env.local` file (not pushed to GitHub):

```bash
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_BASE64=your_encoded_service_account_json

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
