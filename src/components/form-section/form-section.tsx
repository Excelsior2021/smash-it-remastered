import type { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"
import Input from "../input/input"

type props = {
  heading: string
  fields: any
  register: UseFormRegister<FieldValues>
  createAccountStore: any
  errors: FieldErrors<FieldValues>
}

const FormSection = ({
  heading,
  fields,
  register,
  createAccountStore,
  errors,
}: props) => (
  <div className="flex flex-col gap-6">
    <h2 className="text-2xl">{heading}</h2>
    {fields.map(field => (
      <div className="flex flex-col gap-1" key={field.name}>
        <Input
          key={field.name}
          {...field}
          className="input text-black"
          register={register}
          required={field.required}
          pattern={field.pattern}
          validate={field.validate}
          createAccountStore={createAccountStore}
        />
        {errors[field.name] ? (
          <p className="text-error">{errors[field.name]?.message}</p>
        ) : null}
      </div>
    ))}
  </div>
)

export default FormSection
