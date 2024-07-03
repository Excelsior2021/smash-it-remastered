//components
import ModalMatchData from "../modal-match-data/modal-match-data"
import ModalGroupList from "../modal-group-list/modal-group-list"

//types
import type { matchData } from "@/types"
import type { MouseEventHandler, ReactNode } from "react"
import type { FieldErrors, FieldValues } from "react-hook-form"

type props = {
  heading: string
  headingCapitalize?: boolean
  text?: string | null
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
  onClickClose?: MouseEventHandler<HTMLButtonElement> | undefined
  action?: string | null
  matchData?: matchData | null
  accountFieldInput?: ReactNode
  loading?: boolean
  errors?: string[] | FieldErrors<FieldValues> | null
  groups?: string[] | null
}

const Modal = ({
  heading,
  headingCapitalize,
  text,
  onClick,
  onClickClose,
  action,
  matchData,
  accountFieldInput,
  loading = false,
  errors,
  groups,
}: props) => (
  <dialog
    id="modal"
    className="modal"
    onClick={e => {
      e.stopPropagation()
    }}>
    <div className="modal-box bg-accent">
      <div className="border-b-2 pb-2">
        <h3
          className={`font-bold text-lg ${headingCapitalize && "capitalize"}`}>
          {heading}
        </h3>
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <span className="loading loading-bars loading-lg"></span>
        </div>
      )}

      {!loading && (
        <>
          <p className="text-center text-lg py-4">{text}</p>
          {matchData && <ModalMatchData matchData={matchData} />}
          {accountFieldInput && <div>{accountFieldInput}</div>}
          {errors && (
            <ul>
              {errors.server.message.map((error, i) => (
                <li key={i}>
                  <p className="text-error">{error}</p>
                </li>
              ))}
            </ul>
          )}
          {groups && <ModalGroupList groups={groups} />}
          <div className="modal-action">
            <form className="flex gap-4" method="dialog">
              {action && (
                <button onClick={onClick} className="btn btn-secondary">
                  {action}
                </button>
              )}
              <button className="btn btn-secondary" onClick={onClickClose}>
                close
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  </dialog>
)

export default Modal
