/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const config = {
    pages: {
        signIn: "/sign-in",
        error: "/sign-in",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialProvider({
            credentials: {
                email: { type: "email" },
                password: { type: "password" },
            },
            async authorize(credentials) {
                if (credentials == null) return null;

                // Find user in database
                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email as string,
                    },
                });

                // Check if the user is exists and the password is matches
                if (user && user.password) {
                    const isMatch = compareSync(credentials.password as string, user.password);
                    // If password is correct, return user
                    if (isMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        };
                    }
                }
                // If user does not exists and password did not matches
                return null;
            },
        }),
    ],
    callbacks: {
        async session({ session, token, user, trigger }: any) {
            // Set the user ID from the token
            session.user.id = token.sub;
            session.user.name = token.name;
            session.user.role = token.role;

            // If there is an update, set the user's name
            if (trigger == "update") {
                session.user.name = user.name;
            }

            return session;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async jwt({ token, user, trigger, session }: any) {
            // Assign user fields to token
            if (user) {
                token.role = user.role;
                // If user has no name then use the email
                if (user.name === "NO_NAME") {
                    token.name = user.email!.split("@")[0];
                }

                // Update database to reflect the name
                await prisma.user.update({
                    where: { id: user.id },
                    data: { name: token.name },
                });
            }
            return token;
        },
        authorized({ request, auth }: any) {
            // Check for session cart cookie
            if (!request.cookies.get("sessionCartId")) {
                // Generate new session cart id
                const sessionCartId = crypto.randomUUID();

                // Clone the request headers
                const newRequestHeaders = new Headers(request.headers);

                // Create new response and add the new headers
                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders,
                    },
                });

                // Set newly generated sessionCartId
                response.cookies.set("sessionCartId", sessionCartId);
                return response;
            } else {
                return true;
            }
        },
    },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
