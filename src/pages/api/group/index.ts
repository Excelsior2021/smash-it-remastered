import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/src/lib/prisma"
import { isMaxUserGroups } from "@/src/lib/server-validation"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session) return res.status(401).json("not authenticaticated")

  switch (req.method) {
    case "POST": {
      try {
        const maxUserGroups = await isMaxUserGroups(session.user.id, prisma)
        if (maxUserGroups)
          return res.status(400).json("max group count reached")

        const [group] = await prisma.$transaction(async tx => {
          const group = await tx.group.create({
            data: {
              name: req.body.groupName,
            },
          })
          const user = await tx.stat.create({
            data: {
              userId: session.user.id,
              groupId: group.id,
              isAdmin: true,
            },
          })
          return [group, user]
        })
        return res.status(201).json({ message: "group created", group })
      } catch (error: any) {
        if (error.code === "P2002") {
          return res
            .status(409)
            .json({ message: "group name already exists.", error })
        }
        return res.status(500)
      }
    }
  }
  return res.status(405)
}

export default handler
