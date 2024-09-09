import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "@/lib/prisma"
import resend, { resendType } from "@/lib/resend"
import {
  generateToken,
  hashPassword,
  sendEmailVerificationToken,
} from "@/lib/auth"
import { method } from "@/enums"
import { compare, hash } from "bcryptjs"
import { v4 as uuid } from "uuid"
import {
  getAdminCount,
  validateEmail,
  validateName,
  validatePassword,
  validateUsername,
  verifyPassword,
} from "@/lib/server-validation"
import pattern from "@/lib/field-validation"
import obscenity from "@/lib/obscenity-matcher"

import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case method.post: {
      const {
        username,
        email,
        firstName,
        lastName,
        password,
        confirmPassword,
      } = req.body
      try {
        if (!username && !email && !password && !confirmPassword)
          return res
            .status(400)
            .json("please check that all required fields are valid")

        const { passwordMatch, passwordPattern } = validatePassword(
          password,
          confirmPassword,
          pattern
        )

        const { emailAlreadyExists, emailPattern } = await validateEmail(
          email,
          pattern,
          prisma
        )

        const { usernameAlreadyExists, usernameObscene, usernamePattern } =
          await validateUsername(username, pattern, obscenity, prisma)

        let firstNameObscene
        let firstNamePattern

        if (firstName) {
          const { nameObscene, namePattern } = validateName(
            firstName,
            pattern,
            obscenity
          )
          firstNameObscene = nameObscene
          firstNamePattern = namePattern
        } else {
          firstNameObscene = false
          firstNamePattern = true
        }

        let lastNameObscene
        let lastNamePattern

        if (lastName) {
          const { nameObscene, namePattern } = validateName(
            lastName,
            pattern,
            obscenity
          )
          lastNameObscene = nameObscene
          lastNamePattern = namePattern
        } else {
          lastNameObscene = false
          lastNamePattern = true
        }

        if (
          usernameObscene ||
          firstNameObscene ||
          lastNameObscene ||
          !usernamePattern ||
          !emailPattern ||
          !firstNamePattern ||
          !lastNamePattern ||
          !passwordPattern ||
          usernameAlreadyExists ||
          emailAlreadyExists
        ) {
          return res.status(400).json({
            message: "one or more invalid entries",
            errors: {
              username: [
                usernameObscene && "username is inappropiate",
                !usernamePattern && "username is invalid",
                usernameAlreadyExists && "username is already taken",
              ],
              email: [
                !emailPattern && "please provide a valid email address",
                emailAlreadyExists && "email address already used",
              ],
              password: [!passwordPattern && "please provide a valid password"],
              confirmPassword: [!passwordMatch && "passwords don't match"],
              firstName: [
                firstNameObscene && "name is inappropiate",
                !firstNamePattern && "name can have a max. of 25 characters",
              ],
              lastName: [
                lastNameObscene && "name is inappropiate",
                !lastNamePattern && "name can have a max. of 25 characters",
              ],
            },
          })
        }

        const user = await prisma.$transaction(async tx => {
          const user = await tx.user.create({
            data: {
              username,
              email,
              firstName,
              lastName,
              password: await hashPassword(password, hash),
            },
          })

          const verificationToken = await generateToken(
            email,
            uuid,
            tx,
            resendType.emailVerification
          )

          const emailSent = await sendEmailVerificationToken(
            verificationToken.email,
            verificationToken.token,
            username,
            resend
          )

          // if (!emailSent.id) throw new Error("email not sent")

          return user
        })

        if (user)
          return res.status(201).json({
            message: `account created for ${user.username}`,
          })
      } catch (error) {
        console.log(error)
        return res.status(500).json({
          error:
            "a server error occured. please check your connection and try again.",
        })
      }
    }

    case method.patch: {
      try {
        //auth required
        const session = await getServerSession(req, res, authOptions)
        if (!session)
          return res.status(401).json({ message: "not authenticaticated" })

        const {
          email,
          username,
          firstName,
          lastName,
          currentPassword,
          newPassword,
          confirmNewPassword,
        } = req.body

        const passwordData =
          currentPassword && newPassword && confirmNewPassword

        if (!email && !username && !firstName && !lastName && !passwordData)
          return res
            .status(400)
            .json({ message: "no inputs(s) provided or incomplete fields" })

        if (email) {
          const { emailAlreadyExists, emailPattern } = await validateEmail(
            email,
            pattern,
            prisma
          )
          if (emailAlreadyExists || !emailPattern)
            return res.status(400).json({
              message: "email is not valid",
              errors: [
                !emailPattern && "please provide a valid email address",
                emailAlreadyExists && "email address already used",
              ],
            })

          //send verification email
        } else if (username) {
          const { usernameAlreadyExists, usernamePattern, usernameObscene } =
            await validateUsername(username, pattern, obscenity, prisma)
          if (usernameAlreadyExists || !usernamePattern || usernameObscene)
            return res.status(400).json({
              message: "username error",
              errors: [
                usernameObscene && "username is inappropiate",
                !usernamePattern && "username is invalid",
                usernameAlreadyExists && "username is already taken",
              ],
            })

          const user = await prisma.user.update({
            where: {
              id: session.user.id,
            },
            data: {
              username,
            },
            select: {
              username: true,
            },
          })

          if (user)
            return res.status(200).json({
              message: "username updated",
              field: "username",
              value: user.username,
            })
        } else if (firstName || lastName) {
          const name = firstName ? firstName : lastName

          const { nameObscene, namePattern } = validateName(
            name,
            pattern,
            obscenity
          )
          if (nameObscene || !namePattern)
            return res.status(400).json({
              message: "name is not valid",
              errors: [
                nameObscene && "name is inappropiate",
                !namePattern && "name can have a max. of 25 characters",
              ],
            })

          let user
          if (firstName)
            user = await prisma.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                firstName,
              },
              select: {
                firstName: true,
              },
            })
          else if (lastName)
            user = await prisma.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                lastName,
              },
              select: {
                lastName: true,
              },
            })

          if (user)
            return res.status(200).json({
              message: `${firstName ? "first" : "last"} name updated`,
              value: firstName ? user.firstName : user.lastName,
              field: firstName ? "firstName" : "lastName",
            })
        } else if (passwordData) {
          const user = await prisma.user.findUnique({
            where: {
              id: session.user.id,
            },
            select: {
              password: true,
            },
          })

          if (user) {
            const passwordVerified = await verifyPassword(
              currentPassword,
              user.password,
              compare
            )

            const { passwordMatch, passwordPattern } = validatePassword(
              newPassword,
              confirmNewPassword,
              pattern
            )

            if (!passwordVerified)
              return res.status(403).json({
                message: "password is incorrect",
                field: "currentPassword",
                error: "password is incorrect",
              })

            if (!passwordMatch || !passwordPattern)
              return res.status(400).json({
                message: "invalid input(s) for new password",
                errors: {
                  newPassword: !passwordPattern && "password is invalid",
                  confirmNewPassword:
                    !passwordMatch && "passwords do not match",
                },
              })

            const changePassword = await prisma.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                password: await hashPassword(newPassword, hash),
              },
            })

            if (changePassword)
              return res.status(200).json({
                message: "password changed successfully",
              })
          }
        } else return res.status(401).json({ message: "not authenticaticated" })
      } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "error occured", error: error })
      }
    }

    case method.delete: {
      try {
        //auth required
        const session = await getServerSession(req, res, authOptions)
        if (!session)
          return res.status(401).json({ message: "not authenticaticated" })

        const user = await prisma.user.findUnique({
          where: {
            id: session.user.id,
          },
          select: {
            stats: {
              select: {
                groupId: true,
                isAdmin: true,
                group: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })

        if (user) {
          const userAdminGroups = user.stats.filter(group => group.isAdmin)

          const needsAdmin: string[] = []

          if (userAdminGroups.length > 0) {
            for (const _ of userAdminGroups) {
              const adminCount = await getAdminCount(_.groupId, prisma)

              if (adminCount === 1) {
                const members = await prisma.stat.findMany({
                  where: {
                    groupId: _.groupId,
                  },
                  select: {
                    userId: true,
                  },
                })

                if (members.length === 1) {
                  const group = await prisma.group.delete({
                    where: {
                      id: _.groupId,
                    },
                  })

                  if (group)
                    return res
                      .status(200)
                      .json({ message: `group ${group.name} deleted.` })
                }
                needsAdmin.push(_.group.name)
              }
            }

            if (needsAdmin.length !== 0) {
              return res.status(409).json({
                needsAdmin,
              })
            } else {
              const user = await prisma.user.delete({
                where: {
                  id: session.user.id,
                },
              })
              if (user)
                return res.status(204).json({ message: "account deleted" })
            }
          } else {
            const user = await prisma.user.delete({
              where: {
                id: session.user.id,
              },
            })
            if (user)
              return res.status(204).json({ message: "account deleted" })
          }
        }

        return res.status(500).json({ error: "an error occured" })
      } catch (error) {
        console.log(error)
        return error
      }
    }
  }
  return res.status(405)
}

export default handler
