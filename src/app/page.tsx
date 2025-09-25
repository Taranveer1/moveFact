"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import MovieSearch from "@/components/MovieSearch";

/**
 * HOME PAGE COMPONENT - The main dashboard for the Movie Facts app
 *
 * This component handles the entire user flow:
 * 1. Shows login screen for unauthenticated users
 * 2. Shows movie selection for first-time users
 * 3. Shows dashboard with movie facts for returning users
 *
 * Key Features:
 * - Google OAuth authentication via NextAuth
 * - Movie search and selection
 * - AI-powered movie fact generation
 * - User profile display with favorite movie
 */
export default function Home() {
  // ========== AUTHENTICATION STATE ==========
  // Get user session data and loading status from NextAuth
  const { data: session, status } = useSession();

  // ========== COMPONENT STATE ==========
  // User's selected favorite movie (stored in database)
  const [userFavoriteMovie, setUserFavoriteMovie] = useState("");

  // Current movie fact being displayed
  const [movieFact, setMovieFact] = useState("");

  // Previously shown fact (used to avoid duplicates)
  const [lastFact, setLastFact] = useState("");

  // Loading states for better UX
  const [isSettingMovie, setIsSettingMovie] = useState(false); // Saving movie to database
  const [isLoadingFact, setIsLoadingFact] = useState(false);   // Generating new fact

  // UI state management
  const [showMovieInput, setShowMovieInput] = useState(false); // Show movie search for new users
  const [isEditingMovie, setIsEditingMovie] = useState(false); // User is changing their movie

  // ========== EFFECT HOOKS - Handle side effects and data loading ==========

  /**
   * AUTHENTICATION EFFECT
   * Runs when user authentication status changes
   * - Once authenticated, fetch the user's data from database
   */
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status]);

  /**
   * MOVIE FACT GENERATION EFFECT
   * Runs whenever user has a favorite movie and is authenticated
   * - Automatically generates a new movie fact
   * - Ensures fresh content on every visit
   */
  useEffect(() => {
    if (userFavoriteMovie && status === "authenticated") {
      generateMovieFact();
    }
  }, [userFavoriteMovie, status]);

  // ========== DATA FETCHING FUNCTIONS ==========

  /**
   * FETCH USER DATA FROM DATABASE
   * - Calls the /api/user/favorite-movie endpoint
   * - If user has a favorite movie: sets it in state
   * - If no favorite movie: shows movie selection UI
   * - On error: defaults to showing movie selection
   */
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/favorite-movie");
      if (response.ok) {
        const data = await response.json();
        if (data.user.favoriteMovie) {
          setUserFavoriteMovie(data.user.favoriteMovie);
        } else {
          // New user - show movie selection
          setShowMovieInput(true);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // On error, assume new user and show movie selection
      setShowMovieInput(true);
    }
  };

  /**
   * SAVE USER'S FAVORITE MOVIE TO DATABASE
   * - Called when user selects a movie from the search component
   * - Updates the database via POST to /api/user/favorite-movie
   * - Updates UI state and triggers fact generation
   * - Handles loading state and error scenarios
   *
   * @param movieTitle - The movie title selected by the user
   */
  const handleSetFavoriteMovie = async (movieTitle: string) => {
    if (!movieTitle.trim()) return;

    setIsSettingMovie(true);
    try {
      const response = await fetch("/api/user/favorite-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteMovie: movieTitle.trim() }),
      });

      if (response.ok) {
        // Update local state
        setUserFavoriteMovie(movieTitle.trim());
        setShowMovieInput(false);  // Hide movie selection UI
        setIsEditingMovie(false);  // Exit edit mode

        // Generate a fact for the new movie (small delay for better UX)
        setTimeout(() => generateMovieFact(), 500);
      }
    } catch (error) {
      console.error("Error setting favorite movie:", error);
    } finally {
      setIsSettingMovie(false);
    }
  };

  /**
   * GENERATE AI-POWERED MOVIE FACT
   * - Calls /api/generate-fact with the user's favorite movie
   * - Uses timestamp to prevent caching and ensure fresh facts
   * - Excludes the last fact to avoid immediate duplicates
   * - Handles OpenAI API errors with graceful fallbacks
   * - Shows loading state during generation
   */
  const generateMovieFact = async () => {
    setIsLoadingFact(true);
    try {
      // Add timestamp to prevent caching and ensure fresh facts
      const timestamp = Date.now();
      const response = await fetch(`/api/generate-fact?t=${timestamp}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie: userFavoriteMovie,
          requestId: timestamp,    // Unique ID for fact generation
          excludeFact: lastFact,   // Don't repeat the previous fact
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLastFact(movieFact);  // Store current fact as "last fact"
        setMovieFact(data.fact); // Display the new fact
      } else {
        // API error - show user-friendly message
        setMovieFact(
          `I couldn't generate a fact about "${userFavoriteMovie}" right now. Try refreshing the page!`
        );
      }
    } catch {
      // Network/other error - show fallback message
      setMovieFact(
        `Having trouble generating facts about "${userFavoriteMovie}". Please refresh the page to try again!`
      );
    } finally {
      setIsLoadingFact(false);
    }
  };

  // ========== RENDER LOGIC - Different UI states based on authentication and data ==========

  /**
   * LOADING STATE - While NextAuth determines authentication status
   * Shows a centered spinner while checking if user is logged in
   */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * LOGIN SCREEN - User is not authenticated
   * Shows Google sign-in button with branding
   * Triggers NextAuth Google OAuth flow when clicked
   */
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center fade-in">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-3">
                Movie Facts
              </h1>
              <p className="text-muted">
                Discover fascinating facts about your favorite movies
              </p>
            </div>
            <button
              onClick={() => signIn("google")}
              className="w-full btn btn-primary justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * MOVIE SELECTION SCREEN - First-time user or changing movie
   * Shows when authenticated user has no favorite movie set
   * Uses MovieSearch component for movie selection with autocomplete
   */
  if (showMovieInput) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="card p-8 fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-3">Welcome!</h1>
              <p className="text-muted">
                What&apos;s your favorite movie? Search and select from our database.
              </p>
            </div>
            <div className="space-y-4">
              <MovieSearch
                onSelectMovie={handleSetFavoriteMovie}
                placeholder="Search for your favorite movie..."
              />
              {isSettingMovie && (
                <div className="flex items-center justify-center space-x-3 text-accent">
                  <div className="loading-spinner"></div>
                  <span className="text-sm">Saving your favorite movie...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * MAIN DASHBOARD - Authenticated user with favorite movie set
   * Shows:
   * - User profile (name, email, photo from Google)
   * - Current favorite movie with option to change
   * - AI-generated movie fact with refresh capability
   * - Logout functionality
   */
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Movie Facts</h1>
            <p className="text-muted text-sm mt-1">
              Welcome back, {session?.user?.name?.split(" ")[0] || "User"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn btn-secondary"
          >
            Sign Out
          </button>
        </div>

        {/* User Info Card */}
        <div
          className={`card p-6 relative z-10 ${
            isEditingMovie ? "mb-12" : "mb-6"
          }`}
        >
          {isEditingMovie ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Change Your Favorite Movie
              </h3>
              <div className="relative z-20">
                <MovieSearch
                  onSelectMovie={handleSetFavoriteMovie}
                  placeholder="Search for a new favorite movie..."
                  initialValue=""
                />
              </div>
              {isSettingMovie && (
                <div className="flex items-center space-x-3 text-accent">
                  <div className="loading-spinner"></div>
                  <span className="text-sm">
                    Updating your favorite movie...
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsEditingMovie(false)}
                disabled={isSettingMovie}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={56}
                    height={56}
                    className="rounded-full ring-2 ring-white/10"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {session.user?.name}
                  </h2>
                  <p className="text-muted text-sm">{session.user?.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-accent text-sm font-medium">
                      {userFavoriteMovie}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditingMovie(true)}
                className="btn btn-secondary text-sm"
              >
                Change Movie
              </button>
            </div>
          )}
        </div>

        {/* Movie Fact Card */}
        <div className="card p-6 fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Movie Fact</h3>
            <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded-full">
              {userFavoriteMovie}
            </span>
          </div>

          {isLoadingFact ? (
            <div className="flex items-center space-x-3 py-8">
              <div className="loading-spinner"></div>
              <span className="text-muted">Generating a new fact...</span>
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl">
              <p className="text-white leading-relaxed">{movieFact}</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted">
              💡 Refresh the page to get a new fact
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-accent hover:text-blue-400 transition-colors"
            >
              Refresh →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
