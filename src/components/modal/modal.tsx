import ModalMatchData from "../modal-match-data/modal-match-data"

import type { matchData } from "@/types"

type props = {
  heading: string
  text?: string | null
  onClick: () => {}
  onClickClose: () => {}
  action?: string | null
  matchData?: matchData | null
  loading?: boolean
}

const Modal = ({
  heading,
  text,
  onClick,
  onClickClose,
  action,
  matchData,
  loading = false,
}: props) => (
  <dialog
    id="modal"
    className="modal"
    onClick={e => {
      e.stopPropagation()
    }}>
    <div className="modal-box bg-accent">
      <div className="border-b-2 pb-2">
        <h3 className="font-bold text-lg">{heading}</h3>
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
