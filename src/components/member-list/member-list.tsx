import { member } from "@/types"
import MemberListItem from "../member-list-item/member-list-item"
import memberListItemType from "@/src/lib/member-list-item-types"

type props = {
  heading?: string
  members: member[]
  groupId: number
  itemOnClick?: (() => void) | ((opponentData) => void) | null
  type?: memberListItemType
  className?: string
}

const MemberList = ({
  heading,
  members,
  groupId,
  itemOnClick,
  type,
  className,
}: props) => (
  <div className="w-full">
    <h2 className="text-2xl mb-4 capitalize">{heading}</h2>
    <ul className="join join-vertical bg-secondary w-full max-h-[350px] overflow-auto">
      {members.map(member => (
        <MemberListItem
          key={member.id}
          member={member}
          groupId={groupId}
          onClick={itemOnClick}
          type={type}
          className={className}
        />
      ))}
    </ul>
  </div>
)

export default MemberList
