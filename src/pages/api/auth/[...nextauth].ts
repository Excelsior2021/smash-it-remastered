import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { env } from "process"
import { verifyPassword } from "@/src/lib/auth"
import prisma from "@/src/lib/prisma"

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
        let user
        try {
          user = await prisma.user.findUnique({
            where: {
              username: userId,
            },
          })
          if (!user) {
            user = await prisma.user.findUnique({
              where: {
                email: userId,
              },
            })
          }
          if (!user) return null

          const passwordVerified = await verifyPassword(password, user.password)

          if (passwordVerified) return user
          else return null
        } catch (error) {
          console.log(error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      //pass additional user data to token
      if (user) {
        return {
          ...token,
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      }
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
        },
      }
    },
  },
  pages: {
    signIn: "/login",
  },
}

export default NextAuth(authOptions)
