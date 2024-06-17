import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { env } from "process"
import prisma from "@/src/lib/prisma"
import { compare } from "bcryptjs"
import GoogleProvider from "next-auth/providers/google"
import { verifyPassword } from "@/src/lib/server-validation"

export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        userId: {
          type: "text",
          placeholder: "username/email",
        },
        password: {
          type: "password",
          placeholder: "password",
        },
      },
      authorize: async ({
        userId,
        password,
      }: {
        userId: string
        password: string
      }) => {
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ username: userId }, { email: userId }],
            },
          })

          if (user) {
            const passwordVerified = await verifyPassword(
              password,
              user.password!,
              compare
            )

            if (passwordVerified) return user
            else return null
          }
          return null
        } catch (error) {
          console.log(error)
          throw new Error(
            "a server error occured. please check your connection and try again."
          )
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn: async ({ account, profile }) => {
      if (account)
        switch (account.provider) {
          case "credentials": {
            return true
          }
          case "google": {
            const user = await prisma.user.upsert({
              where: {
                email: profile.email,
              },
              create: {
                username: (
                  profile.given_name + Math.floor(Math.random() * 1000)
                ).toLowerCase(),
                email: profile.email,
                firstName: profile.given_name,
                emailVerified: new Date(),
              },
              update: {
                firstName: profile.given_name,
              },
            })
            if (user) return true
            else return false
          }
        }
    },
    jwt: async ({ token, user, account, trigger, session }) => {
      //pass additional user data to token
      if (account)
        switch (account.provider) {
          case "credentials": {
            if (user) {
              return {
                ...token,
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified,
              }
            }
            return token
          }
          case "google": {
            const user = await prisma.user.findUnique({
              where: {
                email: token.email,
              },
            })
            if (user) {
              return {
                ...token,
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified,
              }
            }
            return token
          }
        }

      if (trigger === "update") return { ...token, ...session }

      return token
    },
    session: async ({ token, session }) => {
      //remove undefined values from session object
      for (const key in session.user)
        if (session.user[key] === undefined) delete session.user[key]

      //pass additional token data to session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          firstName: token.firstName,
          lastName: token.lastName,
          emailVerified: token.emailVerified,
        },
      }
    },
  },
  pages: {
    signIn: "/login",
  },
}

export default NextAuth(authOptions)
