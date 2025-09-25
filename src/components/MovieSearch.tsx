"use client";

/**
 * MOVIE SEARCH COMPONENT - Interactive movie autocomplete search
 *
 * This component provides a sophisticated movie search experience with:
 * - Real-time search with debouncing
 * - TMDB API integration with poster images
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click-outside handling for dropdown
 * - Fallback mode indicator when API unavailable
 * - Manual movie entry option
 * - Loading states and error handling
 *
 * Used by: Main page for new users and when editing favorite movie
 */

import { useState, useEffect, useRef } from "react";

// ========== TYPE DEFINITIONS ==========

/**
 * Movie data structure returned by search API
 * Matches the format from /api/search-movies endpoint
 */
interface Movie {
  id: number;
  title: string;
  year: number | null;    // Release year, null if unknown
  poster: string | null;  // URL to poster image, null if unavailable
  overview: string;       // Movie description/plot summary
}

/**
 * Props for MovieSearch component
 * Allows customization of behavior and callbacks
 */
interface MovieSearchProps {
  onSelectMovie: (movieTitle: string) => void; // Callback when user selects a movie
  placeholder?: string;   // Input placeholder text
  initialValue?: string;  // Starting value for search input
}

/**
 * MOVIE SEARCH COMPONENT
 * Renders an interactive search input with dropdown suggestions
 */
export default function MovieSearch({
  onSelectMovie,
  placeholder = "Search for a movie...",
  initialValue = "",
}: MovieSearchProps) {
  // ========== COMPONENT STATE ==========

  // Search input value
  const [query, setQuery] = useState(initialValue);

  // Array of movie search results
  const [movies, setMovies] = useState<Movie[]>([]);

  // Loading state while searching
  const [isLoading, setIsLoading] = useState(false);

  // Whether to show the dropdown with results
  const [showDropdown, setShowDropdown] = useState(false);

  // Currently selected item index for keyboard navigation (-1 = none)
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Whether we're in fallback mode (TMDB API unavailable)
  const [isFallback, setIsFallback] = useState(false);

  // ========== REFS FOR DOM ACCESS ==========
  const dropdownRef = useRef<HTMLDivElement>(null);  // Dropdown container
  const inputRef = useRef<HTMLInputElement>(null);   // Search input field

  // ========== EFFECT HOOKS - Handle side effects ==========

  /**
   * DEBOUNCED SEARCH EFFECT
   * Triggers search after user stops typing for 300ms
   * Prevents excessive API calls while user is actively typing
   */
  useEffect(() => {
    // Require minimum 2 characters for search
    if (query.length < 2) {
      setMovies([]);
      setShowDropdown(false);
      return;
    }

    // Debounce: wait 300ms after user stops typing before searching
    const timeoutId = setTimeout(() => {
      searchMovies(query);
    }, 300);

    // Cleanup: cancel pending search if user continues typing
    return () => clearTimeout(timeoutId);
  }, [query]);

  /**
   * CLICK-OUTSIDE EFFECT
   * Closes dropdown when user clicks outside the component
   * Essential for good UX in dropdown components
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========== API FUNCTIONS ==========

  /**
   * SEARCH MOVIES API CALL
   * Calls the /api/search-movies endpoint with user's search query
   * Handles loading states, errors, and fallback modes
   *
   * @param searchQuery - The movie search term from user input
   */
  const searchMovies = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search-movies?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        setMovies(data.results || []);        // Set search results
        setIsFallback(data.fallback || false); // Track if using fallback mode
        setShowDropdown(true);                // Show results dropdown
      } else {
        // API error - clear results
        setMovies([]);
        setIsFallback(false);
        setShowDropdown(false);
      }
    } catch (error) {
      // Network error - clear results and log error
      console.error("Error searching movies:", error);
      setMovies([]);
      setIsFallback(false);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== EVENT HANDLERS ==========

  /**
   * HANDLE MOVIE SELECTION
   * Called when user clicks on a movie or presses enter
   * Formats movie title with year and triggers parent callback
   *
   * @param movie - The selected movie object
   */
  const handleSelectMovie = (movie: Movie) => {
    // Format title with year if available: "Movie Title (2023)"
    const movieTitle = movie.year
      ? `${movie.title} (${movie.year})`
      : movie.title;

    setQuery(movieTitle);          // Update input field
    setShowDropdown(false);        // Close dropdown
    onSelectMovie(movieTitle);     // Notify parent component
  };

  /**
   * KEYBOARD NAVIGATION HANDLER
   * Provides full keyboard support for the dropdown
   * Arrow keys, Enter, Escape - standard dropdown behavior
   *
   * @param e - React keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only handle keys when dropdown is visible with results
    if (!showDropdown || movies.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        // Move selection down (don't go past last item)
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < movies.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        // Move selection up (don't go above first item)
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;

      case "Enter":
        // Select currently highlighted item
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < movies.length) {
          handleSelectMovie(movies[selectedIndex]);
        }
        break;

      case "Escape":
        // Close dropdown and reset selection
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // ========== RENDER JSX ==========

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (movies.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="input pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="loading-spinner w-4 h-4"></div>
          </div>
        )}
      </div>

      {showDropdown && movies.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 glass-effect rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {isFallback && (
            <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-200 text-xs">
              ⚠️ Movie database temporarily unavailable - showing popular
              matches
            </div>
          )}
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              onClick={() => handleSelectMovie(movie)}
              className={`flex items-center p-4 cursor-pointer hover:bg-white/10 transition-colors ${
                index === selectedIndex ? "bg-white/10" : ""
              }`}
            >
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-12 h-18 object-cover rounded mr-3 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-18 bg-white/10 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center">
                  <span className="text-lg">🎬</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">
                  {movie.title}
                  {movie.year && (
                    <span className="text-muted ml-1">({movie.year})</span>
                  )}
                </div>
                {movie.overview && (
                  <div className="text-sm text-muted line-clamp-2 mt-1">
                    {movie.overview.length > 100
                      ? `${movie.overview.substring(0, 100)}...`
                      : movie.overview}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Manual input option */}
          <div
            onClick={() => {
              const movieTitle = query.trim();
              if (movieTitle) {
                setQuery(movieTitle);
                setShowDropdown(false);
                onSelectMovie(movieTitle);
              }
            }}
            className="flex items-center p-4 cursor-pointer hover:bg-white/10 border-t border-white/10 transition-colors"
          >
            <div className="w-12 h-18 bg-accent/20 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center">
              <span className="text-accent text-lg">✏️</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-accent">
                Use &quot;{query.trim()}&quot; as entered
              </div>
              <div className="text-sm text-muted">
                Add this movie manually if not found above
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
