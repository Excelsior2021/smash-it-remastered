import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from "@/src/lib/prisma"
import method from "@/src/lib/http-method"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session)
    return res.status(401).json({ message: "not authenticaticated" })

  switch (req.method) {
    case method.get: {
      try {
        const stats = await prisma.stat.findMany({
          where: {
            userId: session.user.id,
          },
          include: {
            group: {
              select: { id: true, name: true },
            },
          },
        })
        const groups = stats.map(stat => stat.group)
        if (groups) return res.status(200).json(groups)
      } catch (error) {
        console.log(error)
      }
    }
  }
  return res.status(405)
}

export default handler
