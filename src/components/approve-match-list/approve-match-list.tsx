//component
import ApproveMatchItem from "../approve-match-item/approve-match-item"

//type
import type { matchSubmission } from "@/types"

type props = {
  matchSubmissions: matchSubmission[]
  adminUserId: number
}

const ApproveMatchList = ({ matchSubmissions, adminUserId }: props) => (
  <ul className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
    {matchSubmissions.map((matchSubmission: matchSubmission) => (
      <ApproveMatchItem
        key={matchSubmission.id}
        matchSubmission={matchSubmission}
        adminUserId={adminUserId}
      />
    ))}
  </ul>
)

export default ApproveMatchList
