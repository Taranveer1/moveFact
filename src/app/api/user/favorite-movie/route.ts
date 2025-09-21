import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateUserFavoriteMovie, getUserById } from "@/lib/db-operations";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { favoriteMovie } = await request.json();

    if (!favoriteMovie) {
      return NextResponse.json(
        { error: "Favorite movie is required" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserFavoriteMovie(
      session.user.id,
      favoriteMovie
    );

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        favoriteMovie: user.favoriteMovie,
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
