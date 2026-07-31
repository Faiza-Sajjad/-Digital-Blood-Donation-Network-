🩸 Digital Blood Donation Network
A web-based platform connecting blood donors with patients in need, streamlining donation requests, donor registration, and real-time communication — built as a Final Year Project.

👨‍💻 Developed By
Students Name: Syeda Faiza, Rimsha Rani Supervisor: Dr. Muhammad Adeelcollege Institution: Uniersity of Punjab| Wisdom Degree
Department: Computer Science

📋 Project Overview
The Digital Blood Donation Network is a full-stack MERN application that addresses the critical challenge of finding compatible blood donors quickly during medical emergencies. The system provides a centralized platform where donors can register their availability, patients can post blood requests, and both parties connect through a secure, verified process.

Problem Statement
Finding the right blood group in an emergency is time-consuming and relies on manual calls and social media. This platform digitalizes and automates that process.

Objectives
Provide a centralized database of registered blood donors
Enable patients to post urgent blood requests
Implement secure authentication with OTP email verification
Create a responsive interface usable on any device
Automate deployment using modern CI/CD practices

Key Features
User Authentication — Secure login and registration using JWT and bcrypt
OTP Verification — Email-based one-time password via Nodemailer
Donor Registration — Register with blood group, city, and availability
Blood Request Management — Post, update, and manage blood requests
Donor Search — Filter donors by blood group and location
Feedback System — Submit ratings and reviews
Responsive Design — Mobile-friendly UI with Tailwind CSS
Auto Deployment — CI/CD pipeline via GitHub and Vercel
🛠️ Technology Stack
Frontend

React.js (Single Page Application)
React Router v6
Tailwind CSS
Axios
Backend

Node.js v18/24
Express.js
JWT (JSON Web Tokens)
bcrypt
Nodemailer
Database

MongoDB Atlas (Cloud)
DevOps

Vercel (Hosting + CDN)
GitHub (Version Control)
Vercel Auto-Deploy (CI/CD)

🏗️ System Architecture
Client Layer
Browser (Chrome / Firefox / Safari / Edge)

↓ HTTPS · TLS 1.3

Frontend — Vercel CDN
React.js SPA · React Router v6 · Tailwind CSS · Axios

↓ HTTPS REST · JSON

Backend — Express.js API Server
Node.js 18/24
Middleware: JWT Auth · bcrypt · Nodemailer
Services: User · Donor · Blood Request · Feedback · OTP

↓ MongoDB Wire Protocol · TLS

Database — MongoDB Atlas
Collections: users · donors · blood_requests · feedback · otps

CI/CD Pipeline
GitHub Push → Vercel Build & Test → Auto Deploy to CDN

📁 Project Structure
digital-blood-donation-network/ ├── client/ # Frontend (React.js) │ └── src/ │ ├── components/ # Reusable UI components │ ├── pages/ # Application pages │ ├── services/ # Axios API call functions │ └── App.jsx # Root component & routing │ └── server/ # Backend (Express.js) ├── config/ # Database connection ├── controllers/ # Route handler logic ├── middleware/ # JWT auth & error handling ├── models/ # Mongoose data schemas ├── routes/ # API route definitions ├── services/ # Business logic modules └── server.js # Entry point
🗄️ Database Collections
users — Registered user accounts and credentials
donors — Donor profiles with blood group and location
blood_requests — Patient blood request records
feedback — User ratings and reviews
otps — Temporary OTP records for email verification

🔗 API Overview
Authentication /api/auth
Register · Login · Verify OTP · Forgot Password

Donors /api/donors
Create · Read · Update donor profile

Blood Requests /api/requests
Create · Read · Update · Delete requests

Feedback /api/feedback
Submit and retrieve feedback

⚙️ Installation & Setup
Requirements

Node.js v18 or above
MongoDB Atlas account
Gmail account (for OTP/email service)
Frontend runs on http://localhost:3000
Backend runs on http://localhost:5000

🚀 Deployment
Deployed on Vercel with automated CI/CD:

Push code to main branch on GitHub
Vercel detects the push via webhook
Build and test runs automatically
On success, app is deployed live to the global CDN
Live URL: https://digital-blood-donation-network.vercel.app/

🔒 Security Measures
Passwords hashed with bcrypt — never stored as plain text
All protected routes require a valid JWT token
OTP verification prevents fake registrations
Database uses TLS encryption via MongoDB Atlas
All credentials stored in environment variables
📄 License
Submitted as a Final Year Project at University of Punjab,Lahore All rights reserved © 2025 —

"Every drop counts — technology can help deliver it faster."
