/**
 * MOVIE SEARCH API ROUTE - /api/search-movies
 *
 * This API provides movie search functionality for the MovieSearch component.
 * It integrates with The Movie Database (TMDB) API for comprehensive movie data
 * and includes a robust fallback system for offline functionality.
 *
 * Features:
 * - TMDB API integration with poster images
 * - Fallback movie suggestions when API unavailable
 * - Query validation and sanitization
 * - Manual movie entry support
 * - Error handling with graceful degradation
 *
 * Query Parameter: ?q=movie_search_term
 * Response: { results: Movie[], fallback?: boolean }
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * GET HANDLER - Search for movies
 * Called by MovieSearch component as user types in search input
 * Provides autocomplete suggestions with movie posters and details
 */
export async function GET(request: NextRequest) {
  // Extract search query from URL parameters
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // Validate query length (minimum 2 characters for meaningful search)
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  /**
   * FALLBACK SYSTEM - When TMDB API is not configured
   * Returns curated popular movies that match the search query
   */
  if (!process.env.TMDB_API_KEY) {
    return NextResponse.json({
      results: getFallbackMovies(query),
      fallback: true, // Indicates fallback mode to UI
    });
  }

  try {
    /**
     * TMDB API CALL - Search for movies using external API
     * Uses TMDB's search endpoint with authentication via Bearer token
     */
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&page=1&include_adult=false`, // Exclude adult content
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`, // API key authentication
          "Content-Type": "application/json",
        },
      }
    );

    // Handle HTTP errors from TMDB API
    if (!response.ok) {
      console.log(`TMDB API error: ${response.status}`);
      // Gracefully fallback to local movie suggestions
      return NextResponse.json({
        results: getFallbackMovies(query),
        fallback: true,
      });
    }

    const data = await response.json();

    // Handle API-level errors from TMDB
    if (data.status_code || !data.results) {
      console.log("TMDB API returned error:", data);
      return NextResponse.json({
        results: getFallbackMovies(query),
        fallback: true,
      });
    }

    // Format the results to include poster URLs
    const formattedResults = data.results.slice(0, 8).map((movie: {
      id: number;
      title: string;
      release_date?: string;
      poster_path?: string;
      overview?: string;
    }) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : null,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
        : null,
      overview: movie.overview,
    }));

    // If no results from API, add fallback suggestions
    if (formattedResults.length === 0) {
      return NextResponse.json({
        results: getFallbackMovies(query),
        fallback: true,
      });
    }

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error("TMDB API error:", error);
    // Return fallback movies if API completely fails
    return NextResponse.json({
      results: getFallbackMovies(query),
      fallback: true,
    });
  }
}

// Fallback movie suggestions when API is unavailable
function getFallbackMovies(query: string): Array<{
  id: string;
  title: string;
  year: number | null;
  poster: string | null;
  overview: string;
}> {
  const queryLower = query.toLowerCase();

  const popularMovies = [
    {
      title: "Home Alone",
      year: 1990,
      overview:
        "8-year-old Kevin is accidentally left behind when his family goes on vacation.",
    },
    {
      title: "Home Alone 2: Lost in New York",
      year: 1992,
      overview:
        "Kevin ends up in New York City alone and must defend a hotel from burglars.",
    },
    {
      title: "The Shawshank Redemption",
      year: 1994,
      overview:
        "Two imprisoned men bond over years, finding solace and redemption.",
    },
    {
      title: "The Godfather",
      year: 1972,
      overview:
        "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
    },
    {
      title: "Titanic",
      year: 1997,
      overview:
        "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    },
    {
      title: "Avatar",
      year: 2009,
      overview:
        "A paraplegic Marine dispatched to the moon Pandora on a unique mission.",
    },
    {
      title: "The Dark Knight",
      year: 2008,
      overview:
        "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.",
    },
    {
      title: "Forrest Gump",
      year: 1994,
      overview:
        "The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.",
    },
    {
      title: "Inception",
      year: 2010,
      overview:
        "A thief who steals corporate secrets through dream-sharing technology.",
    },
    {
      title: "The Matrix",
      year: 1999,
      overview:
        "A computer hacker learns from mysterious rebels about the true nature of his reality.",
    },
    {
      title: "Pulp Fiction",
      year: 1994,
      overview:
        "The lives of two mob hitmen, a boxer, and others intertwine in four tales of violence and redemption.",
    },
    {
      title: "The Lion King",
      year: 1994,
      overview:
        "A young lion prince flees his kingdom after his father's death.",
    },
  ];

  // Filter movies that match the query
  const matches = popularMovies.filter((movie) =>
    movie.title.toLowerCase().includes(queryLower)
  );

  // If we have matches, return them
  if (matches.length > 0) {
    return matches.map((movie, index) => ({
      id: `fallback-${index}`,
      title: movie.title,
      year: movie.year,
      poster: null, // No poster for fallback
      overview: movie.overview,
    }));
  }

  // If no matches, suggest the user's input as a custom option
  return [
    {
      id: "custom-input",
      title: query.trim(),
      year: null,
      poster: null,
      overview: `Add ${query.trim()} as your favorite movie`,
    },
  ];
}
