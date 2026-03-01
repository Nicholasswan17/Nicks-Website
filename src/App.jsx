import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Nickchat from './pages/Nickchat'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Navbar from './components/Navbar'
import './styles/global.css'
import Nickflix from './components/Nickflix'
import Nickfit from './components/Nickfit'

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('avatar_url, display_name')
    .eq('id', userId)
    .single()
  return data
}

export default function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [activePage, setActivePage] = useState('home')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [displayName, setDisplayName] = useState(null)
  const [isInCall, setIsInCall] = useState(false)

  const loadProfile = async (userId, fallbackName) => {
    const profile = await fetchProfile(userId)
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url)
    setDisplayName(profile?.display_name || fallbackName)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = session.user
        const fallback = u.user_metadata?.full_name || u.email.split('@')[0]
        const userData = { name: fallback, email: u.email, id: u.id }
        setUser(userData)
        loadProfile(u.id, fallback)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const u = session.user
        const fallback = u.user_metadata?.full_name || u.email.split('@')[0]
        const userData = { name: fallback, email: u.email, id: u.id }
        setUser(userData)
        loadProfile(u.id, fallback)
      } else {
        setUser(null)
        setAvatarUrl(null)
        setDisplayName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setShowLogin(false)
    loadProfile(userData.id, userData.name)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAvatarUrl(null)
    setDisplayName(null)
    setActivePage('home')
    setIsInCall(false)
  }

  if (showLogin) return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />
  if (!user) return <Landing onEnter={() => setShowLogin(true)} />

  const enrichedUser = { ...user, displayName: displayName || user.name }

  const renderPage = () => {
    switch (activePage) {
      case 'nickflix': return (
        <Nickflix user={enrichedUser} />
      )
      case 'nickfit': return (
  <Nickfit user={enrichedUser} />
)
      case 'nickchat': return (
        <Nickchat
          user={enrichedUser}
          avatarUrl={avatarUrl}
          onAvatarUpdate={setAvatarUrl}
          onInCallChange={setIsInCall}
        />
      )
      case 'profile': return (
        <Profile
          user={enrichedUser}
          avatarUrl={avatarUrl}
          onAvatarUpdate={setAvatarUrl}
          onDisplayNameUpdate={setDisplayName}
        />
      )
      case 'settings': return (
        <Settings user={enrichedUser} />
      )
      default: return (
        <Dashboard user={enrichedUser} onNavigate={setActivePage} />
      )
    }
  }

  return (
    <div className="app">
      <Navbar
        user={enrichedUser}
        onLogout={handleLogout}
        activePage={activePage}
        onNavigate={setActivePage}
        avatarUrl={avatarUrl}
        isInCall={isInCall}
      />
      {renderPage()}
    </div>
  )
}