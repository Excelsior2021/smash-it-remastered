import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "@/lib/prisma"
import method from "@/enums/http-method"
import { validatePassword } from "@/lib/server-validation"
import pattern from "@/lib/field-validation"
import { hashPassword } from "@/lib/auth"
import { hash } from "bcryptjs"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case method.post: {
      const session = await getServerSession(req, res, authOptions)

      if (!session)
        return res.status(401).json({ message: "not authenticaticated" })
      try {
        const { newPassword, confirmNewPassword } = req.body

        const { passwordMatch, passwordPattern } = validatePassword(
          newPassword,
          confirmNewPassword,
          pattern
        )

        if (!passwordMatch || !passwordPattern)
          return res.status(400).json({
            message: "invalid input(s) for new password",
            errors: {
              newPassword: !passwordPattern && "password is invalid",
              confirmNewPassword: !passwordMatch && "passwords do not match",
            },
          })

        const setPassword = await prisma.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            password: await hashPassword(newPassword, hash),
          },
        })
        if (setPassword)
          return res.status(200).json({ message: "new password set" })
        else return res.status(500).json({ message: "server error" })
      } catch (error) {
        console.log(error)
      }
    }
    case method.patch: {
      try {
        const { newPassword, confirmNewPassword, token } = req.body

        const { passwordMatch, passwordPattern } = validatePassword(
          newPassword,
          confirmNewPassword,
          pattern
        )

        if (!passwordMatch || !passwordPattern)
          return res.status(400).json({
            message: "invalid input(s) for new password",
            errors: {
              newPassword: !passwordPattern && "password is invalid",
              confirmNewPassword: !passwordMatch && "passwords do not match",
            },
          })

        const tokenExists = await prisma.resetPassword.findUnique({
          where: {
            token,
          },
        })

        if (!tokenExists)
          return res.status(400).json({ error: "token not found" })

        if (tokenExists.expires < new Date())
          return res.status(401).json({ error: "token expiered" })

        const [_, user] = await prisma.$transaction([
          prisma.resetPassword.delete({
            where: {
              token,
            },
          }),
          prisma.user.update({
            where: {
              email: tokenExists.email,
            },
            data: {
              password: await hashPassword(newPassword, hash),
            },
          }),
        ])

        if (user) return res.status(200).json({ message: "password reset" })
        else return res.status(500).json({ error: "an error occured" })
      } catch (error) {
        console.log(error)
      }
    }
  }
  return res.status(405)
}

export default handler
