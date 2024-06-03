import type { ChangeEventHandler } from "react"

type props = {
  text: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

const Toggle = ({ text, onChange }: props) => (
  <div className="form-control">
    <label className="label cursor-pointer">
      <span className="label-text capitalize text">{text}</span>
      <input
        type="checkbox"
        className="toggle toggle-secondary toggle-sm"
        onChange={onChange}
      />
    </label>
  </div>
)

export default Toggle
