//components
import Modal from "../modal/modal"
import Avatar from "../avatar/avatar"
import RemoveUserImage from "../svg/remove-user-image"
import AddUserImage from "../svg/add-user-image"
import Key from "../svg/key"
import Unlock from "../svg/unlock"

//react
import { useCallback, useState, type MouseEvent } from "react"

//next
import { useRouter } from "next/router"

//lib
import memberListItemType from "@/enums/member-list-item-types"
import { generateDisplayName, makeRequest, showModal } from "@/lib/utils"
import {
  approveUserToGroup,
  declineUserToGroup,
  makeUserAdminOfGroup,
  removeUserFromGroup,
} from "@/lib/api"
import clientRoute from "@/enums/client-route"
import apiRoute from "@/enums/api-route"
import method from "@/enums/http-method"

//types
import type {
  apiRouteType,
  makeRequestType,
  member,
  methodType,
  opponentData,
  showModalType,
  userGroupApiType,
} from "@/types"

type props = {
  member: member
  groupId: number
  onClick?: (() => void) | ((opponentData: opponentData) => void) | null
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
      makeRequest: makeRequestType,
      action: userGroupApiType,
      showModal: showModalType,
      userId: number,
      groupId: number,
      apiRoute: apiRouteType,
      method: methodType
    ) => {
      try {
        setLoading(true)
        const res: Awaited<Response> = await action(
          makeRequest,
          userId,
          groupId,
          apiRoute,
          method
        )

        if (res.ok) setActionSuccess(true)
        if (res.status === 409) setTimeout(() => showModal(), 100)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
        setShowMemberModal(false)
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
                        makeRequest,
                        removeUserFromGroup,
                        showModal,
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
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation()
                    setShowMemberModal(true)
                    setTimeout(() => showModal())
                  }}
                />
              </>
            )}
            {type === memberListItemType.groupRequest && (
              <>
                <Modal
                  heading="not allowed"
                  text={`${member.username} is already a member of 3 other groups. A user can be a member of a max. of 3 groups. The group request will be removed.`}
                  onClickClose={() => setActionSuccess(true)}
                />

                <AddUserImage
                  className="add-member w-6 h-6 lg:w-8 lg:h-8"
                  onClick={async (e: MouseEvent) => {
                    e.stopPropagation()
                    await handleAction(
                      makeRequest,
                      approveUserToGroup,
                      showModal,
                      member.id,
                      groupId,
                      apiRoute,
                      method
                    )
                  }}
                />
                <RemoveUserImage
                  className="remove w-6 h-6 lg:w-8 lg:h-8"
                  onClick={async (e: MouseEvent) => {
                    e.stopPropagation()
                    await handleAction(
                      makeRequest,
                      declineUserToGroup,
                      showModal,
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
                        makeRequest,
                        makeUserAdminOfGroup,
                        showModal,
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
                    setTimeout(() => showModal())
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
