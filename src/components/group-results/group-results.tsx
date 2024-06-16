//components
import GroupQueryItem from "../group-query-item/group-query-item"

//types
import type { groupRequest, userGroup } from "@/types"

type props = {
  groups:
    | {
        id: number
        name: string
        _count: {
          stats: number
        }
      }[]
  userGroups: userGroup[]
  groupRequests: groupRequest[]
  userId: number
}

const GroupResults = ({ groups, userGroups, groupRequests, userId }: props) => {
  if (!groups) return
  if (groups.length === 0) return <p>no groups found</p>

  return (
    <div>
      <div className="flex flex-col text-center mb-6">
        <span className="text-2xl capitalize">results</span>
        <span> ({groups.length} groups found)</span>
      </div>

      <ul className="flex flex-col gap-6 max-h-[300px] overflow-auto">
        {groups.map(group => (
          <GroupQueryItem
            key={group.id}
            groupId={group.id}
            name={group.name}
            memberCount={group._count.stats}
            userGroups={userGroups}
            groupRequests={groupRequests}
            userId={userId}
          />
        ))}
      </ul>
    </div>
  )
}

export default GroupResults
