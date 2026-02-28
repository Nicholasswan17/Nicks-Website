import { useState } from 'react'
import '../styles/navbar.css'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',      path: '/' },
  { icon: '💪', label: 'Nickfit',   path: '/nickfit' },
  { icon: '🎬', label: 'Nickflix',  path: '/nickflix' },
  { icon: '🏆', label: 'Nickbet',   path: '/nickbet' },
  { icon: '💬', label: 'Nickchat',  path: '/nickchat' },
  { icon: '📁', label: 'Nickvault', path: '/nickvault' },
]

export default function Navbar({ user, onLogout, activePage, onNavigate, avatarUrl }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('/')

  const navigate = (path, page) => {
    setActive(path)
    onNavigate(page)
    setOpen(false)
  }

  const name = user.displayName || user.name

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <button className="nav-logo" onClick={() => navigate('/', 'home')}>
          <img src="/NicktopiaLogoFinal.png" alt="Nicktopia" />
          <span>Nicktopia</span>
        </button>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              className={`nav-link ${active === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path, item.path.replace('/', '') || 'home')}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* User area */}
        <div className="nav-user">
          <div className="nav-avatar" onClick={() => setOpen(o => !o)}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="nav-avatar-img" />
            ) : (
              <div className="nav-avatar-initial">
                {name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <span>{name}</span>
            <span className="nav-chevron">{open ? '▲' : '▼'}</span>
          </div>
          {open && (
            <div className="nav-dropdown">
              <button className="nav-drop-item" onClick={() => navigate('/profile', 'profile')}>
                👤 Profile
              </button>
              <button className="nav-drop-item" onClick={() => navigate('/settings', 'settings')}>
                ⚙️ Settings
              </button>
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
              onClick={() => navigate(item.path, item.path.replace('/', '') || 'home')}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <div className="nav-drop-divider" />
          <button className="nav-mobile-link" onClick={() => navigate('/profile', 'profile')}>👤 Profile</button>
          <button className="nav-mobile-link" onClick={() => navigate('/settings', 'settings')}>⚙️ Settings</button>
          <div className="nav-drop-divider" />
          <button className="nav-mobile-link danger" onClick={onLogout}>🚪 Logout</button>
        </div>
      )}
    </nav>
  )
}