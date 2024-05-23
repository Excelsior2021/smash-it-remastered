import userStore from "@/src/store/user"

const GroupSwitcher = () => {
  const { groups, activeGroup, setActiveGroup } = userStore(state => ({
    groups: state.groups,
    activeGroup: state.activeGroup,
    setActiveGroup: state.setActiveGroup,
  }))

  if (!groups || !activeGroup || groups.length < 2) return

  const changeGroup = e => {
    const group = groups.find(group => group.name === e.target.value)
    setActiveGroup(group)
  }

  return (
    <div
      className="flex items-center self-end mx-6 lg:fixed lg:bottom-12 lg:left-0"
      onClick={e => e.stopPropagation()}>
      <div className="p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-6 h-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      </div>

      <div>
        <label className="hidden" htmlFor="group">
          switch group:
        </label>
        <select
          defaultValue={activeGroup.name}
          name="group"
          className="select text-lg bg-secondary outline-none rounded-xl w-24 min-[380px]:w-44 p-2 cursor-pointer lg:bg-accent lg:w-28"
          onChange={changeGroup}>
          {groups.map(({ id, name }) => (
            <option key={id}>{name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default GroupSwitcher
