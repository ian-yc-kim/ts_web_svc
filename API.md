# Authentication API (used by teamsync-web)

This document describes the authentication-related API endpoints called by the frontend. The frontend builds full URLs using the Vite env var import.meta.env.VITE_API_URL as the base.

Base URL

- Base URL: {VITE_API_URL}
  - Example: http://localhost:8000

Common headers

- Content-Type: application/json

Authentication endpoints

1) POST /auth/login

- Endpoint
  - POST {VITE_API_URL}/auth/login

- Headers
  - Content-Type: application/json

- Request body (JSON)
  {
    "email": "string",   // user's email (required)
    "password": "string" // user's password (required)
  }

- Success response (200 OK) common shapes
  - Shape A
    {
      "token": "<jwt-or-token-string>"
    }
  - Shape B
    {
      "accessToken": "<jwt-or-token-string>"
    }

  Notes
  - Frontend accepts either token or accessToken fields.
  - On success the frontend stores the token in localStorage under key ts_token.

- Error responses
  - Typical JSON error
    {
      "message": "Invalid credentials"
    }
  - Backend may also return plain text error messages. The frontend attempts to parse JSON first, then text.

- Example request
  POST /auth/login
  Content-Type: application/json

  {
    "email": "alice@example.com",
    "password": "s3cr3tPass"
  }

- Example success response
  HTTP/1.1 200 OK
  Content-Type: application/json

  {
    "token": "eyJhbGciOiJI..."
  }

- Example error response
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json

  {
    "message": "Invalid email or password"
  }

- Frontend behavior
  - After storing ts_token in localStorage the app sets isAuthenticated to true and navigates to /board.

2) POST /auth/register

- Endpoint
  - POST {VITE_API_URL}/auth/register

- Headers
  - Content-Type: application/json

- Request body (JSON)
  {
    "email": "string",    // required
    "password": "string"  // required
  }

- Success response
  - Common behaviors:
    - 200 OK with empty body
    - 200 OK with { "message": "..." }
  - The frontend does not expect a token in the register response and will redirect the user to /login on success.

- Error response
  - JSON: { "message": "..." } or plain text

- Example request
  POST /auth/register
  Content-Type: application/json

  {
    "email": "bob@example.com",
    "password": "Str0ngPass!"
  }

- Example success response
  HTTP/1.1 200 OK
  Content-Type: application/json

  { "message": "Registration successful" }

- Notes
  - If backend returns a token on register, frontend currently ignores it. Consider updating auth-service if you want immediate login after register.

3) POST /auth/request-password-reset

- Endpoint
  - POST {VITE_API_URL}/auth/request-password-reset

- Headers
  - Content-Type: application/json

- Request body (JSON)
  {
    "email": "string"  // required
  }

- Success response
  - 200 OK with empty body OR { "message": "If an account exists..." }
  - Recommended backend behavior: return a generic success message regardless of whether the email exists to avoid account enumeration.

- Error response
  - JSON: { "message": "..." } or plain text

- Example request
  POST /auth/request-password-reset
  Content-Type: application/json

  {
    "email": "carol@example.com"
  }

- Example success response
  HTTP/1.1 200 OK
  Content-Type: application/json

  { "message": "If an account exists, a reset link has been sent to your email." }

Token and client notes

- localStorage key
  - The frontend persists the received authentication token under key ts_token in localStorage.

- Vite env variable
  - The frontend constructs endpoint URLs using import.meta.env.VITE_API_URL. Ensure this var is set in .env.local or your environment.

- Error handling
  - The frontend attempts JSON parsing of error responses first. If JSON parsing fails it will attempt to use plain text body.

Status codes summary

- 200 OK: Successful operations (login, register, request password reset)
- 401 Unauthorized: Invalid credentials (login)
- 4xx: Client errors with optional JSON { message }
- 5xx: Server errors. Frontend surfaces generic error messages when server errors occur.

Integration checklist for backend teams

- Provide /auth/login, /auth/register, and /auth/request-password-reset endpoints at the base URL.
- Return a JSON token in login responses under token or accessToken key.
- Allow CORS for development frontend origin.
- Prefer consistent JSON error shape { message: string }.
