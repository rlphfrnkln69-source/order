import { MessageCircle } from 'lucide-react'

export default function ChatButton({ unreadCount, onClick }) {
  return (
    <button className="chat-fab" onClick={onClick} aria-label="Open chat">
      <MessageCircle size={22} strokeWidth={2} />
      {unreadCount > 0 && (
        <span className="chat-fab-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
      )}
    </button>
  )
}
