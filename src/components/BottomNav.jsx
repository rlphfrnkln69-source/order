import { ClipboardList, Receipt, Users, MoreHorizontal } from 'lucide-react'

const TABS = [
  { key: 'orders', label: 'Orders', icon: ClipboardList },
  { key: 'summary', label: 'Summary', icon: Receipt },
  { key: 'people', label: 'People', icon: Users },
  { key: 'more', label: 'More', icon: MoreHorizontal },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`bottom-nav-item ${active === key ? 'bottom-nav-item--active' : ''}`}
          onClick={() => onChange(key)}
        >
          <Icon size={20} strokeWidth={2} />
          <span className="bottom-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
