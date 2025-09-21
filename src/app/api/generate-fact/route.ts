import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { movie, requestId, excludeFact } = await request.json();

    if (!movie || typeof movie !== "string") {
      return NextResponse.json(
        { error: "Movie name is required" },
        { status: 400 }
      );
    }

    // First, try to get a movie-specific fallback fact (these are guaranteed to work)
    const fallbackFact = getMovieSpecificFact(movie, requestId, excludeFact);
    if (fallbackFact) {
      return NextResponse.json({
        fact: fallbackFact,
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        fact: `I don't have specific facts about "${movie}" available right now, but it's a great movie! Try refreshing the page.`,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a movie trivia expert. Provide specific, interesting facts about movies including behind-the-scenes information, production details, cast trivia, or box office records. Always be specific to the movie mentioned.",
        },
        {
          role: "user",
          content: `Tell me a specific and interesting fact about the movie "${movie}". Include details like cast, production, box office, or behind-the-scenes trivia. Be specific to this movie, not general movie facts. Keep it 1-2 sentences.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const fact = completion.choices[0]?.message?.content?.trim();

    if (!fact) {
      return NextResponse.json({
        fact: `Sorry, I couldn't generate a specific fact about "${movie}" right now. Try refreshing the page for a new attempt!`,
      });
    }

    return NextResponse.json({
      fact: fact,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);

    // This shouldn't happen since we check for fallback facts first, but just in case
    return NextResponse.json({
      fact: `I'm having trouble generating facts right now, but "${movie}" is definitely a great movie! Try refreshing the page.`,
    });
  }
}

// Fallback facts for popular movies
function getMovieSpecificFact(
  movie: string,
  requestId?: number,
  excludeFact?: string
): string | null {
  const movieLower = movie.toLowerCase();

  const facts: Record<string, string[]> = {
    "home alone": [
      "Home Alone was originally written for John Hughes' own son, and the famous scream face was inspired by Edvard Munch's painting 'The Scream'.",
      "Macaulay Culkin was paid $100,000 for the first Home Alone, but earned $4.5 million for Home Alone 2.",
      "The tarantula used in the movie was actually harmless, and Daniel Stern's scream was dubbed in later because his real scream was too loud.",
    ],
    "home alone 2": [
      "Home Alone 2 was the first film to be shot inside the Plaza Hotel, and Donald Trump has a cameo directing Kevin to the lobby.",
      "The pigeon lady was played by Brenda Fricker, who won an Oscar for 'My Left Foot' the same year Home Alone was released.",
      "Tim Curry was originally cast as the hotel concierge but was replaced by Rob Schneider after creative differences.",
    ],
    "lost in new york": [
      "Home Alone 2: Lost in New York was the first film to be shot inside the Plaza Hotel, and Donald Trump has a cameo directing Kevin to the lobby.",
      "The pigeon lady was played by Brenda Fricker, who won an Oscar for 'My Left Foot' the same year Home Alone was released.",
      "Tim Curry was originally cast as the hotel concierge but was replaced by Rob Schneider after creative differences.",
    ],
    titanic: [
      "The famous 'I'm flying' scene was filmed against a real sunset, and Kate Winslet's hair kept getting caught in Leo's mouth during takes.",
      "James Cameron drew the nude sketches of Rose himself, and the hands shown sketching in the movie are actually his hands.",
      "The elderly couple lying in bed as the ship sinks were based on the real Ida and Isidor Straus, who died on the Titanic.",
    ],
    avatar: [
      "James Cameron developed the technology for Avatar over 14 years, waiting for CGI to advance enough to bring his vision to life.",
      "The Na'vi language was created by linguist Paul Frommer and has over 1,000 words with its own grammar structure.",
      "Sam Worthington was working as a bricklayer in Australia when he was cast as Jake Sully.",
    ],
  };

  // Filter out the excluded fact and get a different one
  const getFactFromArray = (factsArray: string[]): string | null => {
    if (!factsArray.length) return null;

    // If we only have one fact, return it (can't exclude it)
    if (factsArray.length === 1) {
      return factsArray[0];
    }

    // Filter out the excluded fact
    const availableFacts = excludeFact
      ? factsArray.filter((fact) => fact !== excludeFact)
      : factsArray;

    // If no facts left after filtering, use all facts (shouldn't happen with our data)
    const factsToChooseFrom =
      availableFacts.length > 0 ? availableFacts : factsArray;

    // Use requestId as seed for selection
    if (requestId) {
      const seed = requestId % 1000000;
      return factsToChooseFrom[seed % factsToChooseFrom.length];
    }

    return factsToChooseFrom[
      Math.floor(Math.random() * factsToChooseFrom.length)
    ];
  };

  // Check for specific matches first (more specific matches first)
  if (
    movieLower.includes("home alone 2") ||
    movieLower.includes("lost in new york")
  ) {
    const homeAlone2Facts = facts["home alone 2"];
    return getFactFromArray(homeAlone2Facts);
  }

  if (
    movieLower.includes("home alone") &&
    !movieLower.includes("home alone 2")
  ) {
    const homeAloneFacts = facts["home alone"];
    return getFactFromArray(homeAloneFacts);
  }

  // Check other movies
  for (const [key, movieFacts] of Object.entries(facts)) {
    if (
      key !== "home alone" &&
      key !== "home alone 2" &&
      key !== "lost in new york" &&
      movieLower.includes(key)
    ) {
      return getFactFromArray(movieFacts);
    }
  }

  return null;
}
