import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import './styles/global.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

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
  }

  if (showLogin) return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />
  if (!user) return <Landing onEnter={() => setShowLogin(true)} />

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />
      <Dashboard user={user} />
    </div>
  )
}