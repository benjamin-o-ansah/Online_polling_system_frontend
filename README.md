# Online_polling_system_frontend

# Important Note.

## The backend is powered on render and it stays silent or sleeps when active. Because it is being utilised in the free mode, it takes time to come back up about 50 seconds or more so if you initiate a request in the beginning and it fails then you know the reason behind it delaying

# Project Nexus – Online Polling System (Frontend)

A modern, secure, and scalable frontend application for the **Project Nexus Online Polling System**.  
This frontend consumes a RESTful backend API to enable **user authentication, poll creation, voting, results visualization, and administrative monitoring**.

---

## 📌 Overview

Project Nexus is a civic-tech polling platform that allows organizations to create and manage polls while enabling users (authenticated or anonymous) to participate securely.  
This repository contains the **frontend application** responsible for the user interface, UX flows, and API integration.

---

## 🚀 Features

### 👤 Authentication & User Management
- User registration and login
- JWT-based session handling
- Role-aware UI (User, Admin, System Admin)
- Secure logout and token refresh
- User profile view

### 🗳 Polls
- List available polls
- View poll details
- Vote on active polls (authenticated or anonymous)
- Prevent duplicate voting
- View results after poll closure

### 🛠 Admin Capabilities
- Create, edit, publish, close, and delete polls
- View poll results at any stage
- Monitor system metrics
- View audit logs for compliance and traceability

---

## 🧩 Tech Stack

- **Framework:** React / Next.js (App Router recommended)
- **UI:** shadcn/ui + Tailwind CSS
- **State Management:** React Context / TanStack Query
- **Auth:** JWT (Access + Refresh Tokens)
- **Charts:** Recharts / Chart.js
- **API Client:** Fetch / Axios

---

## 📂 Project Structure




---

## 🔐 Authentication API Integration

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

---

## 🗳 Polls API Integration

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/api/polls/` | List all polls |
| POST | `/api/polls/` | Create a poll (Admin only) |
| GET | `/api/polls/{poll_id}` | Get poll details |
| PUT | `/api/polls/{poll_id}` | Update poll (Draft only) |
| DELETE | `/api/polls/{poll_id}` | Delete poll |
| POST | `/api/polls/{poll_id}/publish` | Publish poll |
| POST | `/api/polls/{poll_id}/close` | Close poll |

---

## 🗳 Voting API Integration

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/api/polls/{poll_id}/vote` | Submit vote |
| GET | `/api/polls/{poll_id}/vote/status` | Check vote status |

---

## 📊 Results API Integration

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/api/polls/{poll_id}/results` | View poll results |

> **Note:**  
> - Admins can view results at any time  
> - Users can view results only after poll is closed

---

## 🛡 System Admin API Integration

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/api/admin/metrics` | Platform usage metrics |
| GET | `/api/admin/audit-logs` | Audit logs |

---

## 🧠 Role-Based Access Control (Frontend)

| Role | Permissions |
|----|------------|
| Anonymous | View polls, vote anonymously |
| User | Vote, view closed results |
| Admin | Manage polls, view results |
| System Admin | View metrics & audit logs |

> **Note:** Frontend enforces UI gating; backend enforces actual authorization.

---

## 🎨 UI & UX Principles

- Mobile-first, responsive design
- Clear poll status indicators
- Accessible (WCAG 2.1 AA)
- Loading, empty, and error states
- Confirmation modals for destructive actions

---

## NEXT_PUBLIC_API_BASE_URL=https://project-nexus-online-polling-system.onrender.com

