import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateUserFavoriteMovie } from "@/lib/db-operations";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const { movie } = await request.json();

    if (!movie || typeof movie !== "string" || !movie.trim()) {
      return NextResponse.json(
        { error: "Movie title is required" },
        { status: 400 }
      );
    }

    // Update user's favorite movie in database
    const updatedUser = await updateUserFavoriteMovie(
      session.user.id,
      movie.trim()
    );

    return NextResponse.json({
      success: true,
      message: "Favorite movie updated successfully",
      movie: updatedUser.favoriteMovie,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Error setting favorite movie:", error);
    return NextResponse.json(
      {
        error: "Failed to save favorite movie",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
