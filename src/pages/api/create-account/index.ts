import { NextApiRequest, NextApiResponse } from "next"
import { hashPassword } from "@/src/lib/auth"
import prisma from "@/src/lib/prisma"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      {
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
      return res.status(405)
  }
  return res.status(401).json("incorrect http method")
}

export default handler
