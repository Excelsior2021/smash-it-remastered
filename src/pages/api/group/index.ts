import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/lib/prisma"
import { isMaxUserGroups, validateGroupName } from "@/lib/server-validation"
import method from "@/enums/http-method"
import obscenity from "@/lib/obscenity-matcher"
import pattern from "@/lib/field-validation"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session)
    return res.status(401).json({ message: "not authenticaticated" })

  switch (req.method) {
    case method.post: {
      const { groupName: name } = req.body

      const groupName = name.trim()

      try {
        const maxUserGroups = await isMaxUserGroups(session.user.id, prisma)

        if (maxUserGroups)
          return res.status(400).json({ message: "max group count reached" })

        const { groupNameAlreadyExists, groupNameObscene, groupNamePattern } =
          await validateGroupName(groupName, pattern, obscenity, prisma)

        if (groupNameAlreadyExists || groupNameObscene || !groupNamePattern) {
          return res.status(400).json({
            message: "group name already taken or invalid",
            errors: [
              groupNameAlreadyExists && "group name already exists",
              groupNameObscene && "group name is inappropriate",
              !groupNamePattern &&
                "group name is invalid. group names can only be a max of 20 characters.",
            ],
          })
        }

        const group = await prisma.$transaction(async tx => {
          const group = await tx.group.create({
            data: {
              name: groupName,
            },
          })
          await tx.stat.create({
            data: {
              userId: session.user.id,
              groupId: group.id,
              isAdmin: true,
            },
          })
          return group
        })

        return res.status(201).json({ message: "group created", group })
      } catch (error) {
        return res.status(500).json({
          message: "an error occured on the server. please try again.",
        })
      }
    }
  }
  return res.status(405)
}

export default handler
