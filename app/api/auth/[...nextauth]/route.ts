import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import SpotifyProvider from "next-auth/providers/spotify";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
        ...(spotifyClientId && spotifyClientSecret
            ? [
                  SpotifyProvider({
                      clientId: spotifyClientId,
                      clientSecret: spotifyClientSecret,
                      authorization:
                          "https://accounts.spotify.com/authorize?scope=user-read-email",
                  }),
              ]
            : []),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user && account?.provider === "credentials") {
                token.id = user.id;
            }

            if (token.email && (!token.id || account?.provider === "spotify")) {
                let dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                });

                if (!dbUser) {
                    const generatedPassword = randomBytes(32).toString("hex");
                    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

                    dbUser = await prisma.user.create({
                        data: {
                            email: token.email,
                            name: token.name ?? null,
                            password: hashedPassword,
                        },
                    });
                } else if (!dbUser.name && token.name) {
                    dbUser = await prisma.user.update({
                        where: { id: dbUser.id },
                        data: { name: token.name },
                    });
                }

                token.id = dbUser.id;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
