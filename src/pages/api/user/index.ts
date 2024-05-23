import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/src/lib/prisma"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json("not authenticaticated")

  switch (req.method) {
    case "DELETE": {
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
