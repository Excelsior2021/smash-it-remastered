type props = {
  heading: string
  text: string
  onClick: () => {}
  action: string
}

const Modal = ({ heading, text, onClick, action }: props) => (
  <dialog id="modal" className="modal">
    <div className="modal-box bg-secondary">
      <h3 className="font-bold text-lg">{heading}</h3>
      <p className="py-4">{text}</p>
      <div className="modal-action">
        <form className="flex gap-4" method="dialog">
          <button onClick={onClick} className="btn">
            {action}
          </button>
          <button className="btn">Close</button>
        </form>
      </div>
    </div>
  </dialog>
)

export default Modal
