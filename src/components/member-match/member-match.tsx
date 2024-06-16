//components
import Avatar from "../avatar/avatar"
import Input from "../input/input"

//lib
import { generateDisplayName } from "@/src/lib/utils"

//types
import type { member } from "@/types"
import type {
  FieldValues,
  UseFormClearErrors,
  UseFormRegister,
} from "react-hook-form"

type props = {
  member: member
  register: UseFormRegister<FieldValues>
  inputLabel: string
  inputName: string
  clearErrors: UseFormClearErrors<FieldValues>
}

const MemberMatch = ({
  member,
  register,
  inputLabel,
  inputName,
  clearErrors,
}: props) => {
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-32 h-32">
        <Avatar />
      </div>

      <div className="text-center text-xl mb-4 p-1">
        <span>
          {generateDisplayName(
            member.username,
            member.firstName,
            member.lastName
          )}
        </span>
      </div>

      <Input
        className="text-black text-center p-2 rounded outline-none w-48"
        label={inputLabel}
        name={inputName}
        type="number"
        min={0}
        max={11}
        required={true}
        register={register}
        onChange={() => {
          clearErrors(inputName)
          clearErrors("invalidScores")
        }}
      />
    </div>
  )
}

export default MemberMatch
