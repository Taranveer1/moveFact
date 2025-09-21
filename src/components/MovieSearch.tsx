"use client";

import { useState, useEffect, useRef } from "react";

interface Movie {
  id: number;
  title: string;
  year: number | null;
  poster: string | null;
  overview: string;
}

interface MovieSearchProps {
  onSelectMovie: (movieTitle: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function MovieSearch({
  onSelectMovie,
  placeholder = "Search for a movie...",
  initialValue = "",
}: MovieSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFallback, setIsFallback] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setMovies([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchMovies(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle clicks outside dropdown
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

  const searchMovies = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search-movies?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        setMovies(data.results || []);
        setIsFallback(data.fallback || false);
        setShowDropdown(true);
      } else {
        setMovies([]);
        setIsFallback(false);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error searching movies:", error);
      setMovies([]);
      setIsFallback(false);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    const movieTitle = movie.year
      ? `${movie.title} (${movie.year})`
      : movie.title;
    setQuery(movieTitle);
    setShowDropdown(false);
    onSelectMovie(movieTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || movies.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < movies.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < movies.length) {
          handleSelectMovie(movies[selectedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

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
                Use "{query.trim()}" as entered
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
