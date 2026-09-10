import { Icon } from "./Icon";

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="toast" role="status"><span><Icon name="check" size={16} /></span>{message}</div>;
}
