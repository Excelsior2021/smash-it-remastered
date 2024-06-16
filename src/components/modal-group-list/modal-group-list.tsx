type props = {
  groups: string[]
}

const ModalGroupList = ({ groups }: props) => (
  <ul className="flex flex-col gap-2 mt-6">
    {groups.map(group => (
      <li className="text-xl text-error list-disc ml-6" key={group}>
        {group}
      </li>
    ))}
  </ul>
)

export default ModalGroupList
