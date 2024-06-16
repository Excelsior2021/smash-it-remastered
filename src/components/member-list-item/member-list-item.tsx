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
  makeUserAdminOfGroup,
  removeUserFromGroup,
} from "@/src/lib/api"
import clientRoute from "@/src/lib/client-route"
import Modal from "../modal/modal"
import apiRoute from "@/src/lib/api-route"
import method from "@/src/lib/http-method"

import type { apiRouteType, member, methodType } from "@/types"
import Key from "../svg/key"
import Unlock from "../svg/unlock"

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
  const [showMemberModal, setShowMemberModal] = useState(false)
  const router = useRouter()

  const handleAction = useCallback(
    async (
      action,
      userId: number,
      groupId: number,
      apiRoute: apiRouteType,
      method: methodType
    ) => {
      try {
        setLoading(true)
        const res = await action(userId, groupId, apiRoute, method)

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
                {showMemberModal && (
                  <Modal
                    heading="remove member"
                    action="confirm"
                    text={`Are you sure you want to remove ${member.username} from the group? All their personal data for this group will be lost.`}
                    onClick={async () =>
                      await handleAction(
                        removeUserFromGroup,
                        member.id,
                        groupId,
                        apiRoute,
                        method
                      )
                    }
                    onClickClose={() => setShowMemberModal(false)}
                  />
                )}
                <RemoveUserImage
                  className="remove w-6 h-6 lg:w-8 lg:h-8"
                  onClick={(e: Event) => {
                    e.stopPropagation()
                    setShowMemberModal(true)
                    setTimeout(() =>
                      document.getElementById("modal").showModal()
                    )
                  }}
                />
              </>
            )}
            {type === memberListItemType.groupRequest && (
              <>
                <AddUserImage
                  className="add-member w-6 h-6 lg:w-8 lg:h-8"
                  onClick={async (e: Event) => {
                    e.stopPropagation()
                    await handleAction(
                      approveUserToGroup,
                      member.id,
                      groupId,
                      apiRoute,
                      method
                    )
                  }}
                />
                <RemoveUserImage
                  className="remove w-6 h-6 lg:w-8 lg:h-8"
                  onClick={async (e: Event) => {
                    e.stopPropagation()
                    await handleAction(
                      declineUserToGroup,
                      member.id,
                      groupId,
                      apiRoute,
                      method
                    )
                  }}
                />
              </>
            )}
            {type === memberListItemType.addAdmin && (
              <>
                {showMemberModal && (
                  <Modal
                    heading="remove member"
                    action="confirm"
                    text={`Are you sure you want to make ${member.username} an admin of the group?`}
                    onClick={async () =>
                      await handleAction(
                        makeUserAdminOfGroup,
                        member.id,
                        groupId,
                        apiRoute,
                        method
                      )
                    }
                    onClickClose={() => setShowMemberModal(false)}
                  />
                )}
                <Unlock
                  className="add-admin size-6"
                  onClick={async (e: Event) => {
                    e.stopPropagation()
                    setShowMemberModal(true)
                    setTimeout(() =>
                      document.getElementById("modal").showModal()
                    )
                  }}
                />
              </>
            )}
          </div>
        )}

        {member.isAdmin && <Key className="size-6 text-error" />}
      </div>
    </li>
  )
}
export default MemberListItem
