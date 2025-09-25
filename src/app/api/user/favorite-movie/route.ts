/**
 * USER FAVORITE MOVIE API ROUTE - /api/user/favorite-movie
 *
 * This API handles user's favorite movie data management.
 * It provides both GET and POST endpoints for reading and updating
 * the user's movie preference stored in the database.
 *
 * Features:
 * - Session-based authentication via NextAuth
 * - Database integration via Prisma
 * - Input validation and sanitization
 * - Comprehensive error handling
 *
 * GET: Retrieve user's current favorite movie
 * POST: Update user's favorite movie selection
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateUserFavoriteMovie, getUserById } from "@/lib/db-operations";

/**
 * POST HANDLER - Save user's favorite movie selection
 * Called when user selects a movie from MovieSearch component
 * Updates the database and returns success confirmation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const { favoriteMovie } = await request.json();

    if (!favoriteMovie) {
      return NextResponse.json(
        { error: "Favorite movie is required" },
        { status: 400 }
      );
    }

    // Update user's favorite movie in database
    const updatedUser = await updateUserFavoriteMovie(
      session.user.id,
      favoriteMovie
    );

    // Return success response with updated data
    return NextResponse.json({
      message: "Favorite movie updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        favoriteMovie: updatedUser.favoriteMovie,
      },
    });
  } catch (error) {
    console.error("Error updating favorite movie:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET HANDLER - Retrieve user's favorite movie
 * Called by main page on authentication to check if user has a favorite movie
 * Response determines whether to show movie selection or dashboard
 */
export async function GET() {
  try {
    // Verify user is authenticated via NextAuth session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data from database including favorite movie
    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data (favoriteMovie will be null for new users)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        favoriteMovie: user.favoriteMovie, // null = show movie selection UI
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
