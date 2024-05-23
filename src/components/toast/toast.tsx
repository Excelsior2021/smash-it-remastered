const Toast = ({ text }) => {
  return (
    <div className="hidden toast toast-top toast-end">
      <div className="text-center bg-accent max-w-60 text-wrap p-4 rounded-xl">
        <span>{text}</span>
      </div>
    </div>
  )
}

export default Toast
