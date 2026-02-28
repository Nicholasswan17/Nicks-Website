import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Nickchat from './pages/Nickchat'
import Navbar from './components/Navbar'
import './styles/global.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [activePage, setActivePage] = useState('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = session.user
        setUser({ name: u.user_metadata?.full_name || u.email.split('@')[0], email: u.email, id: u.id })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const u = session.user
        setUser({ name: u.user_metadata?.full_name || u.email.split('@')[0], email: u.email, id: u.id })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setShowLogin(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setActivePage('home')
  }

  if (showLogin) return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />
  if (!user) return <Landing onEnter={() => setShowLogin(true)} />

  const renderPage = () => {
    switch (activePage) {
      case 'nickchat': return <Nickchat user={user} />
      default: return <Dashboard user={user} onNavigate={setActivePage} />
    }
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} activePage={activePage} onNavigate={setActivePage} />
      {renderPage()}
    </div>
  )
}