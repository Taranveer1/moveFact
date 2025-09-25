/**
 * DATABASE OPERATIONS - Core database functions for the Movie Facts app
 *
 * This file contains all database operations using Prisma ORM.
 * Functions handle user data management including favorite movie storage.
 *
 * Database Schema:
 * - User: id, name, email, image, favoriteMovie, createdAt, updatedAt
 * - Session: Managed by NextAuth Prisma adapter
 * - Account: Managed by NextAuth Prisma adapter
 */

import { prisma } from "./prisma";

/**
 * GET USER BY ID
 * Retrieves a single user from the database by their unique ID
 *
 * @param id - The unique user ID (string UUID)
 * @returns User object with all fields, or null if not found
 * @throws Error if database query fails
 *
 * Used by: /api/user/favorite-movie (GET) to fetch user data
 */
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error("Error finding user by id:", error);
    throw error;
  }
}

/**
 * UPDATE USER'S FAVORITE MOVIE
 * Updates the favoriteMovie field for a specific user
 *
 * @param userId - The unique user ID to update
 * @param favoriteMovie - The movie title to save as user's favorite
 * @returns Updated user object with new favorite movie
 * @throws Error if user doesn't exist or database update fails
 *
 * Used by: /api/user/favorite-movie (POST) to save user's movie selection
 */
export async function updateUserFavoriteMovie(
  userId: string,
  favoriteMovie: string
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { favoriteMovie },
    });
    return user;
  } catch (error) {
    console.error("Error updating user favorite movie:", error);
    throw error;
  }
}

