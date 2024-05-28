const Toast = ({
  show,
  hide,
  text = "this is dummy text a paragraph long is too much to bare the wait of my shoulders in this escapade",
}) => {
  return (
    <div
      className={`notification ${show ? "notification--enter" : ""} ${
        hide ? "notification--exit" : ""
      } toast toast-top toast-end`}>
      <div className="text-center bg-accent max-w-60 text-wrap p-4 rounded-xl">
        <span>{text}</span>
      </div>
    </div>
  )
}

export default Toast
