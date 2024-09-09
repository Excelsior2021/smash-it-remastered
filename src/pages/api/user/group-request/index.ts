import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "@/lib/prisma"
import { method } from "@/enums"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session)
    return res.status(401).json({ message: "not authenticaticated" })

  switch (req.method) {
    case method.get: {
      try {
        const groupRequests = await prisma.groupRequests.findMany({
          where: {
            userId: session.user.id,
          },
        })

        if (groupRequests) return res.status(200).json(groupRequests)
      } catch (error) {
        console.log(error)
      }
    }
  }
  return res.status(405)
}

export default handler
