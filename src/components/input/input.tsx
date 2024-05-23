import { ChangeEventHandler } from "react"
import { FieldValues, UseFormRegister } from "react-hook-form"

type props = {
  label: string
  register: UseFormRegister<FieldValues>
  name: string
  className: string
  type: string
  required?: string | boolean
  pattern?: any
  validate?: any
  options?: any
  min?: number
  max?: number
  createAccountStore?: () => {}
  onChange?: ChangeEventHandler<HTMLInputElement>
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
  options,
  min,
  max,
  createAccountStore,
  onChange,
}: props) => {
  return (
    <>
      <label className="hidden" htmlFor={name}>
        {label}
      </label>
      {!createAccountStore && (
        <input
          {...register(name, { required, pattern, validate, min, max })}
          className={className}
          placeholder={label}
          type={type}
          min={min}
          max={max}
          onChange={onChange}
        />
      )}
      {createAccountStore && (
        <input
          {...register(name, { required, pattern, validate })}
          className={className}
          placeholder={label}
          type={type}
          value={
            createAccountStore ? createAccountStore.formState[name] : undefined
          }
          onChange={
            createAccountStore
              ? e => createAccountStore.updateState(name, e.currentTarget.value)
              : undefined
          }
        />
      )}
    </>
  )
}

export default Input
