# 📈 TradeLink | Full-Stack Financial Terminal

TradeLink is a modern, full-stack trading terminal and portfolio analytics platform. Built using a decoupled architecture with Express.js, PostgreSQL (Supabase), and React (Vite + Tailwind CSS), it provides real-time portfolio performance metrics, position ledger tracking, and secure JWT-based authentication.

---

## ✨ Features

- **🔐 Secure Authentication:** User sign-up and login powered by salted password hashing (`bcrypt`) and JSON Web Tokens (`JWT`).
- **📊 Live Portfolio Analytics:** Automated calculation of realized P&L, unrealized floating gains, and cost-basis accounting per asset.
- **⚡ Transaction Ledger:** Full transaction tracking (BUY/SELL orders, quantity, execution prices, and trade notes).
- **🛡️ Frontend Defenses:** Input validation, error boundary states, and asynchronous state protection against duplicate entries.
- **🎨 Modern UI/UX:** Responsive dark-mode interface styled with Tailwind CSS v4 and Lucide React icons.

---

## 🛠️ Tech Stack

### **Backend (API Engine)**

- **Node.js & Express.js:** RESTful API architecture.
- **PostgreSQL (via Supabase):** Relational database storage.
- **JSON Web Tokens (JWT):** Stateless endpoint security.
- **bcryptjs:** Password encryption.

### **Frontend (UI Terminal)**

- **React 19 & Vite:** Fast frontend builds and reactive component state.
- **Tailwind CSS v4:** Utility-first dark-mode terminal layout.
- **Axios:** Authenticated API client handling JWT bearer headers.
- **Lucide React:** Minimalist UI icon set.

---

## 🚀 Local Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database instance (or Supabase URL)

### 2. Backend Setup

```bash
cd backend-api
npm install
```
