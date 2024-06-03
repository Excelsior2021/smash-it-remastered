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
    case method.post: {
      try {
        const groups = await prisma.group.findMany({
          where: {
            name: {
              contains: req.body.query,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                stats: true,
              },
            },
          },
        })

        if (groups) return res.status(200).json(groups)
      } catch (error) {
        console.log(error)
      }
    }
  }

  return res.status(405)
}

export default handler
