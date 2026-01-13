# Movie and TV Show Review App

A full-stack web application where users can browse movies and TV shows, write reviews, and view ratings from other users.

This project is designed to practice and showcase full-stack development fundamentals.

---

## Project Overview

The Movie and TV Show Review App allows users to:
- Browse a collection of movies and TV shows
- View detailed information for each item
- Create an account and log in
- Write, edit, and delete reviews
- View average ratings based on user reviews

The focus of this project is end-to-end functionality, clean architecture, and real-world patterns such as authentication and relational data modeling.

---

## Project Goals

- Build a complete full-stack application
- Implement user authentication and authorization
- Work with relational databases
- Create a clean and intuitive user interface
- Develop a portfolio-ready project

---

## Target Users

- Users who want to rate and review movies or TV shows
- Users who want to see community feedback before watching content

---

## Core Features (MVP)

### Authentication
- User registration
- User login and logout
- Secure password handling

### Movies and TV Shows
- Browse a list of movies and TV shows
- View a detail page for each movie or show
- Each item includes title, description, release year, poster image, and type (movie or TV)

### Reviews
- Logged-in users can write reviews
- Reviews include a star rating (1 to 5) and text content
- Users can edit or delete only their own reviews
- Reviews are displayed on the movie or show detail page

### Ratings
- Average rating is calculated and displayed for each movie or show

---

## Stretch Features (Future Improvements)

- Search movies and TV shows by title
- Filter by rating or content type
- Pagination or infinite scrolling
- Commenting on reviews
- Like or dislike reviews
- Personal watchlist or favorites
- Admin panel for managing content

---

## Planned Data Models

### User
- id
- username
- email
- password (hashed)

### Movie or TV Show
- id
- title
- description
- releaseYear
- posterUrl
- type (movie or tv)

### Review
- id
- rating
- content
- userId
- movieId
- createdAt

---

## Tech Stack (Planned)

Frontend:
- React
- HTML, CSS, JavaScript

Backend:
- Node.js
- Express

Database:
- PostgreSQL

Authentication:
- JWT or session-based authentication

Architecture:
- RESTful API
- Client-server separation

---

## Out of Scope for MVP

- Payments or subscriptions
- Real-time chat
- Recommendation algorithms
- Social media integrations

---

## What This Project Demonstrates

- Full CRUD functionality
- Authentication and authorization
- Relational database design
- REST API development
- Frontend and backend integration
- Clean project structure

---

## Project Status

In development. Features are being implemented incrementally, starting with the MVP.
