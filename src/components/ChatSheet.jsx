import { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'

export default function ChatSheet({ messages, senderName, onSenderNameChange, onSend, onClose }) {
  const [draft, setDraft] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  function handleSend(e) {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    onSend(trimmed)
    setDraft('')
  }

  function handleSetName(e) {
    e.preventDefault()
    const trimmed = nameDraft.trim()
    if (!trimmed) return
    onSenderNameChange(trimmed)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--tall modal--chat" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <p style={{ margin: 0 }}>Chat</p>
          <button className="icon-btn" onClick={onClose} aria-label="Close chat">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {!senderName ? (
          <form className="chat-name-form" onSubmit={handleSetName}>
            <label className="field">
              <span>Your name, to chat</span>
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={40} autoFocus />
            </label>
            <button className="btn btn--primary btn--block" type="submit">Continue</button>
          </form>
        ) : (
          <>
            <div className="chat-messages" ref={listRef}>
              {messages.length === 0 && (
                <div className="muted center" style={{ padding: '20px 0' }}>No messages yet — say hi!</div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`chat-bubble ${m.sender_name === senderName ? 'chat-bubble--mine' : ''}`}>
                  {m.sender_name !== senderName && <div className="chat-bubble-name">{m.sender_name}</div>}
                  <div className="chat-bubble-body">{m.body}</div>
                </div>
              ))}
            </div>
            <form className="chat-input-row" onSubmit={handleSend}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                maxLength={300}
              />
              <button className="chat-send-btn" type="submit" aria-label="Send">
                <Send size={16} strokeWidth={2} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
