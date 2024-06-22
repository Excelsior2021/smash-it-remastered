type props = {
  message: string
}

const ServerMessage = ({ message }: props) => (
  <p className="text-xl text-center">{message}</p>
)

export default ServerMessage
