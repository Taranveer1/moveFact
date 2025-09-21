# Movie Facts App

A simple Next.js 14 application with TypeScript for managing movie facts and information.

## Features

- **Google OAuth Authentication**: Secure login with Google using NextAuth.js
- **Dashboard**: View all your movies with statistics and overview
- **Add Movie Form**: Comprehensive form to add new movies with facts
- **AI Fact Generation**: Generate interesting movie facts using OpenAI GPT-3.5
- **Database Integration**: Prisma with SQLite for data persistence
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Next.js 14** with App Router
- **NextAuth.js** for Google OAuth authentication
- **Prisma** with SQLite database
- **OpenAI GPT-3.5** for AI fact generation
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp env.example .env.local
   ```

   Then edit `.env.local` and add your Google OAuth credentials:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
   - Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret to your `.env.local` file
   - Generate a random secret for `NEXTAUTH_SECRET`
   - Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add your OpenAI API key to `.env.local`

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages

### Home Page (`/`)

- Welcome page with navigation to login and dashboard

### Login Page (`/login`)

- Google OAuth authentication with "Sign in with Google" button
- Automatic redirect to dashboard after successful login
- Loading states and error handling

### Dashboard (`/dashboard`)

- Displays all movies in a card layout
- Shows collection statistics
- User profile information from Google
- Requires authentication
- Empty state when no movies are added

### Add Movie (`/add-movie`)

- Comprehensive form for adding movie details
- Fields include: title, year, director, genre, cast, plot, rating, and facts
- Form validation and error handling
- Requires authentication

## Authentication Flow

1. User clicks "Sign in with Google" on the login page
2. NextAuth.js redirects to Google OAuth
3. User authorizes the application
4. Google redirects back with authorization code
5. NextAuth.js exchanges code for user information
6. User is redirected to dashboard with active session
7. Session persists across page refreshes
8. User can logout to clear session

## Data Structure

Movies are stored with the following structure:

```typescript
interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  director: string;
  cast: string[];
  plot: string;
  facts: string[];
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage

1. Visit the home page
2. Click "Get Started" to go to login
3. Click "Sign in with Google" and authorize the app
4. View the dashboard (will be empty initially)
5. Click "Add Movie" to add your first movie
6. Fill out the form with movie details and facts
7. View your movie collection on the dashboard

## Development Notes

- Data is stored in localStorage for demo purposes
- In a production app, you would replace localStorage with a proper database
- Google OAuth requires proper setup in Google Cloud Console
- All pages are responsive and work on mobile devices
- TypeScript provides full type safety for all components and data structures
- NextAuth.js handles all authentication complexity including JWT tokens and sessions

## Environment Variables

Required environment variables (see `env.example`):

- `NEXTAUTH_URL`: Your app's URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Random secret for JWT signing
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret
- `DATABASE_URL`: Database connection string (file:./dev.db for SQLite)
- `OPENAI_API_KEY`: OpenAI API key for fact generation

## AI Fact Generation

The app includes an AI-powered fact generator that uses OpenAI's GPT-3.5 model to create interesting facts about movies. Features include:

- **Standalone Fact Generator**: Enter any movie title to get an AI-generated fact
- **Movie Card Integration**: Generate facts directly from your movie collection
- **Error Handling**: Falls back to generic facts if OpenAI API is unavailable
- **Loading States**: Visual feedback during fact generation
- **Caching**: Generated facts are stored in component state for the session

To use the AI features, you'll need an OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys).
