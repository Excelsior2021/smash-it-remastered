import Input from "../input/input"

import type { formField } from "@/types"
import type {
  FieldErrors,
  FieldValues,
  UseFormClearErrors,
  UseFormRegister,
} from "react-hook-form"
import Toggle from "../toggle/toggle"
import { useState } from "react"

type props = {
  heading: string
  fields: any
  register: UseFormRegister<FieldValues>
  createAccountStore: any
  errors: FieldErrors<FieldValues>
  clearErrors: UseFormClearErrors<FieldValues>
  disabled: boolean
  toggle?: boolean
}

const FormSection = ({
  heading,
  fields,
  register,
  createAccountStore,
  errors,
  clearErrors,
  disabled,
  toggle,
}: props) => {
  const [showPasswords, setShowPasswords] = useState(false)
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl">{heading}</h2>
      {fields.map((field: formField) => {
        if (field.name === "password" || field.name === "confirmPassword")
          field.type = showPasswords ? "text" : "password"
        return (
          <div className="flex flex-col gap-1" key={field.name}>
            <Input
              key={field.name}
              {...field}
              className="input text-black w-full"
              register={register}
              required={field.required}
              pattern={field.pattern}
              validate={field.validate}
              createAccountStore={createAccountStore}
              info={field.info}
              onChange={() => clearErrors(field.name)}
              disabled={disabled}
            />
            {errors[field.name] && (
              <>
                {Array.isArray(errors[field.name].message) ? (
                  errors[field.name].message.map((message, i) => (
                    <p key={i} className="text-error">
                      {message}
                    </p>
                  ))
                ) : (
                  <p className="text-error">{errors[field.name].message}</p>
                )}
              </>
            )}
          </div>
        )
      })}
      {toggle && (
        <Toggle
          text="show passwords"
          onChange={() => setShowPasswords(prev => !prev)}
        />
      )}
      {Object.keys(errors).length > 0 && (
        <p className="text-error">please check all sections for errors.</p>
      )}
    </div>
  )
}
export default FormSection
