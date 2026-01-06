# TeamSync Web (teamsync-web)

Project: TeamSync web application (React + Vite) — frontend for the TeamSync Kanban board.

Overview

This repository contains the TeamSync web client built with React and Vite. The frontend communicates with the teamsync-service backend for authentication and board APIs. The app uses token-based authentication and protects routes such as /board.

Prerequisites

- Node.js (recent LTS, e.g. 18.x or 20.x)
- npm
- A running teamsync-service backend exposing the authentication REST endpoints (see API.md)

Environment variables

The frontend relies on Vite environment variables. Only variables prefixed with VITE_ are exposed to the browser.

Required

- VITE_API_URL (required): Base URL of the teamsync-service REST API. Example: http://localhost:8000

Example .env.local

Create a file named .env.local in the project root (recommended) and add:

VITE_API_URL=http://localhost:8000

Notes

- Do not commit .env.local to version control. Vite only exposes variables prefixed with VITE_.
- The frontend uses import.meta.env.VITE_API_URL to build auth request URLs.

Token persistence

- The authentication token returned by the backend (commonly { token } or { accessToken }) is persisted in localStorage under the key ts_token.
- Auth state is initialized from localStorage on app load.

Running the application

1. Install dependencies

npm install

2. Set environment variable

Create .env.local with VITE_API_URL set to your backend URL.

3. Run the dev server

npm run dev

4. Open the URL printed by Vite (usually http://localhost:5173)

Authentication features and configuration

- Ensure your backend allows requests from the dev origin (CORS) and supports the auth endpoints documented in API.md.
- If you run the backend on a non-standard port or domain, update VITE_API_URL accordingly.

Authentication flow overview (user perspective)

- Registration
  - User navigates to /register and fills the registration form.
  - Frontend calls POST {VITE_API_URL}/auth/register.
  - On success the user is redirected to /login.

- Login
  - User navigates to /login and submits email and password.
  - Frontend calls POST {VITE_API_URL}/auth/login.
  - On success the returned token is stored in localStorage under ts_token and user navigates to /board.

- Protected pages
  - Routes such as /board are protected by a ProtectedRoute component.
  - If no token is present or the auth context reports unauthenticated state, the user is redirected to /login.

- Logout
  - Calling AuthContext.logout() clears ts_token from localStorage and updates auth state; the UI should navigate to /login if desired.

Troubleshooting

- Missing VITE_API_URL
  - If VITE_API_URL is not set, auth requests will fail. Ensure .env.local is present and Vite restarted after changes.

- CORS errors
  - Configure the backend to allow the frontend origin during development.

- Token not persisted
  - Verify the browser allows localStorage access and there are no storage errors (e.g., private browsing restrictions).

Manual verification checklist

- Set VITE_API_URL in .env.local
- Register a new account → redirected to /login
- Login with valid credentials → navigates to /board
- On /board refresh, remain authenticated if ts_token exists
- Clear localStorage (ts_token) → /board redirects to /login

References

- API documentation for authentication endpoints: API.md
