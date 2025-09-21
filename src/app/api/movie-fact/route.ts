import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db-operations";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's favorite movie from database
    const user = await getUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.favoriteMovie) {
      return NextResponse.json(
        {
          error: "No favorite movie set",
          message: "Please set your favorite movie first using /api/set-movie",
        },
        { status: 400 }
      );
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        movie: user.favoriteMovie,
        fact: `${user.favoriteMovie} is a great movie choice! Unfortunately, AI fact generation is currently unavailable.`,
        source: "fallback",
      });
    }

    // Generate fact using OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Tell me an interesting and unique fact about the movie "${user.favoriteMovie}". Keep it concise and engaging, around 1-2 sentences. Focus on behind-the-scenes information, trivia, or production details.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const fact = completion.choices[0]?.message?.content?.trim();

      return NextResponse.json({
        movie: user.favoriteMovie,
        fact:
          fact ||
          `${user.favoriteMovie} is a fascinating film with many interesting stories behind its creation!`,
        source: "openai",
        user: {
          name: user.name,
          email: user.email,
        },
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);

      // Fallback to generic fact
      return NextResponse.json({
        movie: user.favoriteMovie,
        fact: `${user.favoriteMovie} is an excellent choice! Every great movie has fascinating stories behind its creation.`,
        source: "fallback",
        user: {
          name: user.name,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.error("Error generating movie fact:", error);
    return NextResponse.json(
      {
        error: "Failed to generate movie fact",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
