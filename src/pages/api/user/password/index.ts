import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "@/src/lib/prisma"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"
import { validatePassword } from "@/src/lib/server-validation"
import pattern from "@/src/lib/field-validation"
import { hashPassword } from "@/src/lib/auth"
import { hash } from "bcryptjs"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session)
    return res.status(401).json({ message: "not authenticaticated" })

  switch (req.method) {
    case method.post: {
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
  }
  return res.status(405)
}

export default handler
