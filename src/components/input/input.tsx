//components
import InfoCircle from "../svg/infomation-circle"

//types
import type { ChangeEventHandler } from "react"
import type { FieldValues, UseFormRegister } from "react-hook-form"

type props = {
  label: string
  register: UseFormRegister<FieldValues>
  type: string
  name: string
  className: string
  required?: string | boolean
  pattern?: any
  validate?: any
  min?: number
  max?: number
  onChange?: ChangeEventHandler<HTMLInputElement>
  info?: string
  disabled?: boolean
}

const Input = ({
  label,
  register,
  name,
  className,
  type,
  required,
  pattern,
  validate,
  min,
  max,
  onChange,
  info,
  disabled,
}: props) => (
  <div className="relative">
    <label className="hidden" htmlFor={name}>
      {label}
    </label>

    <input
      {...register(name, { required, pattern, validate, min, max, disabled })}
      className={className}
      placeholder={label}
      type={type}
      min={min}
      max={max}
      onChange={onChange}
    />

    {info && (
      <div
        className="tooltip tooltip-secondary tooltip-left absolute top-4 -right-6 cursor-pointer"
        data-tip={info}>
        <InfoCircle className="size-5" />
      </div>
    )}
  </div>
)

export default Input
