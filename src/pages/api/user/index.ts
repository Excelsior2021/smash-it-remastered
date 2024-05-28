import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/src/lib/prisma"
import { hashPassword } from "@/src/lib/auth"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case method.post: {
      const { username, email, firstName, lastName, password } = req.body
      try {
        const user = await prisma.user.create({
          data: {
            username,
            email,
            firstName,
            lastName,
            password: await hashPassword(password),
          },
        })
        if (user)
          return res.status(201).json(`account created for ${user.username}`)
      } catch (error) {
        console.log(error)
      }
    }

    case method.delete: {
      //auth required
      const session = await getServerSession(req, res, authOptions)
      if (!session) return res.status(401).json("not authenticaticated")
      try {
        const user = await prisma.user.delete({
          where: {
            id: session.user.id,
          },
        })
        if (user) return res.status(204).json("account deleted")
      } catch (error) {
        console.log(error)
      }
    }
  }
  return res.status(405)
}

export default handler
