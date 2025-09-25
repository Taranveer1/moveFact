/**
 * NEXTAUTH CONFIGURATION - Authentication setup for the Movie Facts app
 *
 * This file configures NextAuth.js for Google OAuth authentication with database sessions.
 * Key features:
 * - Google OAuth integration
 * - PostgreSQL session storage via Prisma
 * - User profile extraction (name, email, photo)
 * - Session management with user ID injection
 */

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  /**
   * DATABASE ADAPTER - Store sessions and users in PostgreSQL
   * Uses Prisma adapter to handle user creation and session management
   */
  adapter: PrismaAdapter(prisma),

  /**
   * AUTHENTICATION PROVIDERS
   * Currently only supports Google OAuth
   * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables
   */
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,   // Google OAuth app client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Google OAuth app secret
    }),
  ],

  /**
   * CUSTOM PAGES
   * Define custom URLs for authentication flows
   * Currently redirects sign-in to /login page
   */
  pages: {
    signIn: "/login",
  },

  /**
   * CALLBACKS - Customize authentication behavior
   * Session callback: Add user ID to session object for database queries
   */
  callbacks: {
    /**
     * SESSION CALLBACK
     * Runs whenever a session is checked
     * Adds the database user ID to the session object
     * This allows us to query user-specific data (like favorite movies)
     */
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id; // Add user ID from database to session
      }
      return session;
    },
  },

  /**
   * SESSION CONFIGURATION
   * Use database strategy to store sessions in PostgreSQL
   * This persists sessions across server restarts
   */
  session: {
    strategy: "database",
  },

  /**
   * SECRET KEY
   * Used to encrypt JWT tokens and sign cookies
   * Must be set in NEXTAUTH_SECRET environment variable
   */
  secret: process.env.NEXTAUTH_SECRET,
};
