import { NextResponse } from "next/server";
import { checkDatabaseConnection, getAllUsers } from "@/lib/db-operations";

export async function GET() {
  try {
    const isConnected = await checkDatabaseConnection();

    if (!isConnected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const users = await getAllUsers();

    return NextResponse.json({
      message: "Database connection successful",
      connected: true,
      userCount: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
