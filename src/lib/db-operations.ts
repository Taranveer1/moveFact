import { prisma } from "./prisma";

// User operations
export async function createUser(data: {
  email: string;
  name?: string;
  image?: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
      },
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
}

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

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        favoriteMovie: true,
        createdAt: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

// Utility function to check database connection
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
