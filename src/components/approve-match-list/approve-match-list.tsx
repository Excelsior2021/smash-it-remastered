import ApproveMatchItem from "../approve-match-item/approve-match-item"

const ApproveMatchList = ({ matchSubmissions }) => {
  return (
    <ul className="flex flex-col gap-4 max-h-[500px] overflow-y-auto">
      {matchSubmissions.map(match => (
        <ApproveMatchItem key={match.id} match={match} />
      ))}
    </ul>
  )
}

export default ApproveMatchList
