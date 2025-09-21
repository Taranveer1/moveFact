# Movie API Endpoints Test Guide

This document shows how to test the two new movie API endpoints.

## Prerequisites

1. Start the development server: `npm run dev`
2. Log in via Google OAuth at http://localhost:3000/login
3. Get your session cookie from browser dev tools (or use the built-in UI tester)

## API Endpoints

### 1. Set Favorite Movie - `POST /api/set-movie`

**Purpose:** Save a user's favorite movie to the database

**Authentication:** Required (NextAuth session)

**Request Body:**

```json
{
  "movie": "The Matrix"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Favorite movie updated successfully",
  "movie": "The Matrix",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `401` - Authentication required
- `400` - Movie title is required
- `500` - Database error

### 2. Get Movie Fact - `GET /api/movie-fact`

**Purpose:** Generate an AI fact about the user's favorite movie

**Authentication:** Required (NextAuth session)

**Request:** No body required (GET request)

**Success Response (200):**

```json
{
  "movie": "The Matrix",
  "fact": "The Matrix was the first film to use the revolutionary 'bullet time' effect, which was achieved using 120 cameras arranged in a circle around the action.",
  "source": "openai",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `401` - Authentication required
- `404` - User not found
- `400` - No favorite movie set
- `500` - Server error

## Testing with the UI

The easiest way to test these endpoints is using the built-in API tester on the dashboard:

1. Go to http://localhost:3000/dashboard
2. Scroll down to the "🧪 Movie API Tester" section
3. Enter a movie title and click "Set Movie"
4. Click "Get Fact About My Movie" to generate a fact

## Testing with curl (Advanced)

First, you'll need to extract your session cookie from the browser:

1. Open browser dev tools (F12)
2. Go to Application/Storage > Cookies
3. Copy the `next-auth.session-token` value

Then use these curl commands:

```bash
# Set favorite movie
curl -X POST http://localhost:3000/api/set-movie \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN_HERE" \
  -d '{"movie": "Inception"}'

# Get movie fact
curl -X GET http://localhost:3000/api/movie-fact \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN_HERE"
```

## Features

✅ **Authentication:** Both endpoints check for valid NextAuth sessions
✅ **Database Integration:** Uses Prisma to store/retrieve user's favorite movie
✅ **AI Integration:** Generates facts using OpenAI GPT-3.5
✅ **Error Handling:** Proper error responses and fallbacks
✅ **Type Safety:** Full TypeScript support
✅ **Validation:** Input validation and sanitization

## Error Handling

- **No API Key:** Falls back to generic facts
- **OpenAI Failure:** Graceful fallback to generic messages
- **Database Errors:** Proper error responses with details
- **Invalid Input:** Clear validation error messages
- **Unauthenticated:** 401 responses with clear error messages
