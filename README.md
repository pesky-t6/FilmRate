# FilmRate

FilmRate is a full-stack web application that allows users to discover movies and TV shows, read and write reviews, and view community ratings. This project demonstrates real-world development skills including authentication, REST APIs, relational data modeling, and frontend-backend integration.

## 🔗 Live Demo

*If deployed online, add your live demo links here.*

Frontend:  
Backend:  

## 🚀 Features

### Core Features
- User authentication (sign up, login, logout)
- Browse a curated collection of movies and TV shows
- View detailed pages with ratings and reviews
- Add, edit, and delete reviews (only for your own account)
- Star rating system (1–5)
- Average rating computed and displayed per item

### UI & UX
- Responsive, user-friendly interface
- Clean layout with movie/show cards and review list

## 🧠 Tech Stack

**Frontend**
- React
- JavaScript (or TypeScript)
- CSS / Tailwind / UI library (if used)

**Backend**
- Node.js
- Express

**Database**
- PostgreSQL

**Authentication**
- JSON Web Tokens (JWT)

**Architecture**
- RESTful API
- Client-server separation

## 📊 Data Models

### User
- `id`
- `username`
- `email`
- `password` (hashed)

### Movie / TV Show
- `id`
- `title`
- `description`
- `releaseYear`
- `posterUrl`
- `type` (movie or tv)

### Review
- `id`
- `rating`
- `content`
- `userId`
- `movieId`
- `createdAt`

## 📦 Installation & Setup

1. Clone the repository: git clone https://github.com/pesky-t6/FilmRate.git
2. Install dependencies for both frontend and backend.
3. Set up your environment variables (see below).
4. Run migrations and seed your database.
5. Start the backend and frontend servers.

## 🔐 Environment Variables

Your project should include a `.env` file (not committed to GitHub) with variables such as:

DATABASE_URL=
JWT_SECRET=
PORT=

*Do not hard-code sensitive keys in your codebase.*

## 🔍 Security Checklist

Before sharing your project, ensure:
- No API keys or secrets are present in your repo
- Sensitive values are in environment variables
- Passwords are hashed before storage
- Authorization checks protect sensitive routes

## ✨ What This Project Shows

FilmRate highlights:
- Complete CRUD functionality
- Authentication and authorization workflows
- Relational data modeling
- REST API design
- Frontend-backend integration
- Clean, maintainable project structure

## 🧪 Possible Future Improvements

- Search and filtering
- Pagination
- Comment threads
- Likes / dislikes on reviews
- Admin panel for moderation

---

Thanks for checking out **FilmRate**! If you’d like suggestions for next steps or improvements, feel free to ask.
