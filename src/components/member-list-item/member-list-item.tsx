import { useRouter } from "next/router"
import Avatar from "../avatar/avatar"
import RemoveUserImage from "../svg/remove-user-image"
import AddUserImage from "../svg/add-user-image"
import { useCallback, useState } from "react"
import memberListItemType from "@/src/lib/member-list-item-types"
import { generateDisplayName } from "@/src/lib/utils"
import {
  approveUserToGroup,
  declineUserToGroup,
  removeUserFromGroup,
} from "@/src/lib/api"
import clientRoute from "@/src/lib/client-route"
import Modal from "../modal/modal"

import type { member } from "@/types"

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
  const [loading, setLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(false)
  const router = useRouter()

  const handleAction = useCallback(
    async (action, memberId: number, groupId: number) => {
      try {
        setLoading(true)
        const res = await action(memberId, groupId)

        if (res.ok) setActionSuccess(true)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return (
    <li
      className={`join-item flex items-center gap-4 p-5 hover:bg-accent cursor-pointer ${className} ${
        actionSuccess && "hidden"
      }`}
      onClick={
        onClick
          ? () => onClick({ member, groupId })
          : () =>
              router.push(
                `${clientRoute.profile}/${groupId}/${member.username}`
              )
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

      <div className="relative ml-auto">
        {loading && (
          <div className="flex justify-center w-10">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        )}
        {!loading && (
          <div className="flex gap-4">
            {type === memberListItemType.removeMember && (
              <>
                <Modal
                  heading="remove member"
                  action="confirm"
                  text={`Are you sure you want to remove ${member.username} from the group? All their data for this group will be lost.`}
                  onClick={async () =>
                    await handleAction(removeUserFromGroup, member.id, groupId)
                  }
                />
                <RemoveUserImage
                  onClick={(e: Event) => {
                    e.stopPropagation()
                    document.getElementById("modal").showModal()
                  }}
                />
              </>
            )}
            {type === memberListItemType.groupRequest && (
              <>
                <AddUserImage
                  onClick={async (e: Event) => {
                    e.stopPropagation()
                    await handleAction(approveUserToGroup, member.id, groupId)
                  }}
                />
                <RemoveUserImage
                  onClick={async (e: Event) => {
                    e.stopPropagation()
                    await handleAction(declineUserToGroup, member.id, groupId)
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
export default MemberListItem
