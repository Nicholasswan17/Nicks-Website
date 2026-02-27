import { useState } from 'react'
import '../styles/navbar.css'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',     path: '/' },
  { icon: '💪', label: 'Nickfit',  path: '/nickfit' },
  { icon: '🎬', label: 'Nickflix', path: '/nickflix' },
  { icon: '🏆', label: 'Nickbet',  path: '/nickbet' },
  { icon: '💬', label: 'Nickchat', path: '/nickchat' },
  { icon: '📁', label: 'Nickvault',path: '/nickvault' },
]

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('/')

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <button className="nav-logo" onClick={() => setActive('/')}>
          <img src="/NicktopiaLogoFinal.png" alt="Nicktopia" />
          <span>Nicktopia</span>
        </button>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`nav-link ${active === item.path ? 'active' : ''}`}
              onClick={() => setActive(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User area */}
        <div className="nav-user">
          <div className="nav-avatar" onClick={() => setOpen(o => !o)}>
            <img src="/CuteBruno.png" alt={user.name} />
            <span>{user.name}</span>
            <span className="nav-chevron">{open ? '▲' : '▼'}</span>
          </div>
          {open && (
            <div className="nav-dropdown">
              <button className="nav-drop-item">👤 Profile</button>
              <button className="nav-drop-item">⚙️ Settings</button>
              <div className="nav-drop-divider" />
              <button className="nav-drop-item danger" onClick={onLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`nav-mobile-link ${active === item.path ? 'active' : ''}`}
              onClick={() => { setActive(item.path); setOpen(false) }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <div className="nav-drop-divider" />
          <button className="nav-mobile-link danger" onClick={onLogout}>🚪 Logout</button>
        </div>
      )}
    </nav>
  )
}
