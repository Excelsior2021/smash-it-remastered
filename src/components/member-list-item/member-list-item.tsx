import { useRouter } from "next/router"
import Avatar from "../avatar/avatar"
import RemoveUserImage from "../svg/remove-user-image"
import AddUserImage from "../svg/add-user-image"
import { useCallback } from "react"
import memberListItemType from "@/src/lib/member-list-item-types"
import { generateDisplayName } from "@/src/lib/utils"
import {
  approveUserToGroup,
  declineUserToGroup,
  removeUserFromGroup,
} from "@/src/lib/api"
import routes from "@/src/lib/client-routes"

import type { member } from "@/types"
import type { NextRouter } from "next/router"

type props = {
  member: member
  groupId: number
  onClick?: Function
  type?: memberListItemType
  className?: string
}

const MemberListItem = ({
  member,
  groupId,
  onClick,
  type,
  className,
}: props) => {
  const router = useRouter()

  const handleRemoveUser = useCallback(
    async (memberId: number, groupId: number, router: NextRouter) => {
      await removeUserFromGroup(memberId, groupId)
      router.replace(router.asPath)
    },
    []
  )

  const handleApproveUser = useCallback(
    async (memberId: number, groupId: number, router: NextRouter) => {
      await approveUserToGroup(memberId, groupId)
      router.replace(router.asPath)
    },
    []
  )

  const handleDeclineUser = useCallback(
    async (memberId: number, groupId: number, router: NextRouter) => {
      await declineUserToGroup(memberId, groupId)
      router.replace(router.asPath)
    },
    []
  )

  return (
    <li
      className={`join-item flex items-center gap-4 p-5 hover:bg-accent cursor-pointer ${className}`}
      onClick={
        onClick
          ? () => onClick({ member, groupId })
          : () => router.push(`${routes.profile}/${groupId}/${member.username}`)
      }>
      <div className="avatar">
        <div className="w-12">
          <Avatar />
        </div>
      </div>
      <div className="text-sm lg:text-base">
        <span>
          {generateDisplayName(
            member.username,
            member.firstName,
            member.lastName
          )}
        </span>
      </div>

      <div className="relative flex gap-4 ml-auto">
        {type === memberListItemType.removeMember && (
          <RemoveUserImage
            onClick={(e: Event) => {
              e.stopPropagation()
              handleRemoveUser(member.id, groupId, router)
            }}
          />
        )}
        {type === memberListItemType.groupRequest && (
          <>
            <AddUserImage
              onClick={async () =>
                await handleApproveUser(member.id, groupId, router)
              }
            />
            <RemoveUserImage
              onClick={async () =>
                await handleDeclineUser(member.id, groupId, router)
              }
            />
          </>
        )}
      </div>
    </li>
  )
}
export default MemberListItem
